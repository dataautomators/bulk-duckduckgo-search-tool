"use server";

import prisma from "@/scraper/prisma";
import { jobQueue } from "@/scraper/queue";
import * as zod from "zod";

const searchSchema = zod.object({
  queries: zod.array(zod.string({ message: "Query cannot be empty" })),
  fingerprint: zod.string(),
});

export const getSearches = async (fingerprint: string) => {
  if (!fingerprint) {
    return { error: "Fingerprint is required" };
  }

  const searches = await prisma.search.findMany({
    where: {
      userFingerprints: {
        has: fingerprint,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return searches;
};

export const addSearches = async (searches: {
  queries: string[];
  fingerprint: string;
}) => {
  // validate the search queries
  const validQueries = searchSchema.safeParse(searches);

  if (!validQueries.success) {
    return { error: validQueries.error.errors.join(", ") };
  }

  const { queries, fingerprint } = validQueries.data;

  for (const query of queries) {
    addSearch({ query, fingerprint });
  }
};

const addSearch = async (search: { query: string; fingerprint: string }) => {
  //find or create a search
  const existingSearch = await prisma.search.findFirst({
    where: {
      query: search.query,
    },
  });

  if (existingSearch?.status === "COMPLETED") {
    if (existingSearch.userFingerprints.includes(search.fingerprint)) return;

    // add the fingerprint to the search
    await prisma.search.update({
      where: {
        id: existingSearch.id,
      },
      data: {
        userFingerprints: {
          push: search.fingerprint,
        },
      },
    });
    return;
  }

  if (existingSearch?.status === "FAILED") {
    // reset the search status
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
        userFingerprints: [search.fingerprint],
      },
    });
    searchId = newSearch.id;
  }

  await jobQueue.add("search", { id: searchId });
};
