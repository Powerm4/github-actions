'use strict';

const core = require('@actions/core');
const ArtifactManager = require('../utils/ArtifactManager');

class ReportProcessor {
  static async processReport(reportData, buildName) {
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
        await ArtifactManager.saveReportAsArtifact(report, buildName);
      }
    } catch (error) {
      await core.info(`Error processing report: ${JSON.stringify(error)}`);
      await core.summary
        .addRaw('❌ Error processing report')
        .write();
      throw error;
    }
  }
}

module.exports = ReportProcessor;
