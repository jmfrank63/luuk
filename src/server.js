const http = require("http");
const { URL } = require("url");
const { HOSTNAME, PORT } = require("./consts");
const notFound = require("./handlers/notFound");
const routes = require("./routes");
const static = require("./handlers/static");

const hostname = process.env.HOSTNAME || HOSTNAME;
const port = process.env.PORT || PORT;

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const handler = routes[requestUrl.pathname] || static;
  console.log(`[${new Date().toISOString()}] ${req.method} ${requestUrl.pathname}`);
  handler(req, res, () => {
    notFound(req, res);
  });
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] Response status code: ${res.statusCode}`);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
