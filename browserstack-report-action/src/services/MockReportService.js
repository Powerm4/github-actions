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
<html>
<head>
  <title>Build Insights</title>
</head>
<body>

  <h2>Build Insights</h2>

  <table border="1">
    <tr>
      <th align="center">All</th>
      <th align="center">Passed</th>
      <th align="center">Failed</th>
      <th align="center">Skipped</th>
      <th align="center">Unknown</th>
    </tr>
    <tr>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests" target="_blank">5</a></td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&status=passed" target="_blank">2</a></td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&status=failed" target="_blank">2</a></td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&status=skipped" target="_blank">1</a></td>
      <td align="center">0</td>
    </tr>
  </table>

  <br>

  <table border="1">
    <tr>
      <td align="center">New Failures</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
    <tr>
      <td align="center">Always Failing</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
    <tr>
      <td align="center">Flaky Test</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
    <tr>
      <td align="center">Muted Tests</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
    <tr>
      <td align="center">Unique Errors</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
    <tr>
      <td align="center">Performance Anomaly</td>
      <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights" target="_blank">View</a></td>
    </tr>
  </table>
  <br>
  Note: To check the metrics above, either click on view or increase report generation timeout setting as per <a href=”https://www.browserstack.com/docs/automate/selenium/jenkins ?” target=”_blank”>documentation</a>.

  <h2>Test List</h2>

  <table border="1">
    <thead>
      <tr>
        <th align="center">Test Name</th>
        <th align="center">Status</th>
        <th align="center">Test History</th>
        <th align="center">Browser/Device</th>
        <th align="center">OS</th>
        <th align="center">Duration</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&details=1327748286" target="_blank">Refresh API User token - Step not defined</a></td>
        <td align="center">Skipped</td>
        <td align="center"><a href="https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&details=1327748286" target="_blank">View History</a></td>
        <td align="center">Chrome 135</td>
        <td align="center">OS X</td>
        <td align="center">92s</td>
      </tr>
      <tr>
        <td><a href="#">Delete Account via API - Step Pending</a></td>
        <td align="center">Failed</td>
        <td align="center"><a href="#">View History</a></td>
        <td align="center">Google Pixel 7</td>
        <td align="center">Android 12</td>
        <td align="center">180s</td>
      </tr>
      <tr>
        <td><a href="#">BStack Demo API</a></td>
        <td align="center">Passed</td>
        <td align="center"><a href="#">View History</a></td>
        <td align="center">Samsung Galaxy Tab S8</td>
        <td align="center">Android 12</td>
        <td align="center">134s</td>
      </tr>
      <tr>
        <td><a href="#">Verify API Create Account (fred, password789)</a></td>
        <td align="center">Failed</td>
        <td align="center"><a href="#">View History</a></td>
        <td align="center">iPhone 14 Pro</td>
        <td align="center">iOS 15.5</td>
        <td align="center">221s</td>
      </tr>
      <tr>
        <td><a href="#">Verify API User Address</a></td>
        <td align="center">Passed</td>
        <td align="center"><a href="#">View History</a></td>
        <td align="center">Chrome 135</td>
        <td align="center">Windows 11</td>
        <td align="center">102s</td>
      </tr>
    </tbody>
  </table>

</body>
</html>
        `
      }
    };
  }
}

module.exports = new MockReportService(); // Export singleton instance
