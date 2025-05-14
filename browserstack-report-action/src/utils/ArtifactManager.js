'use strict';

const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const artifact = require('@actions/artifact');

class ArtifactManager {
  static async saveReportAsArtifact(report, buildName) {
    if (!report) {
      core.debug('No HTML content available to save as artifact');
      return '';
    }

    try {
      // Create artifacts directory
      const artifactDir = path.join(process.env.GITHUB_WORKSPACE || '.', 'browserstack-artifacts');
      fs.mkdirSync(artifactDir, { recursive: true });

      // Create HTML file
      const fileName = `report.html`;
      const filePath = path.join(artifactDir, fileName);

      // Write content
      fs.writeFileSync(filePath, report);
      core.exportVariable('BROWSERSTACK_REPORT_PATH', filePath);
      core.setOutput('report_file_path', filePath);
      core.setOutput('report_dir', artifactDir);
      
      // Upload as artifact 
      let artifactClient;
      if (typeof artifact.create === 'function') {
        artifactClient = artifact.create();
        core.info('Created artifact client using create() function');
      } else if (typeof artifact.default === 'function') {
        artifactClient = artifact.default();
        core.info('Created artifact client using default() function');
      } else if (typeof artifact === 'function') {
        artifactClient = artifact();
        core.info('Created artifact client using artifact as function');
      } else {
        // Just save the file locally and return
        core.warning('Artifact API not available. Report saved locally only.');
        return `File saved locally at: ${filePath}`;
      }
      const artifactName = `browserstack`;
      
      const uploadResult = await artifactClient.uploadArtifact(
        artifactName,
        [filePath],
        artifactDir,
        { continueOnError: true }
      );

      if (uploadResult.failedItems.length > 0) {
        core.warning(`Failed to upload artifacts: ${uploadResult.failedItems.join(', ')}`);
        return '';
      }

      core.info(`Report saved as artifact: ${artifactName}`);
      return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/artifacts/${uploadResult.artifactId}`;
    } catch (error) {
      core.warning(`Failed to save artifact: ${error.message}`);
      return '';
    }
  }
}

module.exports = ArtifactManager;
