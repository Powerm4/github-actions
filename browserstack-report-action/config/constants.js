module.exports = {
  // Default values
  DEFAULT_POLLING_INTERVAL_SECONDS: 3,
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_USER_TIMEOUT_SECONDS: 10,

  // API simulation constants
  MAX_POLLS_FOR_IN_PROGRESS: 3,

  // Report formats
  REPORT_FORMAT: {
    BASIC_HTML: 'basicHtml',
    RICH_HTML: 'richHtml',
  },

  INPUT: {
    USERNAME: 'username',
    ACCESS_KEY: 'access-key',
    BUILD_NAME: 'build-name',
    TIMEOUT: 'report-timeout',
  },

  // Report statuses
  REPORT_STATUS: {
    IN_PROGRESS: 'in_progress',
    COMPLETE: 'complete',
    TESTS_AVAILABLE: 'tests_available',
    NOT_AVAILABLE: 'not_available',
    BUILD_NOT_FOUND: 'build_not_found',
    MORE_THAN_ONE_BUILD_FOUND: 'more_than_one_build_found',
  },

  // Integration types
  INTEGRATION_TYPE: {
    SDK: 'sdk',
    NON_SDK: 'non-sdk',
  },

  // CI system identifiers
  CI_SYSTEM: {
    GITHUB_ACTIONS: 'github-actions',
  },

  // REPORT_REQUEST_STATE
  REPORT_REQUEST_STATE: {
    FIRST: 'FIRST',
    POLL: 'POLL',
    LAST: 'LAST',
  },
};
