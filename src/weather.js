const https = require("https");

function getNearestHour(hour) {
  const hours = [0, 6, 12, 18, 24];
  let nearestHour = hours[0];
  let smallestDifference = Math.abs(hour - nearestHour);

  for (let i = 1; i < hours.length; i++) {
    const difference = Math.abs(hour - hours[i]);
    if (difference < smallestDifference) {
      nearestHour = hours[i];
      smallestDifference = difference;
    }
  }

  return nearestHour;
}

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
          const availableHours = parsedData.properties.timeseries.map((item) =>
            new Date(item.time).getUTCHours()
          );
          const nearestHour = availableHours.includes(locationData.utc_hour)
            ? locationData.utc_hour
            : getNearestHour(locationData.utc_hour, availableHours);
          let dailyData = {};
          for (let i = 0; i < 2; i++) {
            const iterationData = {};
            parsedData.properties.timeseries.forEach((item) => {
              const date = new Date(item.time);
              const hour = date.getUTCHours();

              if (hour === Number(locationData.utc_hour) && i === 0) {
                const dateKey = date.toISOString().split("T")[0];
                const localTime = new Date(item.time);
                localTime.setHours(
                  localTime.getHours() + locationData.dstOffset
                );
                iterationData[dateKey] = {
                  time: localTime.toISOString(),
                  localTime: localTime.toLocaleTimeString(),
                  temperature: item.data.instant.details.air_temperature,
                  windSpeed: item.data.instant.details.wind_speed,
                  windDirection: item.data.instant.details.wind_from_direction,
                };
              }
              if (hour === Number(nearestHour) && i === 1) {
                const dateKey = date.toISOString().split("T")[0];
                if (!dailyData.hasOwnProperty(dateKey)) {
                  const localTime = new Date(item.time);
                  localTime.setHours(
                    localTime.getHours() + locationData.dstOffset
                  );
                  iterationData[dateKey] = {
                    time: localTime.toISOString(),
                    localTime: localTime.toLocaleTimeString(),
                    temperature: item.data.instant.details.air_temperature,
                    windSpeed: item.data.instant.details.wind_speed,
                    windDirection:
                      item.data.instant.details.wind_from_direction,
                  };
                }
              }
            });
            dailyData = { ...dailyData, ...iterationData };
          }
          resolve(dailyData);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = {
  getNearestHour,
  getWeatherData,
};
