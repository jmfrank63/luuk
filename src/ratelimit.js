class RateLimiter {
  constructor(tokensPerSecond, maxTokens) {
    this.tokensPerSecond = tokensPerSecond;
    this.maxTokens = maxTokens;
    this.currentTokens = maxTokens;
    this.lastRefillTimestamp = Date.now();
  }

  consume() {
    const now = Date.now();
    this.refillTokens(now);

    if (this.currentTokens < 1) {
      return false;
    }

    this.currentTokens -= 1;
    return true;
  }

  refillTokens(now) {
    const elapsedTime = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsedTime * this.tokensPerSecond / 1000;
    this.currentTokens = Math.min(this.currentTokens + tokensToAdd, this.maxTokens);
    this.lastRefillTimestamp = now;
  }
}

module.exports = RateLimiter;
