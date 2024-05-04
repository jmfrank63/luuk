const fs = require("fs");
const path = require("path");


function serve(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading ${filePath}`);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
};

function static(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath;
  if (requestUrl.pathname === '/') {
    filePath = path.join(__dirname, "..", "..", "html", "index.html");
  } else {
    filePath = path.join(__dirname, "..", "..", "html", requestUrl.pathname);
  }
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  serve(res, filePath, contentType);
}

module.exports = static;
