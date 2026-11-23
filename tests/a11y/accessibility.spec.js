const { AxeBuilder } = require('@axe-core/playwright');
const { test, expect } = require('../../src/fixtures');
const { users } = require('../../src/data/users');
const baseline = require('../../src/data/a11yBaseline');

/**
 * Runs axe-core against the page, attaches the full findings to the report, and fails only on
 * *new* critical violations (see src/data/a11yBaseline.js).
 */
async function scan(page, testInfo, name) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  await testInfo.attach(`axe-${name}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const blocking = results.violations
    .filter((v) => v.impact === 'critical' && !(v.id in baseline))
    .map((v) => ({ rule: v.id, help: v.help, nodes: v.nodes.length }));

  expect(blocking, `critical accessibility violations on ${name}`).toEqual([]);
}

test.describe('Accessibility', () => {
  test.describe('signed out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test(
      'login page has no new critical violations',
      { tag: ['@a11y'] },
      async ({ loginPage, page }, testInfo) => {
        await loginPage.open();
        await scan(page, testInfo, 'login');
      },
    );

    test(
      'login form is fully operable by keyboard',
      { tag: ['@a11y'] },
      async ({ loginPage, page }) => {
        await loginPage.open();

        await loginPage.username.focus();
        await page.keyboard.type(users.standard.username);
        await page.keyboard.press('Tab');
        await expect(loginPage.password).toBeFocused();
        await page.keyboard.type(users.standard.password);
        await page.keyboard.press('Enter');

        await expect(page).toHaveURL(/inventory\.html/);
      },
    );
  });

  test.describe('signed in', () => {
    test(
      'catalogue has no new critical violations',
      { tag: ['@a11y'] },
      async ({ inventoryPage, page }, testInfo) => {
        await inventoryPage.open();
        await scan(page, testInfo, 'catalogue');
      },
    );

    test(
      'cart has no new critical violations',
      { tag: ['@a11y'] },
      async ({ cartPage, page }, testInfo) => {
        await cartPage.open();
        await scan(page, testInfo, 'cart');
      },
    );
  });
});
