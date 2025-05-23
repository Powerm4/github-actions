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

      let addToSummaryReport = this.reportData?.report?.basicHtml;
      if (addToSummaryReport) {
        addToSummaryReport = `<html>${addToSummaryReport}</html>`;
        addToSummaryReport = addToSummaryReport.replace(/[\u201C\u201D]/g, '"');
        addToSummaryReport = addToSummaryReport.replace(/"(target="_blank")/g, '" $1');
        core.info(`Report HTML: ${addToSummaryReport}`);
        await summary.addRaw(addToSummaryReport, false);
      } else {
        await summary.addRaw('⚠️ No report content available', true);
      }
      summary.write();
      const addToArtifactReport = this.reportData?.report?.richHtml;
      const addToArtifactReportCss = this.reportData?.report?.richCss;
      if (addToArtifactReport) {
        const report = `<!DOCTYPE html> <html><head><style>${addToArtifactReportCss}</style></head> ${addToArtifactReport}</html>`;
        const artifactObj = new UploadFileForArtifact(report, 'browserstack-artifacts', 'browserstack-report.html', 'BrowserStack Test Report');
        await artifactObj.saveReportInFile();
      }
    } catch (error) {
      core.info(`Error processing report: ${JSON.stringify(error)}`);
      await core.summary
        .addRaw('❌ Error processing report', true)
        .write();
      throw error;
    }
  }
}

module.exports = ReportProcessor;
