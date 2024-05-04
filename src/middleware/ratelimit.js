const RateLimiter = require("./ratelimiter");
const { RATE_LIMIT, MAX_TOKENS } = require("../consts");

const rateLimiter = new RateLimiter(RATE_LIMIT, MAX_TOKENS);

function rateLimitMiddleware(handler) {
  return async function(req, res) {
    if (!rateLimiter.consume()) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Too Many Requests" }));
      return;
    }
    await handler(req, res);
  };
}

module.exports = rateLimitMiddleware;
