const { fetchLocationWeather } = require("../core/location");

async function apiWeather(req, res) {
  // use WHATWG
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  // API is GET
  let location = requestUrl.searchParams.get("location");
  let utc_hour = requestUrl.searchParams.get("utc_hour");
  try {
    const locationData = await fetchLocationWeather(location, utc_hour);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(locationData));
    res.end();
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.write(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.toString(),
      })
    );
    res.end();
  }
}

module.exports = apiWeather;
