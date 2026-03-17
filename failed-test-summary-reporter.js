import fs from 'fs';
import path from 'path';

class TestExecutionSummaryReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'test-results/test-execution-summary.md';
    this.testsById = new Map();
  }

  onTestEnd(test, result) {
    const id = test.id;
    if (!this.testsById.has(id)) {
      this.testsById.set(id, {
        projectName: test.parent.project()?.name || 'unknown',
        title: [...test.titlePath().slice(1)].join(' > '),
        file: path.relative(process.cwd(), test.location.file),
        line: test.location.line,
        column: test.location.column,
        attempts: [],
      });
    }

    const current = this.testsById.get(id);
    current.attempts.push(this._buildAttempt(result));
  }

  onEnd() {
    const reportDir = path.dirname(this.outputFile);
    fs.mkdirSync(reportDir, { recursive: true });

    const now = new Date().toISOString();
    const tests = Array.from(this.testsById.values()).map((test) => {
      const lastAttempt = test.attempts[test.attempts.length - 1] || null;
      const hasFailureAttempt = test.attempts.some((attempt) => attempt.status === 'failed');
      const finalStatus = lastAttempt?.status || 'unknown';
      const finalOutcome = hasFailureAttempt && finalStatus === 'passed' ? 'flaky' : finalStatus;
      return { ...test, finalStatus, finalOutcome };
    });

    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let flaky = 0;

    tests.forEach((test) => {
      if (test.finalOutcome === 'passed') passed += 1;
      else if (test.finalOutcome === 'failed') failed += 1;
      else if (test.finalOutcome === 'flaky') flaky += 1;
      else skipped += 1;
    });

    let content = '# Playwright Test Execution Summary\n\n';
    content += `Generated at: ${now}\n\n`;
    content += `Total test cases: ${tests.length}\n`;
    content += `Passed: ${passed}\n`;
    content += `Failed: ${failed}\n`;
    content += `Flaky: ${flaky}\n`;
    content += `Skipped/Other: ${skipped}\n\n`;
    content += '## Status Legend\n\n';
    content += '- `passed`: Test passed in final run\n';
    content += '- `failed`: Test failed in final run\n';
    content += '- `flaky`: Failed in earlier retry but passed finally\n';
    content += '- `skipped/other`: Skipped, timed out, interrupted, or unknown\n\n';
    content += '## Test Cases\n\n';

    if (!tests.length) {
      content += 'No test cases were executed.\n';
      fs.writeFileSync(this.outputFile, content, 'utf8');
      return;
    }

    tests.forEach((testCase, index) => {
      content += `## ${index + 1}. ${testCase.title}\n`;
      content += `- Final status: ${testCase.finalOutcome}\n`;
      content += `- Project: ${testCase.projectName}\n`;
      content += `- Location: ${testCase.file}:${testCase.line}:${testCase.column}\n`;
      content += `- Attempts: ${testCase.attempts.length}\n\n`;

      testCase.attempts.forEach((attempt, attemptIndex) => {
        content += `### Attempt ${attemptIndex + 1} (retry: ${attempt.retry})\n`;
        content += `- Status: ${attempt.status}\n`;
        content += `- Duration: ${attempt.duration} ms\n`;

        if (attempt.errorMessage) {
          content += '- Error:\n';
          content += '```text\n';
          content += `${attempt.errorMessage}\n`;
          content += '```\n';
        }

        if (attempt.stack) {
          content += '- Stack trace:\n';
          content += '```text\n';
          content += `${attempt.stack}\n`;
          content += '```\n';
        }

        if (attempt.traces.length) {
          content += '- Traces:\n';
          attempt.traces.forEach((tracePath) => {
            content += `  - ${tracePath}\n`;
            content += `    - Open with: npx playwright show-trace "${tracePath}"\n`;
          });
        }

        if (attempt.screenshots.length) {
          content += '- Screenshots:\n';
          attempt.screenshots.forEach((filePath) => {
            content += `  - ${filePath}\n`;
          });
        }

        if (attempt.videos.length) {
          content += '- Videos:\n';
          attempt.videos.forEach((filePath) => {
            content += `  - ${filePath}\n`;
          });
        }

        if (attempt.otherArtifacts.length) {
          content += '- Other artifacts:\n';
          attempt.otherArtifacts.forEach((filePath) => {
            content += `  - ${filePath}\n`;
          });
        }

        if (attempt.stdout) {
          content += '- Stdout:\n';
          content += '```text\n';
          content += `${attempt.stdout}\n`;
          content += '```\n';
        }

        if (attempt.stderr) {
          content += '- Stderr:\n';
          content += '```text\n';
          content += `${attempt.stderr}\n`;
          content += '```\n';
        }

        content += '\n';
      });
    });

    fs.writeFileSync(this.outputFile, content, 'utf8');
  }

  _buildAttempt(result) {
    const categorized = this._categorizeAttachments(result.attachments || []);
    return {
      status: result.status,
      retry: result.retry,
      duration: result.duration,
      errorMessage: this._cleanMessage(result.error?.message || ''),
      stack: this._cleanMessage(result.error?.stack || ''),
      traces: categorized.traces,
      screenshots: categorized.screenshots,
      videos: categorized.videos,
      otherArtifacts: categorized.other,
      stdout: this._formatOutput(result.stdout),
      stderr: this._formatOutput(result.stderr),
    };
  }

  _categorizeAttachments(attachments) {
    const traces = [];
    const screenshots = [];
    const videos = [];
    const other = [];

    attachments.forEach((attachment) => {
      if (!attachment.path) return;
      const relPath = path.relative(process.cwd(), attachment.path);
      const lowerPath = relPath.toLowerCase();
      const lowerName = String(attachment.name || '').toLowerCase();
      const lowerType = String(attachment.contentType || '').toLowerCase();

      if (lowerPath.includes('trace') || lowerPath.endsWith('.zip') || lowerName.includes('trace')) {
        traces.push(relPath);
      } else if (lowerType.startsWith('image/') || lowerPath.endsWith('.png') || lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) {
        screenshots.push(relPath);
      } else if (lowerType.startsWith('video/') || lowerPath.endsWith('.webm') || lowerPath.endsWith('.mp4')) {
        videos.push(relPath);
      } else {
        other.push(relPath);
      }
    });

    return { traces, screenshots, videos, other };
  }

  _formatOutput(items) {
    if (!items || !items.length) return '';
    return items
      .map((entry) => (Buffer.isBuffer(entry) ? entry.toString('utf8') : String(entry)))
      .join('\n')
      .trim();
  }

  _cleanMessage(message) {
    return String(message).trim();
  }
}

export default TestExecutionSummaryReporter;
