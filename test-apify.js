import 'dotenv/config';

async function test() {
  const APIFY_TOKEN = process.env.VITE_APIFY_TOKEN;
  console.log('Token exists:', !!APIFY_TOKEN);
  
  const encodedActorId = 'compass~google-maps-scraper';
  const input = {
    searchStringsArray: ["contractor near 2840 Pacific Avenue San Francisco"],
    locationQuery: "San Francisco, CA",
    maxCrawledPlacesPerSearch: 5,
    language: "en",
    includeWebResults: false,
    maxImages: 0,
    maxReviews: 0,
    onlyDataFromSearchPage: false
  };

  const res = await fetch(`https://api.apify.com/v2/acts/${encodedActorId}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}

test();
