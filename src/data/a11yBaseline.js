/**
 * Accessibility rules that are known to fail on the third-party demo app and are therefore
 * excluded from the *blocking* check. They are still attached to every report as JSON.
 *
 * Why a baseline instead of disabling the scan: new critical issues still fail the build,
 * while pre-existing ones stay visible, documented and easy to remove once fixed.
 */
module.exports = {
  'select-name':
    'Product sort dropdown has no accessible name (SauceDemo, not owned by this repo).',
};
