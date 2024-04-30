const http = require('http');
const url = require('url');
const RateLimiter = require('./ratelimit');
const fetchLocationData = require('./location');

const rateLimiter = new RateLimiter(1, 10); // tokens per second, max tokens

const server = http.createServer(async (req, res) => {
  const requestUrl = url.parse(req.url, true);

  if (requestUrl.pathname === '/api/weather') {
    if (rateLimiter.consume()) {
      // Handle the API call
      try {
        const locationData = await fetchLocationData(requestUrl.query.location);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(locationData));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }));
      }
    } else {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Too many requests' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
