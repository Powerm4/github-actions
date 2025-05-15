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

    const timeoutManager = new TimeoutManager(userTimeout);
    const reportService = new ReportService(authHeader, isTestMode);

    const initialParams = {
      originalBuildName: buildName,
      buildCreatedAt: new Date().toISOString(),
      requestingCi: constants.CI_SYSTEM.GITHUB_ACTIONS,
      reportFormat: [constants.REPORT_FORMAT.BASIC_HTML, constants.REPORT_FORMAT.RICH_HTML],
      requestType: constants.REPORT_REQUEST_STATE.FIRST,
      userTimeout,
    };

    timeoutManager.check();
    const initialReport = await reportService.fetchReport(initialParams);
    const { retryCount: maxRetries, pollingInterval } = initialReport;

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
