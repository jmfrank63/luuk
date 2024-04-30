const http = require('http');
const url = require('url');
const fetchLocationData = require('./location');

const server = http.createServer((req, res) => {
  const queryParameters = url.parse(req.url, true).query;

  const location = queryParameters.location;
  const time = queryParameters.time;
  const username = queryParameters.username;

  fetchLocationData(location, time, username)
    .then(data => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    })
    .catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
