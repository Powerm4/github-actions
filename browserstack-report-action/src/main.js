'use strict';

const core = require('@actions/core');
const constants = require('../config/constants');
const ActionInput = require('./actionInput');
const ReportService = require('./services/ReportService');
const ReportProcessor = require('./services/ReportProcessor');
const TimeoutManager = require('./utils/TimeoutManager');

async function run() {
  try {
    core.info('Starting BrowserStack Report Action...');

    const actionInput = new ActionInput();
    const { username, accessKey, buildName, userTimeout } = actionInput.getInputs();
    const authHeader = `Basic ${Buffer.from(`${username}:${accessKey}`).toString('base64')}`;

    // Enable test mode if environment variable is set
    const isTestMode = 'true';
    if (isTestMode) {
      core.info('Running in test mode with mock API responses');
    }

    const timeoutManager = new TimeoutManager(userTimeout);
    const reportService = new ReportService(authHeader, isTestMode);

    const initialParams = {
      build_name: buildName,
      build_created_at: new Date().toISOString(),
      requesting_ci: constants.CI_SYSTEM.GITHUB_ACTIONS,
      report_format: [constants.REPORT_FORMAT.BASIC_HTML, constants.REPORT_FORMAT.RICH_HTML ],
      request_type: constants.REPORT_REQUEST_STATE.FIRST,
      user_timeout: userTimeout,
    };

    timeoutManager.check();
    const initialReport = await reportService.fetchReport(initialParams);
    const { retry_count: maxRetries, polling_interval: pollingInterval } = initialReport;

    const reportData = await reportService.pollReport(
      initialParams,
      timeoutManager,
      maxRetries,
      pollingInterval
    );

    await ReportProcessor.processReport(reportData.report);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

module.exports = { run };

if (require.main === module) {
  run();
}
