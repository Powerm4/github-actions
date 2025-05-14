'use strict';

const core = require('@actions/core');

class ReportProcessor {
  static async processReport(reportData) {
    try {
      const summary = core.summary;
      await summary.addHeading('BrowserStack Test Report');

      // Process report content - both success and error cases come in report_html
      if (reportData?.report?.basic_html) {
        await summary.addRaw(reportData?.report?.basic_html);
      } else {
        await summary.addRaw('⚠️ No report content available');
      }


      return summary.write();
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
