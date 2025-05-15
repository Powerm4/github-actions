'use strict';

const core = require('@actions/core');
const UploadFileForArtifact = require('../utils/UploadFileForArtifact');

class ReportProcessor {
  static async processReport(reportData) {
    try {
      const summary = core.summary;
      await summary.addHeading('BrowserStack Test Report');

      if (reportData?.report?.basic_html) {
        await summary.addRaw(`<html>${reportData.report.basic_html}</html>`);
        
      } else {
        await summary.addRaw('⚠️ No report content available');
      }
      summary.write();
      if(reportData?.report?.rich_html) {
        const report = `<!DOCTYPE html> <html><head><style>${reportData?.report?.rich_css}</style></head> ${reportData?.report?.rich_html}</html>`;
        await UploadFileForArtifact.saveReportInFile(report);
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
