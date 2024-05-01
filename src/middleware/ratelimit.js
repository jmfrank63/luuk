const rateLimiter = new RateLimiter(1, 10); // tokens per second, max tokens

function rateLimitMiddleware(handler) {
  return async function(req, res) {
    const clientIp = req.connection.remoteAddress;
    if (!rateLimiter.tryRemoveTokens(1, clientIp)) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Too Many Requests" }));
      return;
    }

    // Call the handler function
    await handler(req, res);
  };
}

module.exports = rateLimitMiddleware;
