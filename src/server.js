const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const RateLimiter = require("./ratelimit");
const { fetchLocationData } = require("./location");
const html_weather = require("./handlers/htmx_weather");

const rateLimiter = new RateLimiter(1, 10); // tokens per second, max tokens

// const routeHandlers = {
//   "/html/js/htmx.min.js": rateLimitMiddleware(handleHtmxJs),
//   "/html/weather": rateLimitMiddleware(handleHtmlWeather),
//   "/": rateLimitMiddleware(handleRoot),
//   "/api/weather": rateLimitMiddleware(handleApiWeather),
// };

const server = http.createServer(async (req, res) => {
  const requestUrl = url.parse(req.url, true);
  if (req.url === "/html/js/htmx.min.js") {
    const filePath = path.join(__dirname, "../html/js/htmx.min.js");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading htmx.min.js");
      } else {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });
  } else if (requestUrl.pathname === "/html/weather" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on("end", async () => {
      const params = new URLSearchParams(body);
      const location = params.get("location");
      const utc = 11;
      const username = process.env.GEO_USERNAME || "demo";
      html_weather(req, res, location, utc, username);
    });
  } else if (requestUrl.pathname === "/") {
    fs.readFile(
      path.join(__dirname, "../html/index.html"),
      "utf8",
      async (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end("Error loading index.html");
        } else {
          // Fetch the weather data for Moscow
          const locationData = await fetchLocationData("Moscow");
          // Generate the forecast HTML
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
              forecastHtml += `<li>${keys[i]}: ${dayData.temperature}°C, wind ${dayData.windSpeed}m/s</li>`;
            }
          }
          forecastHtml += "</ul>";

          // Insert the forecast HTML into the index.html
          const html = data.replace(
            "<!-- The forecast data will be inserted here -->",
            forecastHtml
          );

          // Send the response
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        }
      }
    );
  } else if (requestUrl.pathname === "/api/weather") {
    if (rateLimiter.consume()) {
      // Handle the API call
      try {
        const locationData = await fetchLocationData(requestUrl.query.location);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(locationData));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Internal Server Error",
            error: error.toString(),
          })
        );
      }
    } else {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Too many requests" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not found" }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
