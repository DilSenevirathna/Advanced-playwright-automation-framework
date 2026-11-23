const { test, expect } = require('../../src/fixtures');
const { products } = require('../../src/data/products');
const { buildCheckoutInfo } = require('../../src/data/factories');

const SALES_TAX_RATE = 0.08;

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.openCart();
    await cartPage.checkout();
  });

  test(
    'completes a purchase end to end',
    { tag: ['@smoke'] },
    async ({ checkoutPage, inventoryPage, page }) => {
      await checkoutPage.fillShipping(buildCheckoutInfo());
      await expect(page).toHaveURL(/checkout-step-two/);

      await checkoutPage.finish();

      await expect(checkoutPage.confirmation).toHaveText('Thank you for your order!');
      await expect(inventoryPage.cartBadge).toBeHidden();
    },
  );

  test('order summary maths adds up', { tag: ['@regression'] }, async ({ checkoutPage }) => {
    await checkoutPage.fillShipping(buildCheckoutInfo());

    const expectedSubtotal = products.backpack.price + products.bikeLight.price;
    const expectedTax = Math.round(expectedSubtotal * SALES_TAX_RATE * 100) / 100;
    const { subtotal, tax, total } = await checkoutPage.amounts();

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeCloseTo(expectedTax, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  const missingField = [
    { field: 'firstName', message: /First Name is required/i },
    { field: 'lastName', message: /Last Name is required/i },
    { field: 'postalCode', message: /Postal Code is required/i },
  ];

  for (const { field, message } of missingField) {
    test(
      `blocks checkout when ${field} is empty`,
      { tag: ['@regression'] },
      async ({ checkoutPage, page }) => {
        await checkoutPage.fillShipping(buildCheckoutInfo({ [field]: '' }));

        await expect(checkoutPage.error).toContainText(message);
        await expect(page).toHaveURL(/checkout-step-one/);
      },
    );
  }
});
