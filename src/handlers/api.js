const { fetchLocationData } = require("../core/location");

async function apiWeather(req, res) {
  // use WHATWG
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  // API is GET
  let location = requestUrl.searchParams.get("location");
  try {
    const locationData = await fetchLocationData(location);
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
