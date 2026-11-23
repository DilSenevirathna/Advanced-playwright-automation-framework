const fs = require('node:fs');

/**
 * Small custom reporter. Prints a compact run summary to the terminal and, when running on
 * GitHub Actions, writes the same thing as Markdown to the job summary page.
 */
class SummaryReporter {
  onBegin(_config, suite) {
    this.suite = suite;
  }

  onEnd(result) {
    const tests = this.suite.allTests();
    const totals = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
    const byProject = new Map();

    for (const test of tests) {
      const outcome = test.outcome();
      const key = { expected: 'passed', unexpected: 'failed', flaky: 'flaky', skipped: 'skipped' }[
        outcome
      ];
      totals[key] += 1;

      const project = test.parent.project()?.name ?? 'default';
      const row = byProject.get(project) ?? { passed: 0, failed: 0, flaky: 0, skipped: 0 };
      row[key] += 1;
      byProject.set(project, row);
    }

    const slowest = tests
      .map((t) => ({
        title: t.titlePath().slice(2).join(' › '),
        project: t.parent.project()?.name ?? 'default',
        ms: t.results.reduce((sum, r) => sum + r.duration, 0),
      }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5);

    const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

    // ---- terminal --------------------------------------------------------------------
    console.log('\n──── Run summary ────');
    console.log(
      `${tests.length} tests | ${totals.passed} passed | ${totals.failed} failed | ` +
        `${totals.flaky} flaky | ${totals.skipped} skipped | ${seconds(result.duration)}`,
    );

    // ---- GitHub job summary ----------------------------------------------------------
    const file = process.env.GITHUB_STEP_SUMMARY;
    if (!file) return;

    const lines = [
      '## Playwright run summary',
      '',
      `**${tests.length}** tests in **${seconds(result.duration)}** — status: \`${result.status}\``,
      '',
      '| Project | Passed | Failed | Flaky | Skipped |',
      '| --- | ---: | ---: | ---: | ---: |',
      ...[...byProject].map(
        ([name, r]) => `| ${name} | ${r.passed} | ${r.failed} | ${r.flaky} | ${r.skipped} |`,
      ),
      '',
      '### Slowest tests',
      '',
      '| Test | Project | Time |',
      '| --- | --- | ---: |',
      ...slowest.map((s) => `| ${s.title} | ${s.project} | ${seconds(s.ms)} |`),
      '',
    ];
    fs.appendFileSync(file, lines.join('\n'));
  }
}

module.exports = SummaryReporter;
