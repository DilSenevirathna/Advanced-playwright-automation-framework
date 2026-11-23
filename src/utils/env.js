const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

/**
 * Single place where environment variables are read and given defaults.
 * Tests and config import from here instead of touching process.env directly.
 */
const env = Object.freeze({
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
  apiUsername: process.env.API_USERNAME || 'admin',
  apiPassword: process.env.API_PASSWORD || 'password123',
  saucePassword: process.env.SAUCE_PASSWORD || 'secret_sauce',
  isCI: !!process.env.CI,
  headed: process.env.HEADED === 'true',
});

module.exports = { env };
