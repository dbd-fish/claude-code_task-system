const { teardownTestDatabase } = require('./setup');

module.exports = async () => {
  console.log('Tearing down test database...');
  await teardownTestDatabase();
};