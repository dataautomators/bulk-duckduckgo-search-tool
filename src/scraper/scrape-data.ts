import puppeteer, { Browser } from "puppeteer";

export class ScraperError extends Error {}

export const fetchData = async (query: string) => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
