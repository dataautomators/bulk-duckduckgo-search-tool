import axios from 'axios';
import { load } from 'cheerio';

const fetchData = async (query) => {
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

    // Extracting information
    const firstResult = $('.yuRUbf').first(); // Adjusted selector for results
    const title = firstResult.find('h3.LC20lb').text().trim();
    const link = firstResult.find('a').attr('href'); // Extract URL directly from <a>
    
    // Extract description (if available)
    const description = firstResult.closest('.kb0PBd').find('.VwiC3b').text().trim();

    return { 
      query, 
      result: {
        title,
        description,
        url: link
      }, 
      status: "Success" 
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { query, result: null, status: "Error", message: error.message };
  }
};

// Example usage
fetchData('Oli Ahmad').then(console.log);

export { fetchData };
