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
        user: {
          fingerprint: fingerprint,
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
        user: {
          fingerprint: fingerprint,
        },
      },
    }),
    prisma.search.count({
      where: {
        user: {
          fingerprint: fingerprint,
        },
        status: "PENDING",
      },
    }),
    prisma.search.count({
      where: {
        user: {
          fingerprint: fingerprint,
        },
        status: "COMPLETED",
      },
    }),
    prisma.search.count({
      where: {
        user: {
          fingerprint: fingerprint,
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

  let user = await prisma.user.findUnique({
    where: { fingerprint },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { fingerprint },
    });
  }

  for (const query of queries) {
    await addSearch({ query, fingerprint, userId: user.id });
  }

  // Cache the user and searches for 1 day
  await connection.setex(fingerprint, 86400, JSON.stringify({ user, searches }));
};

const addSearch = async (search: { query: string; fingerprint: string; userId: string }) => {
  const existingSearch = await prisma.search.findFirst({
    where: {
      query: search.query,
      userId: search.userId,
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
        userId: search.userId,
      },
    });
    searchId = newSearch.id;
  }

  await jobQueue.add("search", { id: searchId });
};

const deleteSearchesByFingerprint = async (fingerprint: string) => {
  const user = await prisma.user.findUnique({
    where: { fingerprint },
  });

  if (user) {
    await prisma.search.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: user.id,
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