const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const fetchLocationData = require('../src/location');
const fetchGeoNameIdData = require('../src/location');

// Load the mock data from disk
const mockLocationData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/mock-location-data.json'), 'utf8'));
const mockGeoNameIdData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/mock-geoname-id-data.json'), 'utf8'));

// Overwrite the get function in the http module
http.get = function(options, callback) {
  // Check the path in the options to determine which mock data to return
  if (options.path.includes('searchJSON')) {
    process.nextTick(() => callback({
      on: function(event, cb) {
        if (event === 'data') {
          cb(JSON.stringify(mockLocationData));
        }
        if (event === 'end') {
          cb();
        }
      }
    }));
  } else if (options.path.includes('timezoneJSON')) {
    process.nextTick(() => callback({
      on: function(event, cb) {
        if (event === 'data') {
          cb(JSON.stringify(mockGeoNameIdData));
        }
        if (event === 'end') {
          cb();
        }
      }
    }));
  }
};

// Test fetchLocationData
fetchLocationData('Tomsk', '11', 'jmfrank63').then((locationData) => {
  assert.strictEqual(locationData.location, 'Tomsk');
  assert.strictEqual(locationData.country, 'Russia');
  assert.strictEqual(locationData.latitude, 56.49771);
  assert.strictEqual(locationData.longitude, 84.97437);
  assert.strictEqual(locationData.altitude, 156);
  assert.strictEqual(locationData.utc_hour, '11');
  assert.strictEqual(locationData.dstOffset, 3);
}).catch((error) => {
  console.error(`fetchLocationData failed: ${error}`);
});

// Test fetchGeoNameIdData
fetchGeoNameIdData(1489425).then((geoNameIdData) => {
  assert.strictEqual(geoNameIdData.geonameId, 1489425);
  assert.strictEqual(geoNameIdData.timezoneId, 'Europe/Moscow');
  assert.strictEqual(geoNameIdData.dstOffset, 3);
}).catch((error) => {
  console.error(`fetchGeoNameIdData failed: ${error}`);
});
