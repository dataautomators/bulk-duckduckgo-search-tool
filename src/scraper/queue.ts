import { connection } from "@/lib/redis";
import prisma from "@/scraper/prisma";
import { Job, Queue, Worker } from "bullmq";
import { fetchData, ScraperError } from "./scrape-data";

export const jobQueue = new Queue<{ id: string }>("scraper", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const worker = new Worker(
  "scraper",
  async (job: Job<{ id: string }>) => {
    const { id } = job.data;

    try {
      console.log(`Processing job ${job.id}`);

      const search = await prisma.search.findUnique({
        where: {
          id: id,
        },
      });

      if (!search) {
        throw new ScraperError("Search not found");
      }

      const resultData = await fetchData(search.query);

      if (!resultData) {
        throw new ScraperError("Failed to fetch data");
      }

      if (!Array.isArray(resultData)) {
        throw new ScraperError("Invalid result data format");
      }

      await prisma.search.update({
        where: {
          id: id,
        },
        data: {
          results: resultData,
          status: "COMPLETED",
        },
      });
      console.log(`Job ${job.id} completed`);
    } catch (error) {
      await prisma.search.update({
        where: {
          id: id,
        },
        data: {
          status: "FAILED",
          failedMessage:
            error instanceof ScraperError
              ? error.message
              : "Internal Server Error",
          failedAttempts: {
            increment: 1,
          },
        },
      });

      if (error instanceof Error) {
        console.error(`Job ${job.id} failed with error: ${error.message}`);
      }
      throw error;
    }
  },
  { connection }
);
