const { setupTestDatabase } = require('./setup');

module.exports = async () => {
  console.log('Setting up test database...');
  await setupTestDatabase();
};