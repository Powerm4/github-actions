const core = require('@actions/core');
const UploadFileForArtifact = require('../utils/UploadFileForArtifact');

class ReportProcessor {
  constructor(reportData) {
    this.reportData = reportData;
  }

  async processReport() {
    try {
      const { summary } = core;
      await summary.addHeading('BrowserStack Test Report');

      if (this.reportData?.report?.basicHtml) {
        await summary.addRaw(`<html>${this.reportData.report.basicHtml}</html>`);
      } else {
        await summary.addRaw('⚠️ No report content available');
      }
      summary.write();
      if (this.reportData?.report?.richHtml) {
        const report = `<!DOCTYPE html> <html><head><style>${this.reportData?.report?.richCss}</style></head> ${this.reportData?.report?.richHtml}</html>`;
        const artifactObj = new UploadFileForArtifact(report);
        await artifactObj.saveReportInFile();
      }
    } catch (error) {
      core.info(`Error processing report: ${JSON.stringify(error)}`);
      await core.summary
        .addRaw('❌ Error processing report')
        .write();
      throw error;
    }
  }
}

module.exports = ReportProcessor;
