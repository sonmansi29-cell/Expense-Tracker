// Server test setup - Jest compatible
// This setup doesn't require actual database connections

// Mock path module
const path = {
  resolve: (...args) => args.join('/')
};

module.exports = {
  path
};

