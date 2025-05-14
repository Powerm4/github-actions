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
      const sanitizedBuildName = buildName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `browserstack-report-${sanitizedBuildName}-${timestamp}.html`;
      const filePath = path.join(artifactDir, fileName);

      // Write content
      fs.writeFileSync(filePath, report);
      
      // Upload as artifact
      const artifactClient = artifact.createArtifactClient();
      const artifactName = `browserstack-report-${sanitizedBuildName}`;
      
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
