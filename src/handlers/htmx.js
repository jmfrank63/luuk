const { fetchLocationWeather } = require("../core/location");

async function weather(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let location;
  let utc_hour;
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const params = new URLSearchParams(body);
      location = params.get("location");
      utc_hour = params.get("utc_hour");
      await sendResponse(location, utc_hour, req, res);
    });
  } else {
    location = requestUrl.searchParams.get("location");
    utc_hour = requestUrl.searchParams.get("utc_hour");
    await sendResponse(location, utc_hour, req, res);
  }
}

async function sendResponse(location, utc_hour, req, res) {
  try {
    const locationData = await fetchLocationWeather(location, utc_hour);
    if (locationData.error) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<p>Location: ${locationData.error}</p>`);
      return;
    }
    let country;
    if (locationData.country === undefined) {
      country = ""
    } else {
      country = ", " + locationData.country;
    }
    let forecastHtml = `
      <h1>${locationData.location}${country}</h1>
      <p>Latitude: ${locationData.latitude !== undefined ? locationData.latitude : '- '}, Longitude: ${locationData.longitude !== undefined ? locationData.longitude : '- '}</p>
<p>Altitude: ${locationData.altitude !== undefined ? locationData.altitude + ' m' : '- '}, UTC Hour: ${locationData.utc_hour !== undefined ? locationData.utc_hour : '- '}, DST Offset: ${locationData.dstOffset !== undefined ? locationData.dstOffset : '- '}</p>
      <ul>
    `;
    const keys = Object.keys(locationData);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith("2024")) {
        // Check if the key represents a date
        const dayData = locationData[keys[i]];
        forecastHtml += `<li>${keys[i]} ${dayData.localTime} ${dayData.temperature}°C, Wind ${dayData.windSpeed}m/s Direction ${dayData.windDirection}</li>\n`;
      }
    }
    forecastHtml += "</ul>";
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(forecastHtml);
  } catch (error) {
    console.error("Error fetching location data:", error);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end("<p>Error loading weather data</p>");
  }
}

module.exports = weather;
