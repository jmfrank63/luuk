const https = require("https");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const test = require("node:test");
const { getWeatherData } = require("../src/core/weather.js");

// Save the original https.get function
const originalHttpsGet = https.get;

test("getWeatherData", async () => {
  // Read the mock data from disk
  const rawMockData = fs.readFileSync(
    path.join(__dirname, "test_responses/mock-weather-response.raw"),
    "utf8"
  );

  // Mock the https.get function
  https.get = (_url, options, callback) => {
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

  expectedData = {
    "2024-05-02": {
      time: "2024-05-02T11:00:00.000Z",
      localTime: "6:00:00 PM",
      temperature: 2.7,
      windSpeed: 7,
      windDirection: 168.8,
    },
    "2024-05-03": {
      time: "2024-05-03T11:00:00.000Z",
      localTime: "6:00:00 PM",
      temperature: 5.6,
      windSpeed: 2.5,
      windDirection: 307.8,
    },
    "2024-05-04": {
      time: "2024-05-04T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 12,
      windSpeed: 4.9,
      windDirection: 90,
    },
    "2024-05-05": {
      time: "2024-05-05T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 16,
      windSpeed: 6.6,
      windDirection: 200.8,
    },
    "2024-05-06": {
      time: "2024-05-06T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 10.9,
      windSpeed: 4.9,
      windDirection: 267.5,
    },
    "2024-05-07": {
      time: "2024-05-07T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 12.3,
      windSpeed: 1.6,
      windDirection: 97.6,
    },
    "2024-05-08": {
      time: "2024-05-08T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 16.7,
      windSpeed: 1.4,
      windDirection: 119.1,
    },
    "2024-05-09": {
      time: "2024-05-09T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 20.7,
      windSpeed: 3.7,
      windDirection: 139.1,
    },
    "2024-05-10": {
      time: "2024-05-10T12:00:00.000Z",
      localTime: "7:00:00 PM",
      temperature: 17.9,
      windSpeed: 5.4,
      windDirection: 229.2,
    },
  };

  const weatherData = await getWeatherData(mockLocationData);

  for (const date in expectedData) {
    assert.strictEqual(weatherData[date].time, expectedData[date].time);
    assert.strictEqual(weatherData[date].localTime, expectedData[date].localTime);
    assert.strictEqual(weatherData[date].temperature, expectedData[date].temperature);
    assert.strictEqual(weatherData[date].windSpeed, expectedData[date].windSpeed);
    assert.strictEqual(weatherData[date].windDirection, expectedData[date].windDirection);
  }
  
  // Restore the original https.get function
  https.get = originalHttpsGet;
});

test("getNearestHour", async () => {
  const { getNearestHour } = require("../src/core/weather.js");

  const testCases = [
    { input: 0, expected: 0 },
    { input: 1, expected: 0 },
    { input: 5, expected: 6 },
    { input: 6, expected: 6 },
    { input: 7, expected: 6 },
    { input: 11, expected: 12 },
    { input: 12, expected: 12 },
    { input: 13, expected: 12 },
    { input: 17, expected: 18 },
    { input: 18, expected: 18 },
    { input: 19, expected: 18 },
    { input: 23, expected: 0 },
    { input: 24, expected: 0 },
  ];

  testCases.forEach((testCase) => {
    const { input, expected } = testCase;
    const result = getNearestHour(input);
    assert.strictEqual(result, expected);
  });
});
