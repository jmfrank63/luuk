const static = require("./handlers/static");
const htmxWeather = require("./handlers/htmx");
const apiWeather = require("./handlers/api");
const rateLimitMiddleware = require("./middleware/ratelimit");

const routes = {
  "/": static,
  "/js/htmx.min.js": static,
  "/weather": htmxWeather,
  "/api/weather": rateLimitMiddleware(apiWeather),
};

module.exports = routes;
