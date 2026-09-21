const core = require('@actions/core');
const axios = require('axios');
const InputValidator = require('./inputValidator');
const constants = require('../../config/constants');
const { BROWSERSTACK_INTEGRATIONS, ALLOWED_RERUN_ENV_VARS } = require("../../config/constants");

const {
  INPUT,
  ENV_VARS,
} = constants;

/**
 * ActionInput manages the fetching of action input values and
 * helps in setting env variables post validation.
 */
class ActionInput {
  constructor() {
    this._fetchAllInput();
    this._validateInput();
  }

  /**
   * Fetches all the input values given to the action.
   * Raises error if the required values are not provided.
   */
  _fetchAllInput() {
    try {
      // required fields
      this.username = core.getInput(INPUT.USERNAME, { required: true });
      this.accessKey = core.getInput(INPUT.ACCESS_KEY, { required: true });

      // non-compulsory fields
      this.buildName = core.getInput(INPUT.BUILD_NAME);
      this.projectName = core.getInput(INPUT.PROJECT_NAME);

      // Capture before _validateInput() replaces blanks with generated defaults.
      this.buildNameProvided = Boolean(this.buildName && this.buildName.trim());
      this.projectNameProvided = Boolean(this.projectName && this.projectName.trim());
      this.githubApp = core.getInput(INPUT.GITHUB_APP);
      this.githubToken = core.getInput(INPUT.GITHUB_TOKEN);
      this.rerunAttempt = process?.env?.GITHUB_RUN_ATTEMPT;
      this.runId = process?.env?.GITHUB_RUN_ID;
      this.repository = process?.env?.GITHUB_REPOSITORY;
    } catch (e) {
      throw Error(`Action input failed for reason: ${e.message}`);
    }
  }

  /**
   * Validates the input values
   */
  _validateInput() {
    this.username = InputValidator.updateUsername(this.username);
    this.buildName = InputValidator.validateBuildName(this.buildName);
    this.projectName = InputValidator.validateProjectName(this.projectName);
    this.githubApp = InputValidator.validateGithubAppName(this.githubApp);
    this.githubToken = InputValidator.validateGithubToken(this.githubToken);
  }

  /**
   * Sets env variables to be used in the test script for BrowserStack
   */
  async setEnvVariables() {
    core.startGroup('Setting Environment Variables');

    core.exportVariable(ENV_VARS.BROWSERSTACK_USERNAME, this.username);
    core.info(`Use ${ENV_VARS.BROWSERSTACK_USERNAME} environment variable for your username in your tests\n`);

    core.exportVariable(ENV_VARS.BROWSERSTACK_ACCESS_KEY, this.accessKey);
    core.info(`Use ${ENV_VARS.BROWSERSTACK_ACCESS_KEY} environment variable for your access key in your tests\n`);

    // Export only when supplied: an env var outranks the user's browserstack.json,
    // so a generated default would silently replace it. BUILD_INFO / REPO_NAME opt in.
    if (this.projectNameProvided) {
      core.exportVariable(ENV_VARS.BROWSERSTACK_PROJECT_NAME, this.projectName);
      core.info(`${ENV_VARS.BROWSERSTACK_PROJECT_NAME} environment variable set as: ${this.projectName}`);
      core.info(`Use ${ENV_VARS.BROWSERSTACK_PROJECT_NAME} environment variable for your project name capability in your tests\n`);
    } else {
      core.info(`No project-name input given, so ${ENV_VARS.BROWSERSTACK_PROJECT_NAME} was left unset and your own configuration will be used. Pass project-name (or the REPO_NAME token) to set it here.\n`);
    }

    if (this.buildNameProvided) {
      core.exportVariable(ENV_VARS.BROWSERSTACK_BUILD_NAME, this.buildName);
      core.info(`${ENV_VARS.BROWSERSTACK_BUILD_NAME} environment variable set as: ${this.buildName}`);
      core.info(`Use ${ENV_VARS.BROWSERSTACK_BUILD_NAME} environment variable for your build name capability in your tests\n`);
    } else {
      core.info(`No build-name input given, so ${ENV_VARS.BROWSERSTACK_BUILD_NAME} was left unset and your own configuration will be used. Pass build-name (or the BUILD_INFO token) to set it here.\n`);
    }

    if (await this.checkIfBStackReRun()) {
      await this.setBStackRerunEnvVars();
    }
    core.endGroup();
  }

  async checkIfBStackReRun() {
    // Attempt 1 is an ordinary run, not a re-run — stay silent, this is not a failure.
    if (!this.rerunAttempt || Number(this.rerunAttempt) <= 1) {
      return false;
    }

    // Past this point GitHub re-ran the workflow, so the failed-test list was meant to be
    // delivered. Every bail below silently degrades the re-run into a full-suite run, which
    // is indistinguishable from correct behaviour unless we say so here (SDK-7461).
    const missing = [];
    if (!this.githubToken || this.githubToken === 'none') missing.push("the 'github-token' input");
    if (!this.runId) missing.push('GITHUB_RUN_ID');
    if (!this.repository || this.repository === 'none') missing.push('GITHUB_REPOSITORY');
    if (!this.username) missing.push("the 'username' input");
    if (!this.accessKey) missing.push("the 'access-key' input");

    if (missing.length) {
      core.warning(`This is re-run attempt ${this.rerunAttempt}, but BrowserStack cannot deliver the failed-test list because ${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} not set. Every test will run again instead of only the failed ones. Pass github-token to this action to enable re-running only failed tests.`);
      return false;
    }

    const triggeringActor = process.env.GITHUB_TRIGGERING_ACTOR;

    // The actor check is only a cheap pre-filter; the rebuild/details endpoint is the
    // authority on whether BrowserStack triggered this re-run, and it returns no variables
    // when it did not. GITHUB_TRIGGERING_ACTOR comes from the runner binary, so a
    // self-hosted runner can simply not set it — bailing there would turn a working re-run
    // into a full-suite run on an otherwise correct setup (SDK-7461). Ask the API instead.
    if (!triggeringActor) {
      core.warning(`This is re-run attempt ${this.rerunAttempt} and the runner did not report GITHUB_TRIGGERING_ACTOR, so BrowserStack cannot pre-confirm that it triggered this re-run — asking BrowserStack directly instead. This variable is set by the runner itself; on a self-hosted runner, updating the runner restores the faster check.`);
      return true;
    }

    core.info(`Triggering actor is - ${triggeringActor}`);
    if (triggeringActor !== this.githubApp) {
      core.info(`This re-run was started by '${triggeringActor}', not by the BrowserStack GitHub App ('${this.githubApp}'), so there is no failed-test list to apply and every test will run again. Re-runs started from the BrowserStack dashboard run only the failed tests; check that the BrowserStack GitHub App is installed on ${this.repository}.`);
      return false;
    }

    return true;
  }

  async setBStackRerunEnvVars() {
    try {
      // Check if the run was triggered by the BrowserStack rerun bot
      core.info('The re-run was triggered by the GitHub App from BrowserStack.');

      const browserStackApiUrl = BROWSERSTACK_INTEGRATIONS.DETAILS_API_URL.replace('{runId}', this.runId);

      // Call BrowserStack API to get the tests to rerun
      const bsApiResponse = await axios.get(browserStackApiUrl, {
        auth: {
          username: this.username.replace("-GitHubAction", ""),
          password: this.accessKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const variables = bsApiResponse?.data?.data?.variables;
      if (variables && typeof variables === 'object') {
        // Security (APS-19076): only export env vars whose names are on the
        // allowlist. The BrowserStack rerun API response is treated as
        // attacker-influenced; without this filter, the API could inject
        // arbitrary env vars into the runner (e.g. NODE_OPTIONS, PATH,
        // GITHUB_TOKEN overrides) leading to RCE / token exfiltration.
        Object.keys(variables).forEach((key) => {
          if (ALLOWED_RERUN_ENV_VARS.includes(key)) {
            core.exportVariable(key, variables[key]);
          } else {
            core.warning(`Ignoring non-allowlisted env var from BrowserStack rerun API: ${key}`);
          }
        });
      }
    } catch (error) {
      // Swallowing this as info hid a total delivery failure behind a normal-looking log.
      core.warning(`Could not fetch the failed-test list from BrowserStack (${error.message}). Every test will run again instead of only the failed ones.`);
    }
  }
}

module.exports = ActionInput;
