const http = require("http");
const querystring = require("querystring");
const { getWeatherData } = require("./weather.js");
const { GEO_USERNAME } = require("../consts.js");

function getGeonameId(location = "Moscow") {
  const username = process.env.GEO_USERNAME || GEO_USERNAME;
  return new Promise((resolve, reject) => {
    const encodedLocation = querystring.escape(location);

    // Use the GeoNames Search API to search for the location
    const geonamesSearchOptions = {
      hostname: "api.geonames.org",
      path: `/searchJSON?q=${encodedLocation}&maxRows=1&username=${username}`,
      headers: { Accept: "application/json" },
    };

    const geonamesSearchReq = http.get(geonamesSearchOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const locationResponse = JSON.parse(data);
        if (
          !locationResponse.geonames ||
          locationResponse.geonames.length === 0
        ) {
          resolve(`${location} not found`);
          return;
        }

        resolve(locationResponse.geonames[0].geonameId);
      });
    });

    geonamesSearchReq.on("error", (err) => {
      reject(err);
    });
  });
}

function getGeonameIdData(geonameId, utc_hour) {
  const username = process.env.GEO_USERNAME || GEO_USERNAME;
  return new Promise((resolve, reject) => {
    const geonamesDetailsOptions = {
      hostname: "api.geonames.org",
      path: `/getJSON?geonameId=${geonameId}&username=${username}`,
      method: "GET",
      headers: { Accept: "application/json" },
    };

    const geonamesDetailsReq = http.get(geonamesDetailsOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const locationDetails = JSON.parse(data);
        // Use the location details to get the location data
        let altitude = locationDetails.srtm3;
        if (altitude < 0) {
          altitude = 0;
        }
        // Use the location details to get the location data
        const locationData = {
          location: locationDetails.name,
          country: locationDetails.countryName,
          latitude: parseFloat((+locationDetails.lat).toFixed(4)),
          longitude: parseFloat((+locationDetails.lng).toFixed(4)),
          altitude: altitude,
          utc_hour: utc_hour,
          dstOffset: locationDetails.timezone.dstOffset,
        };
        resolve(locationData);
      });
    });

    geonamesDetailsReq.on("error", (err) => {
      reject(err);
    });
  });
}

async function fetchLocationWeather(location, utc_hour = "11") {
  const geonameId = await getGeonameId(location);
  if (typeof geonameId === 'string' && geonameId.includes("not found")) {
    return { error: geonameId };
  }
  // Use the GeoNames API to get the location details
  const locationData = await getGeonameIdData(geonameId, utc_hour);
  // Get the weather data
  const weatherData = await getWeatherData(locationData);

  // Combine the location and weather data
  const combinedData = {
    ...locationData,
    ...weatherData,
  };
  return combinedData;
}

module.exports = { getGeonameId, getGeonameIdData, fetchLocationWeather };
