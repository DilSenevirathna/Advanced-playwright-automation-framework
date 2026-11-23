const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShopping = page.getByTestId('continue-shopping');
  }

  async open() {
    await this.goto('/cart.html');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
