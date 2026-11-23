const { env } = require('../utils/env');

/** Public demo accounts provided by SauceDemo. Each one exercises a different behaviour. */
const users = Object.freeze({
  standard: { username: 'standard_user', password: env.saucePassword },
  lockedOut: { username: 'locked_out_user', password: env.saucePassword },
  problem: { username: 'problem_user', password: env.saucePassword },
  slow: { username: 'performance_glitch_user', password: env.saucePassword },
});

module.exports = { users };
