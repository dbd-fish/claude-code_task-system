const { sequelize } = require('../config/database');

// Import seeder files
const demoUsers = require('./20250716-demo-users');
const demoTasks = require('./20250716-demo-tasks');

const seeders = [
  { name: '20250716-demo-users', seeder: demoUsers },
  { name: '20250716-demo-tasks', seeder: demoTasks }
];

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Run seeders
    for (const { name, seeder } of seeders) {
      console.log(`Running seeder: ${name}`);
      await seeder.up(queryInterface, sequelize.Sequelize);
      console.log(`Seeder ${name} completed`);
    }
    
    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

async function unseed() {
  try {
    console.log('Rolling back seeders...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Run seeders in reverse order
    for (const { name, seeder } of seeders.reverse()) {
      console.log(`Rolling back seeder: ${name}`);
      await seeder.down(queryInterface, sequelize.Sequelize);
      console.log(`Seeder ${name} rolled back`);
    }
    
    console.log('All seeders rolled back successfully');
  } catch (error) {
    console.error('Seeder rollback failed:', error);
    process.exit(1);
  }
}

module.exports = { seed, unseed };

// Run seeding if called directly
if (require.main === module) {
  seed().finally(() => process.exit(0));
}