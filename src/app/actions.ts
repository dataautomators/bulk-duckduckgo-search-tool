"use server";
import prisma from "@/scraper/prisma";
import { jobQueue } from "@/scraper/queue";
import * as zod from "zod";

const searchSchema = zod.object({
  queries: zod.array(zod.string().nonempty("Query cannot be empty")),
  fingerprint: zod.string().nonempty("Fingerprint cannot be empty"),
});

const getSearches = async (fingerprint: string, page: number, pageSize: number = 10) => {
  if (!fingerprint) {
    return { error: "Fingerprint is required" };
  }

  const pageNumber = page || 1;

  try {
    const [searches, totalCount, pendingCount, completedCount, failedCount] = await Promise.all([
      prisma.search.findMany({
        where: {
          userFingerprints: {
            some: {
              fingerprint,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.search.count({
        where: {
          userFingerprints: {
            some: {
              fingerprint,
            },
          },
        },
      }),
      prisma.search.count({
        where: {
          userFingerprints: {
            some: {
              fingerprint,
            },
          },
          status: "PENDING",
        },
      }),
      prisma.search.count({
        where: {
          userFingerprints: {
            some: {
              fingerprint,
            },
          },
          status: "COMPLETED",
        },
      }),
      prisma.search.count({
        where: {
          userFingerprints: {
            some: {
              fingerprint,
            },
          },
          status: "FAILED",
        },
      }),
    ]);

    console.log("Fetched searches:", searches.map(s => s.results));

    return {
      searches: searches || [],
      meta: { totalCount: totalCount || 0, page: pageNumber, pageSize },
      counts: { pendingCount: pendingCount || 0, completedCount: completedCount || 0, failedCount: failedCount || 0 },
    };
  } catch (error) {
    console.error("Error fetching searches:", error);
    return { error: "Failed to fetch searches" };
  }
};

const addSearches = async (searches: { queries: string[]; fingerprint: string }) => {
  const validQueries = searchSchema.safeParse(searches);

  if (!validQueries.success) {
    return { error: validQueries.error.errors.map(e => e.message).join(", ") };
  }

  const { queries, fingerprint } = validQueries.data;

  let userFingerprint = await prisma.fingerprint.findUnique({
    where: { fingerprint },
  });

  if (!userFingerprint) {
    userFingerprint = await prisma.fingerprint.create({
      data: { fingerprint },
    });
  }

  for (const query of queries) {
    await addSearch({ query, fingerprintId: userFingerprint.id });
  }

};



const addSearch = async (searchData: { query: string; fingerprintId: string }) => {
  if (!searchData || !searchData.query || !searchData.fingerprintId) {
    throw new TypeError('The "search" argument must be an object with "query" and "fingerprintId" properties.');
  }

  try {
    const existingSearch = await prisma.search.findFirst({
      where: {
        query: searchData.query,
        userFingerprints: {
          some: {
            id: searchData.fingerprintId,
          },
        },
      },
    });

    if (existingSearch?.status === "COMPLETED") return; // No need to add again if already completed

    if (existingSearch?.status === "FAILED") {
      await prisma.search.update({
        where: { id: existingSearch.id },
        data: { status: "PENDING", failedMessage: null, failedAttempts: 0 },
      });
    }

    let searchId = existingSearch?.id;

    if (!searchId) {
      const newSearch = await prisma.search.create({
        data: {
          query: searchData.query,
          results: [], // Initialize results as an empty array or however you want to handle it
          userFingerprints: { connect: { id: searchData.fingerprintId } }, // Connect to the existing fingerprint
        },
      });
      searchId = newSearch.id;
    }

    await jobQueue.add("search", { id: searchId });
  } catch (error) {
    console.error("Error adding search:", error);
    throw new Error("Failed to add search");
  }
};


const disconnectSearchesByFingerprint = async (fingerprint: string) => {
  try {
    const userFingerprint = await prisma.fingerprint.findUnique({
      where: { fingerprint },
      include: { searches: true }, // Include searches to disconnect
    });

    if (userFingerprint) {
      await Promise.all(
        userFingerprint.searches.map(async (search) => {
          await prisma.search.update({
            where: { id: search.id },
            data: {
              userFingerprints: {
                disconnect: { id: userFingerprint.id },
              },
            },
          });
        })
      );
      console.log(`Searches disconnected from fingerprint: ${fingerprint}`);
    }
  } catch (error) {
    console.error("Error disconnecting searches by fingerprint:", error);
    throw new Error("Failed to disconnect searches by fingerprint");
  }
};

const disconnectSearchByID = async (searchId: string) => {
  try {
    const search = await prisma.search.findUnique({
      where: { id: searchId },
      include: { userFingerprints: true },
    });

    if (search) {
      await prisma.search.update({
        where: { id: searchId },
        data: {
          userFingerprints: {
            disconnect: search.userFingerprints.map(fingerprint => ({ id: fingerprint.id })), // Disconnect all associated fingerprints
          },
        },
      });
      console.log(`Search with ID ${searchId} disconnected from all fingerprints.`);
    } else {
      console.log(`No search found with ID: ${searchId}`);
    }
  } catch (error) {
    console.error("Error disconnecting search by ID:", error);
    throw new Error("Failed to disconnect search");
  }
};

export {
  getSearches,
  addSearches,
  addSearch,
  disconnectSearchesByFingerprint,
  disconnectSearchByID,
};