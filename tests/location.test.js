const test = require("node:test");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { getGeonameId, getGeonameIdData } = require("../src/location.js"); // Assuming getGeonameId is exported from another module

test("getGeonameId", async () => {
  // Save the original http.get function
  const originalHttpGet = http.get;

  const rawMockData = fs.readFileSync(
    path.join(
      __dirname,
      "test_responses/mock-get-geoname-id-by-location-response.raw"
    ),
    "utf8"
  );
  // Mock the http.get function
  http.get = (_url, options, callback) => {
    // Check if options is a function (for the case where http.get is called with two arguments)
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
  };

  // Call getGeonameId and check the result
  const geonameId = await getGeonameId("Tomsk");
  assert.strictEqual(geonameId, 1489425);

  // Restore the original http.get function
  http.get = originalHttpGet;
});

test("getGeonameIdData", async () => {
  // Save the original http.get function
  const originalHttpGet = http.get;

  const rawMockData = fs.readFileSync(
    path.join(
      __dirname,
      "test_responses/mock-location-details-by-geoname-id-response.raw"
    ),
    "utf8"
  );

  // Mock the http.get function
  http.get = (_url, options, callback) => {
    // Check if options is a function (for the case where http.get is called with two arguments)
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
  };

  // Call getGeonameIdData and check the result
  const geonameIdData = await getGeonameIdData(1489425, 11);
  assert.deepStrictEqual(geonameIdData, {
    location: "Tomsk",
    country: "Russia",
    latitude: 56.4977,
    longitude: 84.9744,
    altitude: 117,
    utc_hour: 11,
    dstOffset: 7,
  });

  // Restore the original http.get function
  http.get = originalHttpGet;
});

