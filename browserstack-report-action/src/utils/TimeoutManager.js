class TimeoutManager {
  constructor(timeoutSeconds) {
    this.timeoutMs = timeoutSeconds * 1000;
    this.startTime = Date.now();
  }

  check() {
    if (Date.now() - this.startTime >= this.timeoutMs) {
      throw new Error(`Operation timed out after ${this.timeoutMs / 1000} seconds`);
    }
  }
}

module.exports = TimeoutManager;
