class TimeManager {
  constructor(timeoutSeconds) {
    this.timeoutMs = timeoutSeconds * 1000;
    this.startTime = Date.now();
  }

  checkTimeout() {
    if (Date.now() - this.startTime >= this.timeoutMs) {
      throw new Error(`Operation timed out after ${this.timeoutMs / 1000} seconds`);
    }
  }

  /**
   * Sleep for specified seconds
   * @param {number} seconds - Number of seconds to sleep
   * @returns {Promise} - Promise that resolves after the specified time
   */
  static async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}

module.exports = TimeManager;
