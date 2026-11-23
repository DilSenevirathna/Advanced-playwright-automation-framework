const { BasePage } = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async open() {
    await this.goto('/inventory.html');
  }

  /** @param {{slug: string}} product */
  async addToCart(product) {
    await this.page.getByTestId(`add-to-cart-${product.slug}`).click();
  }

  /** @param {{slug: string}} product */
  async removeFromCart(product) {
    await this.page.getByTestId(`remove-${product.slug}`).click();
  }

  /** @param {'az'|'za'|'lohi'|'hilo'} option */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async names() {
    return this.itemNames.allTextContents();
  }

  async prices() {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((p) => Number(p.replace('$', '')));
  }
}

module.exports = { InventoryPage };
