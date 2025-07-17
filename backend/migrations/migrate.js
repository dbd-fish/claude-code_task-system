const { sequelize } = require('../config/database');
const { QueryInterface } = require('sequelize');

// Import migration files
const createUsers = require('./20250716-create-users');
const createTasks = require('./20250716-create-tasks');

const migrations = [
  { name: '20250716-create-users', migration: createUsers },
  { name: '20250716-create-tasks', migration: createTasks }
];

async function migrate() {
  try {
    console.log('Starting database migrations...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Create SequelizeMeta table if it doesn't exist
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: sequelize.Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      }
    }).catch(() => {
      // Table might already exist
    });
    
    // Check which migrations have been run
    const [executedMigrations] = await sequelize.query(
      "SELECT name FROM \"SequelizeMeta\"",
      { type: sequelize.QueryTypes.SELECT }
    ).catch(() => []);
    
    const executedNames = executedMigrations.map(m => m.name);
    
    // Run pending migrations
    for (const { name, migration } of migrations) {
      if (!executedNames.includes(name)) {
        console.log(`Running migration: ${name}`);
        await migration.up(queryInterface, sequelize.Sequelize);
        
        // Record migration as executed
        await sequelize.query(
          "INSERT INTO \"SequelizeMeta\" (name) VALUES (?)",
          { replacements: [name] }
        );
        
        console.log(`Migration ${name} completed`);
      } else {
        console.log(`Migration ${name} already executed`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function undo() {
  try {
    console.log('Rolling back last migration...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Get last executed migration
    const [lastMigration] = await sequelize.query(
      "SELECT name FROM \"SequelizeMeta\" ORDER BY name DESC LIMIT 1",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!lastMigration) {
      console.log('No migrations to rollback');
      return;
    }
    
    const migration = migrations.find(m => m.name === lastMigration.name);
    
    if (migration) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.migration.down(queryInterface, sequelize.Sequelize);
      
      // Remove from SequelizeMeta
      await sequelize.query(
        "DELETE FROM \"SequelizeMeta\" WHERE name = ?",
        { replacements: [migration.name] }
      );
      
      console.log(`Rollback of ${migration.name} completed`);
    }
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

module.exports = { migrate, undo };

// Run migration if called directly
if (require.main === module) {
  migrate().finally(() => process.exit(0));
}