const { describe, it } = require('node:test');
const assert = require('assert');
const RateLimiter = require('../src/middleware/ratelimiter');

describe('RateLimiter', function() {
  it('should allow initial request', function() {
    const rateLimiter = new RateLimiter(1, 1);
    assert(rateLimiter.consume());
  });

  it('should deny request when limit exceeded', function() {
    const rateLimiter = new RateLimiter(1, 1);
    rateLimiter.consume();
    assert(!rateLimiter.consume());
  });

  it('should allow request after sufficient time has passed', function() {
    const rateLimiter = new RateLimiter(1, 1);
    rateLimiter.consume();
    return new Promise((resolve) => {
      setTimeout(() => {
        assert(rateLimiter.consume());
        resolve();
      }, 1000);
    });
  });
});
