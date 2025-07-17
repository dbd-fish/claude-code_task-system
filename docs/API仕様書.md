# Task Management API Documentation

## Overview
This is a RESTful API for a task management system built with Node.js, Express, and PostgreSQL.

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Common Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "message": "Success message",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication API

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string (required, 3-50 characters)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)",
  "firstName": "string (optional, max 50 characters)",
  "lastName": "string (optional, max 50 characters)"
}
```

**Response (201 Created):**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields, invalid email, password too short, or user already exists

### Login
Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string (required, username or email)",
  "password": "string (required)"
}
```

**Response (200 OK):**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid credentials or inactive account

### Get Profile
Get current user profile information.

**Endpoint:** `GET /api/auth/profile`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2023-07-16T10:30:00.000Z",
    "createdAt": "2023-07-16T09:00:00.000Z",
    "updatedAt": "2023-07-16T10:30:00.000Z"
  }
}
```

### Update Profile
Update user profile information.

**Endpoint:** `PUT /api/auth/profile`

**Headers:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional, valid email)"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2023-07-16T10:30:00.000Z",
    "createdAt": "2023-07-16T09:00:00.000Z",
    "updatedAt": "2023-07-16T10:35:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Email already in use by another user

### Logout
Logout user (client-side token removal).

**Endpoint:** `POST /api/auth/logout`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Task Management API

### Create Task
Create a new task.

**Endpoint:** `POST /api/tasks`

**Headers:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string (required, max 200 characters)",
  "description": "string (optional)",
  "priority": "string (optional, enum: 'low', 'medium', 'high', 'urgent')",
  "dueDate": "string (optional, ISO date format)"
}
```

**Response (201 Created):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
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

**Error Responses:**
- `400 Bad Request` - Missing title, title too long, invalid priority, or invalid due date

### Get Tasks
Retrieve tasks with filtering, sorting, and pagination.

**Endpoint:** `GET /api/tasks`

**Headers:** 
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `search` - Search in title and description
- `sortBy` - Sort field (createdAt, updatedAt, title, priority, dueDate, status)
- `sortOrder` - Sort order (ASC, DESC)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Example Request:**
```
GET /api/tasks?status=pending&priority=high&search=documentation&sortBy=dueDate&sortOrder=ASC&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
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
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get Task by ID
Retrieve a specific task by its ID.

**Endpoint:** `GET /api/tasks/:id`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "task": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
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

**Error Responses:**
- `404 Not Found` - Task not found or doesn't belong to the user

### Update Task
Update an existing task.

**Endpoint:** `PUT /api/tasks/:id`

**Headers:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string (optional, max 200 characters)",
  "description": "string (optional)",
  "status": "string (optional, enum: 'pending', 'in_progress', 'completed', 'cancelled')",
  "priority": "string (optional, enum: 'low', 'medium', 'high', 'urgent')",
  "dueDate": "string (optional, ISO date format or null)"
}
```

**Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "completed",
    "priority": "high",
    "dueDate": "2023-07-20T23:59:59.000Z",
    "completedAt": "2023-07-16T15:30:00.000Z",
    "userId": 1,
    "createdAt": "2023-07-16T10:30:00.000Z",
    "updatedAt": "2023-07-16T15:30:00.000Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `404 Not Found` - Task not found or doesn't belong to the user

### Delete Task
Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Task not found or doesn't belong to the user

### Get Task Statistics
Get task statistics for the current user.

**Endpoint:** `GET /api/tasks/stats`

**Headers:** 
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "totalTasks": 25,
  "completedTasks": 15,
  "overdueTasks": 3,
  "statusBreakdown": {
    "pending": 8,
    "in_progress": 2,
    "completed": 15,
    "cancelled": 0
  },
  "priorityBreakdown": {
    "low": 5,
    "medium": 12,
    "high": 6,
    "urgent": 2
  }
}
```

---

## Data Models

### User Model
```json
{
  "id": "integer (primary key)",
  "username": "string (unique, 3-50 characters)",
  "email": "string (unique, valid email)",
  "password": "string (hashed)",
  "firstName": "string (optional, max 50 characters)",
  "lastName": "string (optional, max 50 characters)",
  "isActive": "boolean (default: true)",
  "lastLogin": "datetime (nullable)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Task Model
```json
{
  "id": "integer (primary key)",
  "title": "string (max 200 characters)",
  "description": "text (optional)",
  "status": "enum ('pending', 'in_progress', 'completed', 'cancelled')",
  "priority": "enum ('low', 'medium', 'high', 'urgent')",
  "dueDate": "datetime (optional)",
  "completedAt": "datetime (optional)",
  "userId": "integer (foreign key)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Title is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

#### 404 Not Found
```json
{
  "error": "Task not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS
The API supports CORS for cross-origin requests. Development environment allows requests from `http://localhost:3000`.

## Testing
Use the provided test scripts to verify API functionality:
- `npm run test:auth` - Test authentication endpoints
- `npm run test:tasks` - Test task management endpoints