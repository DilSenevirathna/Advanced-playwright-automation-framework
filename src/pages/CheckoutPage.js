const { BasePage } = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.error = page.getByTestId('error');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.confirmation = page.getByTestId('complete-header');
  }

  async fillShipping({ firstName, lastName, postalCode }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  /** Reads labels like "Item total: $29.99" as numbers. */
  async amounts() {
    const parse = async (locator) => Number((await locator.innerText()).match(/\$([\d.]+)/)[1]);
    return {
      subtotal: await parse(this.subtotal),
      tax: await parse(this.tax),
      total: await parse(this.total),
    };
  }
}

module.exports = { CheckoutPage };
