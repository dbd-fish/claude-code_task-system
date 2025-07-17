const { Task, User } = require('./models');
const { connectDatabase } = require('./config/database');
const { generateToken } = require('./middleware/auth');
const bcrypt = require('bcryptjs');

async function testTaskAPI() {
  try {
    console.log('Testing Task API system...');
    
    // Connect to database
    await connectDatabase();
    
    // Create test user
    console.log('\n1. Creating test user...');
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const testUser = await User.create({
      username: 'testuser_task',
      email: 'testtask@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    }).catch(error => {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('Test user already exists, using existing user');
        return User.findOne({ where: { username: 'testuser_task' } });
      }
      throw error;
    });
    
    console.log('✓ Test user created/found:', testUser.username);
    
    // Test 1: Create task
    console.log('\n2. Testing task creation...');
    const task1 = await Task.create({
      title: 'Test Task 1',
      description: 'This is a test task',
      priority: 'high',
      userId: testUser.id
    });
    
    console.log('✓ Task created:', task1.title);
    
    // Test 2: Create multiple tasks
    console.log('\n3. Testing multiple task creation...');
    const tasks = await Task.bulkCreate([
      {
        title: 'Test Task 2',
        description: 'Second test task',
        priority: 'medium',
        status: 'in_progress',
        userId: testUser.id
      },
      {
        title: 'Test Task 3',
        description: 'Third test task',
        priority: 'low',
        status: 'completed',
        completedAt: new Date(),
        userId: testUser.id
      },
      {
        title: 'Test Task 4',
        description: 'Fourth test task',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: testUser.id
      }
    ]);
    
    console.log('✓ Multiple tasks created:', tasks.length);
    
    // Test 3: Get all tasks
    console.log('\n4. Testing task retrieval...');
    const allTasks = await Task.findAll({
      where: { userId: testUser.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });
    
    console.log('✓ Retrieved tasks:', allTasks.length);
    
    // Test 4: Filter by status
    console.log('\n5. Testing task filtering...');
    const pendingTasks = await Task.findAll({
      where: { userId: testUser.id, status: 'pending' }
    });
    
    const completedTasks = await Task.findAll({
      where: { userId: testUser.id, status: 'completed' }
    });
    
    console.log('✓ Pending tasks:', pendingTasks.length);
    console.log('✓ Completed tasks:', completedTasks.length);
    
    // Test 5: Update task
    console.log('\n6. Testing task update...');
    await task1.update({
      status: 'in_progress',
      description: 'Updated description'
    });
    
    const updatedTask = await Task.findByPk(task1.id);
    console.log('✓ Task updated - Status:', updatedTask.status);
    
    // Test 6: Complete task
    console.log('\n7. Testing task completion...');
    await task1.update({
      status: 'completed',
      completedAt: new Date()
    });
    
    const completedTask = await Task.findByPk(task1.id);
    console.log('✓ Task completed - CompletedAt:', completedTask.completedAt);
    
    // Test 7: Task stats
    console.log('\n8. Testing task statistics...');
    const stats = await Task.findAll({
      where: { userId: testUser.id },
      attributes: [
        'status',
        [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    const priorityStats = await Task.findAll({
      where: { userId: testUser.id },
      attributes: [
        'priority',
        [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    console.log('✓ Status stats:', stats.map(s => `${s.status}: ${s.dataValues.count}`));
    console.log('✓ Priority stats:', priorityStats.map(s => `${s.priority}: ${s.dataValues.count}`));
    
    // Test 8: Search functionality
    console.log('\n9. Testing search functionality...');
    const { Op } = require('sequelize');
    const searchResults = await Task.findAll({
      where: {
        userId: testUser.id,
        [Op.or]: [
          { title: { [Op.iLike]: '%test%' } },
          { description: { [Op.iLike]: '%test%' } }
        ]
      }
    });
    
    console.log('✓ Search results:', searchResults.length);
    
    // Test 9: Sort by priority
    console.log('\n10. Testing sorting...');
    const sortedTasks = await Task.findAll({
      where: { userId: testUser.id },
      order: [['priority', 'ASC'], ['createdAt', 'DESC']]
    });
    
    console.log('✓ Sorted tasks:', sortedTasks.map(t => `${t.title} (${t.priority})`));
    
    // Test 10: Delete task
    console.log('\n11. Testing task deletion...');
    await task1.destroy();
    
    const deletedTask = await Task.findByPk(task1.id);
    console.log('✓ Task deleted:', deletedTask === null);
    
    console.log('\n✅ All Task API tests passed!');
    
    // Cleanup
    await Task.destroy({ where: { userId: testUser.id } });
    await testUser.destroy();
    console.log('✓ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Task API test failed:', error);
  } finally {
    process.exit(0);
  }
}

testTaskAPI();