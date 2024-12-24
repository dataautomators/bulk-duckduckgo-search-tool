"use server";

import { connection } from "@/lib/redis";
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

    return { searches, meta: { totalCount, page: pageNumber, pageSize }, counts: { pendingCount, completedCount, failedCount } };
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


  await connection.setex(fingerprint, 86400, JSON.stringify({ userFingerprint, searches }));
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


const deleteSearchesByFingerprint = async (fingerprint:string) => {
  try {
    const userFingerprint = await prisma.fingerprint.findUnique({
      where:{ fingerprint }
    });

    if (userFingerprint) {
      await prisma.search.deleteMany({
        where:{
          userFingerprints:{
            some:{
              id:userFingerprint.id
            }
          }
        }
      });

      await prisma.fingerprint.delete({
        where:{
          id:userFingerprint.id
        }
      });

      // Clear the cache
      await connection.del(fingerprint);
    }
  } catch (error) {
    console.error("Error deleting searches by fingerprint:", error);
    throw new Error("Failed to delete searches by fingerprint");
  }
};


const deleteSearchById = async (searchId:string) => {
   try {
     await prisma.search.delete({
       where:{ id : searchId }
     });
   } catch (error) {
     console.error("Error deleting search by ID:", error);
     throw new Error("Failed to delete search");
   }
};

export {
   getSearches,
   addSearches,
   addSearch,
   deleteSearchesByFingerprint,
   deleteSearchById,
};
