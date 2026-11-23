const { test: setup, expect } = require('../../src/fixtures');
const { users } = require('../../src/data/users');
const { AUTH_FILE } = require('../../src/utils/paths');

// Runs once before the browser projects. Logging in through the UI for every test would
// dominate the suite's runtime, so the session is cached and reused via storageState.
setup('authenticate as standard user', async ({ loginPage, inventoryPage, page }) => {
  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(inventoryPage.title).toHaveText('Products');

  await page.context().storageState({ path: AUTH_FILE });
});
