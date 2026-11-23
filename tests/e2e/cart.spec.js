const { test, expect } = require('../../src/fixtures');
const { products } = require('../../src/data/products');

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test(
    'badge tracks the number of items added and removed',
    { tag: ['@smoke'] },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.cartBadge).toBeHidden();

      await inventoryPage.addToCart(products.backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.addToCart(products.bikeLight);
      await expect(inventoryPage.cartBadge).toHaveText('2');

      await inventoryPage.removeFromCart(products.backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.removeFromCart(products.bikeLight);
      await expect(inventoryPage.cartBadge).toBeHidden();
    },
  );

  test(
    'cart page shows exactly what was added',
    { tag: ['@regression'] },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(products.boltTShirt);
      await inventoryPage.addToCart(products.onesie);
      await inventoryPage.openCart();

      await expect(cartPage.items).toHaveCount(2);
      await expect(cartPage.itemNames).toHaveText([products.boltTShirt.name, products.onesie.name]);
    },
  );

  test(
    'cart contents survive a page reload',
    { tag: ['@regression'] },
    async ({ inventoryPage, cartPage, page }) => {
      await inventoryPage.addToCart(products.backpack);
      await page.reload();
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.openCart();
      await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
    },
  );
});
