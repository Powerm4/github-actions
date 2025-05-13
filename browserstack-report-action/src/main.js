'use strict';

const core = require('@actions/core');
const constants = require('../config/constants');
const ActionInput = require('./actionInput');

// Counter for dummy API polling simulation
let pollCount = 0;

/**
 * Resets the poll count, useful for testing.
 */
function resetPollCount() {
  pollCount = 0;
}

/**
 * Simulates fetching a report from a dummy API.
 * @param {object} params - API request parameters
 * @param {object} auth - Authentication credentials
 * @param {string} auth.username - BrowserStack username
 * @param {string} auth.accessKey - BrowserStack access key
 * @returns {Promise<object>} - API response
 */
async function fetchDummyReportAPI(params, auth) {
  core.info(`Fetching report with params: ${JSON.stringify(params)}`);
  
  // Create Authorization header
  const authHeader = Buffer.from(`${auth.username}:${auth.accessKey}`).toString('base64');
  
  core.info(`Simulating API call with Username: ${auth.username} and Access Key: ****`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      pollCount += 1;
      const build_uuid = `12345678jiji0987654321`;
      const build_integration = (pollCount % 2 === 0) ? constants.INTEGRATION_TYPE.SDK : constants.INTEGRATION_TYPE.NON_SDK;
      
      const response = {
        build_uuid,
        build_integration,
        report: null,
      };

      // Simulate API returning polling config on first relevant call
      if (pollCount === 1) {
        response.polling_interval = constants.DEFAULT_POLLING_INTERVAL_SECONDS;
        response.retry_count = constants.DEFAULT_MAX_RETRIES;
      }

      if (pollCount < constants.MAX_POLLS_FOR_IN_PROGRESS) {
        core.info(`Poll attempt ${pollCount}: Report status is '${constants.REPORT_STATUS.IN_PROGRESS}'.`);
        response.report_status = constants.REPORT_STATUS.IN_PROGRESS;
        resolve(response);
      } else if (pollCount === constants.MAX_POLLS_FOR_IN_PROGRESS) {
        core.info(`Poll attempt ${pollCount}: Report status is '${constants.REPORT_STATUS.TESTS_AVAILABLE}'.`);
        response.report_status = constants.REPORT_STATUS.TESTS_AVAILABLE;
        response.report = {
          basic_html: `<h1>BrowserStack Test Report (Tests Available)</h1>
                       <p>Build Name: ${params.build_name}</p>
                       <p>Build UUID: ${build_uuid}</p>
                       <p>Integration: ${build_integration}</p>
                       <p>Timestamp: ${params.build_creation_timestamp}</p>
                       <p>Status: All tests finished.</p>
                       <pre>Some test results here...</pre>`
        };
        resolve(response);
      } else {
        core.info(`Poll attempt ${pollCount}: Report status is '${constants.REPORT_STATUS.COMPLETE}'.`);
        response.report_status = constants.REPORT_STATUS.COMPLETE;
        response.report = {
          basic_html: `<h1>BrowserStack Final Report (Complete)</h1>
                       <p>Build Name: ${params.build_name}</p>
                       <p>Build UUID: ${build_uuid}</p>
                       <p>Integration: ${build_integration}</p>
                       <p>Timestamp: ${params.build_creation_timestamp}</p>
                       <p>Status: Build insights and test runs data available.</p>
                       <pre>Detailed insights and test results...</pre>`
        };
        resolve(response);
      }
      // Other statuses can be simulated as needed
    }, 10); // Simulate network delay of 10ms for faster tests
  });
}

/**
 * Main execution function for the GitHub Action
 */
async function run() {
  try {
    core.info('Starting BrowserStack Report Action...');

    // Get and validate inputs
    const actionInput = new ActionInput();
    const inputs = actionInput.getInputs();
    
    // Destructure inputs
    const { username, accessKey, buildName, userTimeout } = inputs;

    const buildCreationTimestamp = new Date().toISOString();
    const reportFormat = constants.REPORT_FORMAT.BASIC_HTML;
    const requestingCI = constants.CI_SYSTEM.GITHUB_ACTIONS;

    core.info(`Build Name: ${buildName}`);
    core.info(`User Timeout: ${userTimeout}s`);
    core.info(`BrowserStack Username: ${username}`);
    // Do not log accessKey directly for security

    let retries = 0;
    let reportData;
    let reportStatus;
    let pollingIntervalSeconds; // Will be set by API
    let maxRetries; // Will be set by API

    // Initial API call to get report status and polling parameters
    core.info('Initial API call to fetch report status and polling parameters.');
    const initialApiParams = {
      build_name: buildName,
      build_creation_timestamp: buildCreationTimestamp,
      report_format: reportFormat,
      requesting_ci: requestingCI,
      request_type: 'first',
      user_timeout: userTimeout,
    };
    
    const auth = {
      username,
      accessKey
    };
    
    reportData = await fetchDummyReportAPI(initialApiParams, auth);
    reportStatus = reportData.report_status;
    pollingIntervalSeconds = reportData.polling_interval || constants.DEFAULT_POLLING_INTERVAL_SECONDS;
    maxRetries = reportData.retry_count || constants.DEFAULT_MAX_RETRIES;

    core.info(`API Response: Build UUID: ${reportData.build_uuid}, Status: ${reportStatus}, Integration: ${reportData.build_integration}`);
    core.info(`Polling Interval from API: ${pollingIntervalSeconds}s, Max Retries from API: ${maxRetries}`);

    while (retries <= maxRetries) {
      // If not the first iteration, reportData would have been fetched inside the loop
      if (retries > 0) { // Subsequent polls
        core.info(`Polling attempt #${retries + 1} (overall attempt ${pollCount})`);
        const apiParams = {
          build_name: buildName,
          build_creation_timestamp: buildCreationTimestamp,
          report_format: reportFormat,
          requesting_ci: requestingCI,
          user_timeout: userTimeout,
          request_type: retries === maxRetries ? 'last' : 'polling',
        };
        reportData = await fetchDummyReportAPI(apiParams, auth);
        reportStatus = reportData.report_status;
        core.info(`API Response: Build UUID: ${reportData.build_uuid}, Status: ${reportStatus}, Integration: ${reportData.build_integration}`);
      } else { // First check after initial call
        core.info(`Processing initial API response (attempt #${retries + 1}, overall attempt ${pollCount})`);
      }

      if (reportStatus === constants.REPORT_STATUS.COMPLETE || reportStatus === constants.REPORT_STATUS.TESTS_AVAILABLE) {
        core.info('Report generation successful.');
        if (reportData.report && reportData.report.basic_html) {
          core.summary.addRaw(reportData.report.basic_html);
          await core.summary.write();
          return;
        }
        
        core.setFailed('Report status is complete/tests_available, but HTML report content is missing.');
        return;
      } else if (reportStatus === constants.REPORT_STATUS.IN_PROGRESS) {
        if (retries < maxRetries) {
          core.info(`Report is still in progress. Retrying in ${pollingIntervalSeconds} seconds...`);
          await new Promise(resolve => setTimeout(resolve, pollingIntervalSeconds * 10)); // Use 10ms for faster tests
        } else {
          core.setFailed(`Polling timed out after ${maxRetries} retries. Last status: ${reportStatus}`);
          return;
        }
      } else { // "not_available", "build_not_found", "more_than_one_build_found"
        core.setFailed(`Report generation failed with status: ${reportStatus}. Build UUID: ${reportData.build_uuid || 'N/A'}`);
        return;
      }
      retries += 1;
    }
    
    // If loop finishes without returning, it means maxRetries was hit with last status being in_progress
    if (reportStatus === constants.REPORT_STATUS.IN_PROGRESS) {
      core.setFailed(`Polling timed out after ${maxRetries} retries. Final status was '${constants.REPORT_STATUS.IN_PROGRESS}'.`);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    if (error.stack) {
      core.debug(error.stack);
    }
  }
}

// Export functions for testing
module.exports = {
  fetchDummyReportAPI,
  run,
  resetPollCount, // Export for testability
};

// Execute the action only if this file is run directly
run();
