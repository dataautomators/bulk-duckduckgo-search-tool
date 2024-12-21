import puppeteer, { Browser } from "puppeteer";

export class ScraperError extends Error {}

let browser: Browser | null = null;

const initializeBrowser = async () => {
  if (browser) {
    return browser;
  }
  browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browser;
};

// const closeBrowser = async () => {
//   if (browser) {
//     await browser.close();
//     browser = null;
//   }
// };

export const fetchData = async (query: string) => {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    const formattedQuery = encodeURIComponent(query);
    await page.goto(`https://duckduckgo.com/?q=${formattedQuery}`);

    await page.waitForSelector('a[data-testid="result-title-a"]');
    const result = (await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('a[data-testid="result-title-a"]')
      );
      return links.map((link) => link.textContent);
    })) as string[];
    await page.close();
    return result;
  } catch (error) {
    console.error(error);
    throw new ScraperError("Failed to fetch data");
  }
};
