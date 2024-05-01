const https = require("https");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { getWeatherData, getNearestHour } = require("../src/weather.js");

// Save the original https.get function
const originalHttpsGet = https.get;

function testGetNearestHour() {
  assert.strictEqual(getNearestHour(0), 0);
  assert.strictEqual(getNearestHour(2), 0);
  assert.strictEqual(getNearestHour(5), 6);
  assert.strictEqual(getNearestHour(8), 6);
  assert.strictEqual(getNearestHour(14), 12);
  assert.strictEqual(getNearestHour(20), 18);
  assert.strictEqual(getNearestHour(23), 24);
  assert.strictEqual(getNearestHour(24), 24);
  console.log("getNearestHour test passed");
}

function testGetWeatherData() {
  // Read the mock data from disk
  const rawMockData = fs.readFileSync(
    path.join(__dirname, "mock-weather-data.raw"),
    "utf8"
  );
  const mockData = JSON.parse(rawMockData);

  // Mock the https.get function
  https.get = (url, options, callback) => {
    // Check if options is a function (for the case where https.get is called with two arguments)
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    const mockResponse = {
      on: (event, eventCallback) => {
        if (event === "data") {
          // Call the eventCallback with the mock data
          eventCallback(rawMockData);
        } else if (event === "end") {
          // Call the eventCallback to signal that all data has been sent
          eventCallback();
        }
      },
    };

    // Call the callback with the mock response
    callback(mockResponse);

    return { on: () => {} }; // Return an object with an empty on method to avoid errors
  };

  const mockLocationData = {
    location: "Tomsk",
    country: "Russia",
    latitude: 56.4977,
    longitude: 84.9744,
    altitude: 117,
    utc_hour: "11",
    dstOffset: 7,
  };

  getWeatherData(mockLocationData).then((weatherData) => {
    // Get the current date and format it in the same way as your data
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`;

    // Assert that the weather data for the current date is correct
    assert.deepStrictEqual(weatherData[formattedDate], mockData[formattedDate]);

    // Get the temperature, windSpeed and windDirection values for the 2nd of May from weatherData
    const temperature = weatherData["2024-05-02"].temperature;
    const windSpeed = weatherData["2024-05-02"].windSpeed;
    const windDirection = weatherData["2024-05-02"].windDirection;

    // Check if the temperature is 2.7 degrees
    assert(
      temperature === 2.7,
      `Temperature on the 2nd of May at 18:00 is not 2.7 degrees, it's ${temperature} degrees`
    );

    // Check if the wind speed is 7
    assert(
      windSpeed === 7,
      `Wind speed on the 2nd of May at 18:00 is not 7, it's ${windSpeed}`
    );

    // Check if the wind direction is 168.8
    assert(
      windDirection === 168.8,
      `Wind direction on the 2nd of May at 18:00 is not 168.8, it's ${windDirection}`
    );
    // Restore the original https.get function
    https.get = originalHttpsGet;

    console.log("getWeatherData test passed");
  });
}

testGetNearestHour();
testGetWeatherData();
