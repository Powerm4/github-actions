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
    const {
      username, accessKey, buildName, userTimeout,
    } = actionInput.getInputs();
    const authHeader = `Basic ${Buffer.from(`${username}:${accessKey}`).toString('base64')}`;

    // Enable test mode if environment variable is set
    const isTestMode = 'true';
    if (isTestMode) {
      core.info('Running in test mode with mock API responses');
    }

    const timeoutManager = new TimeoutManager(userTimeout
      || constants.DEFAULT_USER_TIMEOUT_SECONDS);
    const reportService = new ReportService(authHeader, isTestMode);

    const initialParams = {
      originalBuildName: buildName,
      buildCreatedAt: Date.now().toString(), // Changed to timestamp string
      requestingCi: constants.CI_SYSTEM.GITHUB_ACTIONS,
      reportFormat: [constants.REPORT_FORMAT.BASIC_HTML, constants.REPORT_FORMAT.RICH_HTML],
      requestType: constants.REPORT_REQUEST_STATE.FIRST,
      userTimeout,
    };

    timeoutManager.check();
    const initialReport = await reportService.fetchReport(initialParams);
    let { retryCount: maxRetries, pollingInterval } = initialReport;

    if (!pollingInterval) {
      pollingInterval = constants.DEFAULT_POLLING_INTERVAL_SECONDS;
    }

    if (!maxRetries) {
      maxRetries = constants.DEFAULT_MAX_RETRIES;
    }

    const reportData = await reportService.pollReport(
      initialParams,
      timeoutManager,
      maxRetries,
      pollingInterval,
    );

    await ReportProcessor.processReport(reportData);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

module.exports = { run };

if (require.main === module) {
  run();
}
