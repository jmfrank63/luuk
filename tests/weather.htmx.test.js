const test = require("node:test");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

test("htmx_weather", async () => {
  const location = require("../src/core/location.js");

  // Save original fetchLocationData function
  const originalFetchLocationData = location.fetchLocationData;

  // Mock the fetchLocationData function
  location.fetchLocationData = async () => {
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
    url: '/?location=Tomsk',
    headers: {
      host: 'localhost'
    }
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
      <p>Altitude: 117m, UTC Hour: 11, DST Offset: 7</p>
      <ul>
    <li>2024-05-04: 9.5°C, wind 5.1m/s</li>
<li>2024-05-05: 16°C, wind 6.1m/s</li>
<li>2024-05-06: 9.5°C, wind 5.2m/s</li>
<li>2024-05-07: 12.1°C, wind 2.8m/s</li>
<li>2024-05-08: 13°C, wind 3.9m/s</li>
<li>2024-05-09: 13.4°C, wind 2.6m/s</li>
<li>2024-05-10: 17.6°C, wind 2.4m/s</li>
<li>2024-05-11: 16.6°C, wind 2.6m/s</li>
<li>2024-05-12: 15.4°C, wind 1.7m/s</li>
</ul>`;
  assert.strictEqual(responseData, expectedHtml);
  
  // Restore the original fetchLocationData function
  location.fetchLocationData = originalFetchLocationData;
});
