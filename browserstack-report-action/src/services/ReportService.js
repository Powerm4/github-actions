'use strict';

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
          Authorization: authHeader,
        },
      });
      if(response.status < 200 || response.status > 299) {
        return errorResponse(response?.data?.error_message || "Something Went Wrong while Fetching report");
      }
      return response.data;
    } catch (error) {
      core.info(`Error fetching report: ${error.message}`);
      return errorResponse();
    }
  }

  errorResponse(errorMessage) {
    return {
      report:  { basic_html: `<pre>${errorMessage ? errorMessage: "Something Went Wrong while Fetching report"}</pre>` },
      report_status: 'ERROR'
    };
  }

  async pollReport(params, timeoutManager, maxRetries, pollingInterval) {
    let retries = 0;
    let reportData;

    while (retries <= maxRetries) {
      timeoutManager.check();
      
      reportData = await this.fetchReport({
        ...params,
        request_type: retries === maxRetries - 1 ? constants.REPORT_REQUEST_STATE.LAST : constants.REPORT_REQUEST_STATE.POLL,
      });
      
      const status = reportData.report_status;
      if (status === 'COMPLETED' || status === 'TEST_AVAILABLE') {
        return reportData;
      }
      
      if (status === 'IN_PROGRESS' && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, pollingInterval * 1000));
        retries++;
        continue;
      }
      
      // Instead of throwing, return error data that can be displayed
      return this.handleErrorStatus(status, reportData);
    }

    // Return timeout error data
    return {
      error_message: `Report generation failed after ${maxRetries} retries`,
      report_status: 'TIMEOUT',
      report: {
        basic_html: `<pre>Report generation got timedout, please try increasing report timeout</pre>`,
      }
    };
  }

  handleErrorStatus(status, reportData) {
    const errorMessages = {
      'BUILD_NOT_FOUND': 'Build not found in BrowserStack',
      'MULTIPLE_BUILD_FOUND': 'Multiple builds found with the same name',
      'DATA_NOT_AVAILABLE': 'Report data not available from BrowserStack',
      'ERROR': 'Error occurred while fetching report',
    };

    return {
      error_message: errorMessages[status] || `Unexpected status: ${status}`,
      report_status: status,
      report : reportData.report,
    };
  }
}

module.exports = ReportService;
