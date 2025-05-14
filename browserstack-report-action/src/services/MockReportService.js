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
        `,
        rich_html: `<body>

    <h2>Build Insights</h2>

    <div class="grid-container">
        <div class="metric-card">
            <h1>5</h1>
            <p>All</p>
        </div>
        <div class="metric-card passed">
            <h1>2</h1>
            <p>Passed</p>
        </div>
        <div class="metric-card failed">
            <h1>2</h1>
            <p>Failed</p>
        </div>
        <div class="metric-card skipped">
            <h1>1</h1>
            <p>Skipped</p>
        </div>
        <div class="metric-card unknown">
            <h1>0</h1>
            <p>Unknown</p>
        </div>
    </div>

    <div class="grid-metrics">
        <div class="metric-box">
            <h2>New Failures</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
        <div class="metric-box">
            <h2>Always Failing</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
        <div class="metric-box">
            <h2>Flaky Test</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
        <div class="metric-box">
            <h2>Muted Tests</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
        <div class="metric-box">
            <h2>Unique Errors</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
        <div class="metric-box">
            <h2>Performance Anomaly</h2>
            <h4><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=insights>" target="_blank">View</a></h4>
        </div>
    </div>

    <div class="w3-panel w3-light-grey w3-border w3-round">
        <p>Note: Click view or add report timeout in plugin settings to see build insights above.</p>
    </div>
    <br>

    <h2>Test List</h2>

    <table>
        <thead>
            <tr>
                <th>Test Name</th>
                <th>Status</th>
                <th>Test History</th>
                <th>Browser/Device</th>
                <th>OS</th>
                <th>Duration</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="test-link"><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&details=1327748286>" target="_blank">Refresh API User token - Step not defined</a></td>
                <td class="status-skipped">Skipped</td>
                <td class="test-history"><a href="<https://observability.browserstack.com/projects/WDIO+Cucumber+GH/builds/Sanity+Only+Chrome/4052?tab=tests&details=1327748286&utm_medium=cicd&utm_source=jenkins>" target="_blank">View History</a></td>
                <td>Chrome 135</td>
                <td>OS X</td>
                <td>92s</td>
            </tr>
            <tr>
                <td class="test-link"><a href="#">Delete Account via API - Step Pending</a></td>
                <td class="status-failed">Failed</td>
                <td class="test-history"><a href="#">View History</a></td>
                <td>Google Pixel 7</td>
                <td>Android 12</td>
                <td>180s</td>
            </tr>
            <tr>
                <td class="test-link"><a href="#">BStack Demo API</a></td>
                <td class="status-passed">Passed</td>
                <td class="test-history"><a href="#">View History</a></td>
                <td>Samsung Galaxy Tab S8</td>
                <td>Android 12</td>
                <td>134s</td>
            </tr>
            <tr>
                <td class="test-link"><a href="#">Verify API Create Account (fred, password789)</a></td>
                <td class="status-failed">Failed</td>
                <td class="test-history"><a href="#">View History</a></td>
                <td>iPhone 14 Pro</td>
                <td>iOS 15.5</td>
                <td>221s</td>
            </tr>
            <tr>
                <td class="test-link"><a href="#">Verify API User Address</a></td>
                <td class="status-passed">Passed</td>
                <td class="test-history"><a href="#">View History</a></td>
                <td>Chrome 135</td>
                <td>Windows 11</td>
                <td>102s</td>
            </tr>
        </tbody>
    </table>

</body>`,
        rich_css: `body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fb;
            padding: 20px;
        }

        h2 {
            margin-top: 5px;
            margin-bottom: 15px;
            color: #2b3e50;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 30px;
            max-width: 1000px;
        }

        .metric-card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
        }

        .metric-card h1 {
            margin: 0;
            font-size: 32px;
        }

        .passed {
            color: green;
        }

        .failed {
            color: red;
        }

        .skipped,
        .unknown {
            color: #6c757d;
        }

        .grid-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            max-width: 1000px;
        }

        .metric-box {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
        }

        .metric-box h2 {
            font-size: 20px;
            margin-bottom: 10px;
        }

        .metric-box h1 {
            font-size: 28px;
            margin: 0;
        }



        .metric-box p {
            font-size: 14px;
            color: #666;
            margin: 8px 0 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
        }

        th,
        td {
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            text-align: left;
            font-size: 14px;
        }

        th {
            background-color: #f1f3f5;
            font-weight: bold;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .status-passed {
            color: green;
            font-weight: bold;
        }

        .status-failed {
            color: red;
            font-weight: bold;
        }

        .status-skipped {
            color: #6c757d;
            font-weight: bold;
        }

        .test-link a {
            text-decoration: none;
            color: #007bff;
        }

        .test-history a {
            text-decoration: none;
            color: #007bff;
        }

        .metric-box a {
            text-decoration: none;
            color: #007bff;
        }`
      }
    };
  }
}

module.exports = new MockReportService(); // Export singleton instance
