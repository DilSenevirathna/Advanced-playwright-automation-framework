const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async open() {
    await this.goto('/');
  }

  async login({ username, password }) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}

module.exports = { LoginPage };
