const static = require("./handlers/static");
const htmxWeather = require("./handlers/htmx");
const apiWeather = require("./handlers/api");

const routes = {
  "/": static,
  "/js/htmx.min.js": static,
  "/weather": htmxWeather,
  "/api/weather": apiWeather,
};

module.exports = routes;
