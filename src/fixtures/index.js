const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { BookingClient } = require('../api/BookingClient');
const { buildBooking } = require('../data/factories');
const { env } = require('../utils/env');

const { expect } = base;

/**
 * Project-wide `test` object. Specs import this instead of '@playwright/test' so they get
 * page objects, API clients and guard rails without any setup code of their own.
 */
const test = base.test.extend({
  // ---- UI -----------------------------------------------------------------------------
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  /**
   * Overrides the built-in `page` to fail a test when the app throws an uncaught exception,
   * even if every visible assertion passed. Soft, so the real failure is still reported first.
   */
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await use(page);
    expect.soft(errors, 'uncaught exceptions in the browser').toEqual([]);
  },

  // ---- API ----------------------------------------------------------------------------
  bookingApi: async ({ request }, use) => {
    await use(new BookingClient(request, { username: env.apiUsername, password: env.apiPassword }));
  },

  /**
   * Factory that creates bookings and guarantees they are deleted afterwards, pass or fail.
   * Tests never leave data behind on the shared demo service.
   */
  bookings: async ({ bookingApi }, use) => {
    const createdIds = [];

    const create = async (overrides = {}) => {
      const payload = buildBooking(overrides);
      const response = await bookingApi.create(payload);
      expect(response.status(), 'booking should be created').toBe(200);
      const body = await response.json();
      createdIds.push(body.bookingid);
      return { id: body.bookingid, payload, body };
    };

    await use({ create });

    for (const id of createdIds) {
      await bookingApi.remove(id).catch(() => {});
    }
  },
});

module.exports = { test, expect };
