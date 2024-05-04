const { fetchLocationData } = require("../core/location");

async function weather(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let location;
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const params = new URLSearchParams(body);
      location = params.get("location");
      await sendResponse(location, req, res);
    });
  } else {
    location = requestUrl.searchParams.get("location");
    await sendResponse(location, req, res);
  }
}

async function sendResponse(location, req, res) {
  try {
    const locationData = await fetchLocationData(location);
    let forecastHtml = `
      <h1>${locationData.location}, ${locationData.country}</h1>
      <p>Latitude: ${locationData.latitude}, Longitude: ${locationData.longitude}</p>
      <p>Altitude: ${locationData.altitude}m, UTC Hour: ${locationData.utc_hour}, DST Offset: ${locationData.dstOffset}</p>
      <ul>
    `;
    const keys = Object.keys(locationData);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith("2024")) {
        // Check if the key represents a date
        const dayData = locationData[keys[i]];
        forecastHtml += `<li>${keys[i]}: ${dayData.temperature}°C, wind ${dayData.windSpeed}m/s</li>\n`;
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
