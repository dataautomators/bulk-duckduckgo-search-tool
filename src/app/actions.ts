import axios from 'axios';
import { load } from 'cheerio';

const fetchData = async (query: string) => {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  const options = {
    method: 'GET',
    url: 'https://api.scrapeautomate.com/scraper',
    params: {
      apiKey: '5420e899-f524-40d1-a264-c07d1db5cf8d',
      render: 'true',
      url: url
    }
  };

  try {
    const { data } = await axios.request(options);
    const $ = load(data);

    // Extract the first result title and additional information
    const firstResult = $('#links .result').first();
    const firstResultTitle = firstResult.find('.result__title').text().trim();
    const firstResultSnippet = firstResult.find('.result__snippet').text().trim();
    const firstResultUrl = firstResult.find('.result__url').text().trim();

    return { 
      query, 
      result: {
        title: firstResultTitle,
        snippet: firstResultSnippet,
        url: firstResultUrl
      }, 
      status: "Success" 
    };
  } catch (error) {
    console.error(error);
    return { query, result: null, status: "Error" };
  }
};





fetchData(' Mohammad Oli Ahad ').then(console.log);

export { fetchData };