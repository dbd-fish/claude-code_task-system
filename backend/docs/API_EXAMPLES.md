# API Usage Examples

This document provides practical examples of how to use the Task Management API.

## Authentication Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2023-07-16T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2023-07-16T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
}
```

### Get User Profile

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

## Task Management Examples

### Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the task management system",
    "priority": "high",
    "dueDate": "2023-07-20T23:59:59.000Z"
  }'
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the task management system",
    "status": "pending",
    "priority": "high",
    "dueDate": "2023-07-20T23:59:59.000Z",
    "completedAt": null,
    "userId": 1,
    "createdAt": "2023-07-16T10:30:00.000Z",
    "updatedAt": "2023-07-16T10:30:00.000Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Get All Tasks (with filters)

```bash
curl -X GET "http://localhost:5000/api/tasks?status=pending&priority=high&sortBy=dueDate&sortOrder=ASC&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

### Search Tasks

```bash
curl -X GET "http://localhost:5000/api/tasks?search=documentation&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

### Get Task by ID

```bash
curl -X GET http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

### Update Task Status

```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example" \
  -d '{
    "status": "in_progress"
  }'
```

### Complete a Task

```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example" \
  -d '{
    "status": "completed"
  }'
```

### Update Task Priority and Due Date

```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example" \
  -d '{
    "priority": "urgent",
    "dueDate": "2023-07-18T23:59:59.000Z"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

### Get Task Statistics

```bash
curl -X GET http://localhost:5000/api/tasks/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4OTUwNTgwMCwiZXhwIjoxNjkwMTEwNjAwfQ.example"
```

## JavaScript/Node.js Examples

### Using axios library

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Login and get token
async function login(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password
    });
    
    authToken = response.data.token;
    console.log('Login successful');
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
}

// Create a new task
async function createTask(taskData) {
  try {
    const response = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Task created:', response.data.task);
    return response.data;
  } catch (error) {
    console.error('Task creation failed:', error.response.data);
    throw error;
  }
}

// Get all tasks with filters
async function getTasks(filters = {}) {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await axios.get(`${BASE_URL}/tasks?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Tasks retrieved:', response.data.tasks.length);
    return response.data;
  } catch (error) {
    console.error('Failed to get tasks:', error.response.data);
    throw error;
  }
}

// Update task status
async function updateTaskStatus(taskId, status) {
  try {
    const response = await axios.put(`${BASE_URL}/tasks/${taskId}`, 
      { status }, 
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Task updated:', response.data.task);
    return response.data;
  } catch (error) {
    console.error('Task update failed:', error.response.data);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Login
    await login('john_doe', 'securepassword123');
    
    // Create a task
    await createTask({
      title: 'Review code changes',
      description: 'Review pull request #123',
      priority: 'medium',
      dueDate: '2023-07-18T17:00:00.000Z'
    });
    
    // Get pending tasks
    const pendingTasks = await getTasks({ status: 'pending' });
    
    // Update first task to in_progress
    if (pendingTasks.tasks.length > 0) {
      await updateTaskStatus(pendingTasks.tasks[0].id, 'in_progress');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
main();
```

## Frontend Integration Examples

### React with fetch API

```jsx
import React, { useState, useEffect } from 'react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  
  const API_BASE = 'http://localhost:5000/api';
  
  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  // Create task
  const createTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, data.task]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(task => 
          task.id === taskId ? data.task : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);
  
  return (
    <div>
      <h1>Task Manager</h1>
      {/* Your UI components here */}
    </div>
  );
};

export default TaskManager;
```

## Error Handling Examples

### Handling Common Errors

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorData.error}`);
        case 401:
          throw new Error('Unauthorized: Please log in again');
        case 403:
          throw new Error('Forbidden: Access denied');
        case 404:
          throw new Error('Not Found: Resource not found');
        case 500:
          throw new Error('Server Error: Please try again later');
        default:
          throw new Error(`HTTP Error: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}
```

## Testing Examples

### Using Jest and supertest

```javascript
const request = require('supertest');
const app = require('../index');

describe('Task API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });
      
    authToken = loginResponse.body.token;
  });
  
  test('should create a new task', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'medium'
    };
    
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData);
      
    expect(response.status).toBe(201);
    expect(response.body.task.title).toBe(taskData.title);
  });
  
  test('should get all tasks', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });
});
```