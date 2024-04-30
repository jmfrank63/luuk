const http = require("http");
const https = require("https");
const querystring = require("querystring");
const getWeatherData = require('./weather.js');

function fetchLocationData(
  location = "Moscow",
  utc_hour = "11",
  username = "jmfrank63"
) {
  return new Promise((resolve, reject) => {
    const encodedLocation = querystring.escape(location);

    // Use the GeoNames Search API to search for the location
    const geonamesSearchOptions = {
      hostname: "api.geonames.org",
      path: `/searchJSON?q=${encodedLocation}&maxRows=1&username=${username}`,
      method: "GET",
      headers: { Accept: "application/json" },
    };

    const geonamesSearchReq = http.request(geonamesSearchOptions, (res) => {
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
          reject(new Error(`No results found for location "${location}"`));
          return;
        }

        const geonameId = locationResponse.geonames[0].geonameId;

        // Use the GeoNames API to get the location details
        const geonamesDetailsOptions = {
          hostname: "api.geonames.org",
          path: `/getJSON?geonameId=${geonameId}&username=${username}`,
          method: "GET",
          headers: { Accept: "application/json" },
        };

        const geonamesDetailsReq = http.request(
          geonamesDetailsOptions,
          (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              const locationDetails = JSON.parse(data);

              // Use the location details to get the location data
              // You can replace this with your actual code to get the location data
              const locationData = {
                location: locationDetails.name,
                country: locationDetails.countryName,
                latitude: locationDetails.lat,
                longitude: locationDetails.lng,
                altitude: locationDetails.srtm3,
                utc_hour: utc_hour,
                dstOffset: locationDetails.timezone.dstOffset,
              };
              getWeatherData(locationData).then((weatherData) => {
                const combinedData = {
                  ...locationData,
                  ...weatherData
                };
                resolve(combinedData);
              });
            });
          }
        );

        geonamesDetailsReq.on("error", (err) => {
          reject(err);
        });

        geonamesDetailsReq.end();
      });
    });

    geonamesSearchReq.on("error", (err) => {
      reject(err);
    });

    geonamesSearchReq.end();
  });
}

module.exports = fetchLocationData;
// const geoUsername = process.env.GEO_USERNAME || "demo";
// fetchWeatherData("Moscow", geoUsername, "11");
