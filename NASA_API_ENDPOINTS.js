// 🚀 NASA API Endpoints for Space Habitat Layout Creator
// Replace your placeholder URLs with these real NASA APIs

export const NASA_API_ENDPOINTS = {
  // 1. Core NASA API (Already implemented)
  NASA_BASE: 'https://api.nasa.gov',
  
  // 2. Habitat-Relevant APIs
  TECH_TRANSFER: 'https://api.nasa.gov/techtransfer/patent',
  MARS_WEATHER: 'https://api.nasa.gov/insight_weather/',
  NEO_FEED: 'https://api.nasa.gov/neo/rest/v1/feed',
  APOD: 'https://api.nasa.gov/planetary/apod',
  
  // 3. Mission Data APIs
  ISS_LOCATION: 'http://api.open-notify.org/iss-now.json',
  SPACE_WEATHER: 'https://api.nasa.gov/DONKI/CME',
  PLANETARY_DATA: 'https://api.nasa.gov/planetary/earth/imagery',
  
  // 4. Educational & Media APIs
  NASA_IMAGES: 'https://images-api.nasa.gov/search',
  NASA_VIDEO: 'https://images-api.nasa.gov/search?media_type=video',
  
  // 5. Advanced Research APIs
  EXOPLANET_ARCHIVE: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync',
  EARTH_DATA: 'https://appeears.earthdatacloud.nasa.gov/api/v1',
};

// Sample API calls you can implement:

// 1. Get NASA Patents Related to Space Habitats
// GET https://api.nasa.gov/techtransfer/patent?engine&api_key=YOUR_KEY

// 2. Get Mars Environmental Data
// GET https://api.nasa.gov/insight_weather/?api_key=YOUR_KEY&feedtype=json&ver=1.0

// 3. Get Space Technology Images
// GET https://images-api.nasa.gov/search?q=space%20habitat&media_type=image

// 4. Get ISS Real-time Position
// GET http://api.open-notify.org/iss-now.json

// 5. Get Daily Space Content
// GET https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY