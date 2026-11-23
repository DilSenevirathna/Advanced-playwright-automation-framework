const { test, expect } = require('../../src/fixtures');

// Uses the cached session from the project's storageState.
test.describe('Session', () => {
  test(
    'a cached session skips the login screen',
    { tag: ['@smoke'] },
    async ({ inventoryPage, page }) => {
      await inventoryPage.open();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.title).toHaveText('Products');
    },
  );

  test(
    'logging out returns to login and revokes access',
    { tag: ['@regression'] },
    async ({ inventoryPage, loginPage, page }) => {
      await inventoryPage.open();
      await inventoryPage.logout();

      await expect(loginPage.submit).toBeVisible();

      await inventoryPage.open();
      await expect(page).toHaveURL(/\/$/);
    },
  );
});
