const { test, expect } = require('../../src/fixtures');

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test(
    'lists six products, each with a name and a price',
    { tag: ['@smoke'] },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(6);
      for (const item of await inventoryPage.items.all()) {
        await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
        await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      }
    },
  );

  const sortCases = [
    {
      label: 'name A → Z',
      option: 'az',
      read: (p) => p.names(),
      expected: (v) => [...v].sort(),
    },
    {
      label: 'name Z → A',
      option: 'za',
      read: (p) => p.names(),
      expected: (v) => [...v].sort().reverse(),
    },
    {
      label: 'price low → high',
      option: 'lohi',
      read: (p) => p.prices(),
      expected: (v) => [...v].sort((a, b) => a - b),
    },
    {
      label: 'price high → low',
      option: 'hilo',
      read: (p) => p.prices(),
      expected: (v) => [...v].sort((a, b) => b - a),
    },
  ];

  for (const { label, option, read, expected } of sortCases) {
    test(`sorts by ${label}`, { tag: ['@regression'] }, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);

      const actual = await read(inventoryPage);
      expect(actual).toEqual(expected(actual));
    });
  }
});
