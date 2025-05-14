'use strict';

class MockReportService {
  constructor() {
    this.pollCount = 0;
    this.shouldFail = false;
    this.customResponse = null;
  }

  setCustomResponse(response) {
    this.customResponse = response;
  }

  setShouldFail(fail) {
    this.shouldFail = fail;
  }

  reset() {
    this.pollCount = 0;
    this.shouldFail = false;
    this.customResponse = null;
  }

  getMockResponse() {
    if (this.customResponse) {
      return this.customResponse;
    }

    this.pollCount++;

    // Simulate different scenarios based on poll count
    if (this.shouldFail) {
      return {
        report_status: 'ERROR',
        report: {
          basic_html: '<pre>Error: Mock API Error</pre>'
        }
      };
    }

    if (this.pollCount === 1) {
      // First call returns configuration
      return {
        report_status: 'IN_PROGRESS',
        retry_count: 3,
        polling_interval: 1, // 1 second for faster tests
        build_uuid: 'mock-build-123',
        report: {
          basic_html: '<pre>Build found, generating report...</pre>'
        }
      };
    }

    if (this.pollCount < 3) {
      // Still processing
      return {
        report_status: 'IN_PROGRESS',
        build_uuid: 'mock-build-123',
        report: {
          basic_html: '<pre>Report generation in progress... Attempt ' + this.pollCount + '</pre>'
        }
      };
    }

    // Success after 3 polls
    return {
      report_status: 'COMPLETED',
      build_uuid: 'mock-build-123',
      report: {
        basic_html: `
          <div class="report-content">
            <h2>Test Results</h2>
            <p>Total Tests: 10</p>
            <p>Passed: 8</p>
            <p>Failed: 1</p>
            <p>Skipped: 1</p>
            <div class="test-details">
              <h3>Failed Tests</h3>
              <pre>Test 'login_test' failed: Element not found</pre>
            </div>
          </div>
        `
      }
    };
  }
}

module.exports = new MockReportService(); // Export singleton instance
