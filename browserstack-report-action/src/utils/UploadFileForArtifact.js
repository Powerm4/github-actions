const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

class UploadFileForArtifact {
  constructor(report) {
    this.report = report;
  }

  async saveReportInFile() {
    if (!this.report) {
      core.debug('No HTML content available to save as artifact');
      return '';
    }

    try {
      const pathName = "browserstack-reports-artifact";
      const fileName = `bstack-report.html`;
      const artifactName = "browserstack-report";
      // Create artifacts directory
      fs.mkdirSync(pathName, { recursive: true });
      // save path in a env variable
      core.exportVariable('BROWSERSTACK_REPORT_PATH', pathName);
      core.exportVariable("BROWSERSTACK_REPORT_NAME", artifactName);

      // Write content
      fs.writeFileSync(path.join(pathName, fileName), this.report);
    } catch (error) {
      core.warning(`Failed to save file: ${error.message}`);
      return '';
    }
  }
}

module.exports = UploadFileForArtifact;
