const test = require("node:test");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

test("htmx_weather", async () => {
  const location = require("../src/core/location.js");

  // Save original fetchLocationWeather function
  const originalfetchLocationWeather = location.fetchLocationWeather;

  // Mock the fetchLocationWeather function
  location.fetchLocationWeather = async () => {
    const rawWeatherResponse = fs.readFileSync(
      path.join(
        __dirname,
        "test_responses/mock-fetch-location-data-response.raw"
      ),
      "utf8"
    );
    return JSON.parse(rawWeatherResponse);
  };

  const htmx_weather = require("../src/handlers/htmx.js");

  const req = {
    url: "/?location=Tomsk",
    headers: {
      host: "localhost",
    },
  };

  let responseData = null;
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function (code) {
      this.statusCode = code;
      return this; // for chaining
    },
    json: function (body) {
      this.body = body;
      return this; // for chaining
    },
    send: function (body) {
      this.body = body;
      return this; // for chaining
    },
    end: function (data) {
      responseData = data;
    },
    setHeader: function (name, value) {
      this.headers[name] = value;
    },
    writeHead: function (statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = Object.assign(this.headers, headers);
    },
  };

  await htmx_weather(req, res);
  expectedHtml = `
      <h1>Tomsk, Russia</h1>
      <p>Latitude: 56.4977, Longitude: 84.9744</p>
<p>Altitude: 117 m, UTC Hour: 11, DST Offset: 7</p>
      <ul>
    <li>2024-05-04 1:00:00AM 9.5°C, Wind 5.1m/s Direction 114.7</li>
<li>2024-05-05 1:00:00AM 16°C, Wind 6.1m/s Direction 249.5</li>
<li>2024-05-06 2:00:00AM 9.5°C, Wind 5.2m/s Direction 254.2</li>
<li>2024-05-07 2:00:00AM 12.1°C, Wind 2.8m/s Direction 165.5</li>
<li>2024-05-08 2:00:00AM 13°C, Wind 3.9m/s Direction 335.2</li>
<li>2024-05-09 2:00:00AM 13.4°C, Wind 2.6m/s Direction 79.4</li>
<li>2024-05-10 2:00:00AM 17.6°C, Wind 2.4m/s Direction 87</li>
<li>2024-05-11 2:00:00AM 16.6°C, Wind 2.6m/s Direction 349.6</li>
<li>2024-05-12 2:00:00AM 15.4°C, Wind 1.7m/s Direction 266.6</li>
</ul>`;
  assert.strictEqual(responseData, expectedHtml);

  // Restore the original fetchLocationWeather function
  location.fetchLocationWeather = originalfetchLocationWeather;
});
