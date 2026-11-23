const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

module.exports = {
  ROOT,
  /** Where the authenticated browser session is cached by tests/setup/auth.setup.js */
  AUTH_FILE: path.join(ROOT, 'playwright', '.auth', 'standard-user.json'),
};
