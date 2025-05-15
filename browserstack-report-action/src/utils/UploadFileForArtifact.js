'use strict';

const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const artifact = require('@actions/artifact');

class UploadFileForArtifact {
  static async saveReportAsArtifact(report) {
    if (!report) {
      core.debug('No HTML content available to save as artifact');
      return '';
    }

    try {
      const pathName = "browserstack-reports-atifact"
      const fileName = `bstack-report.html`;
      // Create artifacts directory
      fs.mkdirSync(pathName, { recursive: true });
      //save path in a env variable
      core.exportVariable('BROWSERSTACK_REPORT_PATH', pathName);

      // Write content
      fs.writeFileSync(path.join(pathName,fileName), report);
    } catch (error) {
      core.warning(`Failed to save file: ${error.message}`);
      return '';
    }
  }
}

module.exports = UploadFileForArtifact;
