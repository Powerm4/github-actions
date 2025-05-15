const axios = require('axios');
const core = require('@actions/core');
const constants = require('../../config/constants');
const mockService = require('./MockReportService');

class ReportService {
  constructor(authHeader, isTestMode = false) {
    this.authHeader = authHeader;
    this.apiUrl = 'https://api-observability.browserstack.com/api/v1/builds/buildReport';
    this.isTestMode = isTestMode;
  }

  async fetchReport(params) {
    if (this.isTestMode) {
      return mockService.getMockResponse();
    }

    try {
      const response = await axios.post(this.apiUrl, params, {
        headers: {
          Authorization: this.authHeader,
        },
      });
      if (response.status < 200 || response.status > 299) {
        return this.errorResponse(response?.data?.errorMessage || "Something Went Wrong while Fetching report");
      }
      return response.data;
    } catch (error) {
      core.info(`Error fetching report: ${error.message}`);
      return this.errorResponse();
    }
  }

  static errorResponse(errorMessage) {
    return {
      report: { basicHtml: `<pre>${errorMessage || "Something Went Wrong while Fetching report"}</pre>` },
      reportStatus: 'ERROR',
    };
  }

  async pollReport(params, timeoutManager, maxRetries, pollingInterval) {
    const poll = async (retries) => {
      timeoutManager.check();

      const reportData = await this.fetchReport({
        ...params,
        requestType: retries === maxRetries - 1 ? constants.REPORT_REQUEST_STATE.LAST
          : constants.REPORT_REQUEST_STATE.POLL,
      });

      const status = reportData.reportStatus;
      if (status === constants.REPORT_STATUS.COMPLETED
        || status === constants.REPORT_STATUS.TESTS_AVAILABLE) {
        return reportData;
      }

      if (status === constants.REPORT_STATUS.IN_PROGRESS && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, pollingInterval * 1000));
        return poll(retries + 1);
      }

      // Instead of throwing, return error data that can be displayed
      return this.handleErrorStatus(status, reportData);
    };

    return poll(0);
  }

  static handleErrorStatus(status, reportData) {
    const errorMessages = {
      BUILD_NOT_FOUND: 'Build not found in BrowserStack',
      MULTIPLE_BUILD_FOUND: 'Multiple builds found with the same name',
      DATA_NOT_AVAILABLE: 'Report data not available from BrowserStack',
      ERROR: 'Error occurred while fetching report',
    };

    return {
      errorMessage: errorMessages[status] || `Unexpected status: ${status}`,
      reportStatus: status,
      report: reportData.report,
    };
  }
}

module.exports = ReportService;
