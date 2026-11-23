const { test, expect } = require('../../src/fixtures');
const { users } = require('../../src/data/users');

// These tests are about getting *into* the app, so they start with no session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'standard user lands on the product catalogue',
    { tag: ['@smoke'] },
    async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(users.standard);

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.title).toHaveText('Products');
      await expect(inventoryPage.items).toHaveCount(6);
    },
  );

  const rejected = [
    { name: 'a locked-out user', creds: users.lockedOut, message: /locked out/i },
    {
      name: 'a wrong password',
      creds: { username: users.standard.username, password: 'not-the-password' },
      message: /do not match any user/i,
    },
    {
      name: 'an empty username',
      creds: { username: '', password: users.standard.password },
      message: /Username is required/i,
    },
    {
      name: 'an empty password',
      creds: { username: users.standard.username, password: '' },
      message: /Password is required/i,
    },
  ];

  for (const { name, creds, message } of rejected) {
    test(`rejects ${name}`, { tag: ['@regression'] }, async ({ loginPage, page }) => {
      await loginPage.login(creds);

      await expect(loginPage.error).toBeVisible();
      await expect(loginPage.error).toContainText(message);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test(
    'protected pages bounce anonymous visitors back to login',
    { tag: ['@regression'] },
    async ({ loginPage, inventoryPage, page }) => {
      await inventoryPage.open();

      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.error).toContainText(
        /only access '\/inventory\.html' when you are logged in/i,
      );
    },
  );

  test(
    'a slow backend still logs the user in',
    { tag: ['@regression'] },
    async ({ loginPage, page }) => {
      // performance_glitch_user is deliberately slow; this checks we wait on the right signal
      // (the URL) instead of papering over it with fixed sleeps.
      await loginPage.login(users.slow);

      await expect(page).toHaveURL(/inventory\.html/, { timeout: 20_000 });
    },
  );
});
