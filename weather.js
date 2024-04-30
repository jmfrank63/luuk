const https = require("https");

function getWeatherData(locationData) {
  return new Promise((resolve, reject) => {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=${locationData.altitude}&lat=${locationData.latitude}&lon=${locationData.longitude}`;
    const options = {
      headers: {
        "User-Agent": "Luuk/WeatherAppDemo 1.0.0",
      },
    };

    https
      .get(url, options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const parsedData = JSON.parse(data);
          const dailyData = {};

          parsedData.properties.timeseries.forEach((item) => {
            const date = new Date(item.time);
            const day = date.getUTCDate().toString().padStart(2, "0");
            const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are 0-based in JS
            const year = date.getUTCFullYear();
            const dateString = `${year}-${month}-${day}`;

            if (!dailyData[dateString]) {
              dailyData[dateString] = [];
            }

            dailyData[dateString].push({
              time: item.time,
              temperature: item.data.instant.details.air_temperature,
              windSpeed: item.data.instant.details.wind_speed,
              windDirection: item.data.instant.details.wind_from_direction,
            });
          });

          resolve(dailyData);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = getWeatherData;
