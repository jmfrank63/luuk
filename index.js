const http = require("http");
const https = require("https");
const querystring = require("querystring");

function fetchWeatherData(location, username, utc_hour) {
  const encodedLocation = querystring.escape(location);

  // Use the GeoNames Search API to search for the location
  const geonamesSearchOptions = {
    hostname: "api.geonames.org",
    path: `/searchJSON?q=${encodedLocation}&maxRows=3&username=${username}`,
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
      const geonameId = locationResponse.geonames[0].geonameId;

      // Use the GeoNames API to get the location details
      const geonamesDetailsOptions = {
        hostname: "api.geonames.org",
        path: `/getJSON?geonameId=${geonameId}&username=${username}`,
        method: "GET",
        headers: { Accept: "application/json" },
      };

      const geonamesDetailsReq = http.request(geonamesDetailsOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const locationResponse = JSON.parse(data);
          const latitude = locationResponse.lat;
          const longitude = locationResponse.lng;
          const altitude = locationResponse.srtm3;

          // Call the weather API with the location details for the exact hour
          const weatherOptions = {
            hostname: "api.met.no",
            path: `/weatherapi/locationforecast/2.0/compact?altitude=${altitude}&lat=${latitude}&lon=${longitude}`,
            method: "GET",
            headers: {
              Accept: "application/json",
              "User-Agent": "Luuk-Weather-Demo/1.0",
            },
          };

          const weatherReq = https.request(weatherOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              const weatherResponse = JSON.parse(data);
              // Extract and format the required weather data...
              const util = require("util");

              console.log(
                util.inspect(weatherResponse, { depth: null, colors: true })
              );
            });
          });

          weatherReq.on("error", (error) => {
            console.error(error);
          });

          weatherReq.end();
        });
      });

      geonamesDetailsReq.on("error", (error) => {
        console.error(error);
      });

      geonamesDetailsReq.end();
    });
  });

  geonamesSearchReq.on("error", (error) => {
    console.error(error);
  });

  geonamesSearchReq.end();
}

const geoUsername = process.env.GEO_USERNAME || "demo";
fetchWeatherData("Moscow", geoUsername, "14");
