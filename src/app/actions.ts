"use server";

import { connection } from "@/lib/redis";
import prisma from "@/scraper/prisma";
import { jobQueue } from "@/scraper/queue";
import * as zod from "zod";

const searchSchema = zod.object({
  queries: zod.array(zod.string({ message: "Query cannot be empty" })),
  fingerprint: zod.string(),
});

const getSearches = async (
  fingerprint: string,
  page: number,
  pageSize: number = 10
) => {
  if (!fingerprint) {
    return { error: "Fingerprint is required" };
  }

  const pageNumber = page || 1;

  const [searches, totalCount, pendingCount, completedCount, failedCount] = await Promise.all([
    prisma.search.findMany({
      where: {
        fingerprints: {
          some: {
            fingerprint: fingerprint,
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
        fingerprints: {
          some: {
            fingerprint: fingerprint,
          },
        },
      },
    }),
    prisma.search.count({
      where: {
        fingerprints: {
          some: {
            fingerprint: fingerprint,
          },
        },
        status: "PENDING",
      },
    }),
    prisma.search.count({
      where: {
        fingerprints: {
          some: {
            fingerprint: fingerprint,
          },
        },
        status: "COMPLETED",
      },
    }),
    prisma.search.count({
      where: {
        fingerprints: {
          some: {
            fingerprint: fingerprint,
          },
        },
        status: "FAILED",
      },
    }),
  ]);

  return { searches, meta: { totalCount, page: pageNumber, pageSize }, counts: { pendingCount, completedCount, failedCount } };
};

const addSearches = async (searches: {
  queries: string[];
  fingerprint: string;
}) => {
  const validQueries = searchSchema.safeParse(searches);

  if (!validQueries.success) {
    return { error: validQueries.error.errors.join(", ") };
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

  // Cache the user and searches for 1 day
  await connection.setex(fingerprint, 86400, JSON.stringify({ userFingerprint, searches }));
};

const addSearch = async (search: { query: string; fingerprintId: string }) => {
  if (!search || !search.query || !search.fingerprintId) {
    throw new TypeError('The "search" argument must be an object with "query" and "fingerprintId" properties.');
  }

  const existingSearch = await prisma.search.findFirst({
    where: {
      query: search.query,
      fingerprints: {
        some: {
          id: search.fingerprintId,
        },
      },
    },
  });

  if (existingSearch?.status === "COMPLETED") {
    return;
  }

  if (existingSearch?.status === "FAILED") {
    await prisma.search.update({
      where: {
        id: existingSearch.id,
      },
      data: {
        status: "PENDING",
        failedMessage: null,
        failedAttempts: 0,
      },
    });
  }

  let searchId = existingSearch?.id;

  if (!searchId) {
    const newSearch = await prisma.search.create({
      data: {
        query: search.query,
        fingerprints: {
          connect: { id: search.fingerprintId },
        },
      },
    });
    searchId = newSearch.id;
  }

  await jobQueue.add("search", { id: searchId });
};

const deleteSearchesByFingerprint = async (fingerprint: string) => {
  const userFingerprint = await prisma.fingerprint.findUnique({
    where: { fingerprint },
  });

  if (userFingerprint) {
    await prisma.search.deleteMany({
      where: {
        fingerprints: {
          some: {
            id: userFingerprint.id,
          },
        },
      },
    });

    await prisma.fingerprint.delete({
      where: {
        id: userFingerprint.id,
      },
    });

    // Clear the cache
    await connection.del(fingerprint);
  }
};

const deleteSearchById = async (searchId: string) => {
  await prisma.search.delete({
    where: { id: searchId },
  });
};

export {
  getSearches,
  addSearches,
  addSearch,
  deleteSearchesByFingerprint,
  deleteSearchById,
};