# API Error Codes Reference

This document provides a comprehensive list of all error codes and messages returned by the Task Management API.

## HTTP Status Codes

### 2xx Success
- **200 OK** - Request successful
- **201 Created** - Resource created successfully

### 4xx Client Errors
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found

### 5xx Server Errors
- **500 Internal Server Error** - Server error

## Authentication Errors

### Registration Errors (POST /api/auth/register)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Username, email, and password are required` | 400 | Missing required fields |
| `Password must be at least 6 characters long` | 400 | Password too short |
| `User with this username or email already exists` | 400 | Duplicate username or email |
| `Internal server error` | 500 | Server error during registration |

### Login Errors (POST /api/auth/login)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Username and password are required` | 400 | Missing required fields |
| `Invalid credentials` | 400 | Wrong username/password combination |
| `Account is inactive` | 400 | User account is deactivated |
| `Internal server error` | 500 | Server error during login |

### Profile Errors (GET/PUT /api/auth/profile)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `No token provided` | 401 | Missing Authorization header |
| `Invalid token` | 401 | Malformed or expired JWT token |
| `User not found or inactive` | 401 | User doesn't exist or is inactive |
| `Email already in use by another user` | 400 | Email conflict during update |
| `Internal server error` | 500 | Server error during profile operations |

## Task Management Errors

### Task Creation Errors (POST /api/tasks)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Title is required` | 400 | Missing or empty title |
| `Title must be 200 characters or less` | 400 | Title too long |
| `Priority must be one of: low, medium, high, urgent` | 400 | Invalid priority value |
| `Invalid due date format` | 400 | Malformed due date |
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during task creation |

### Task Retrieval Errors (GET /api/tasks)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Invalid status. Must be one of: pending, in_progress, completed, cancelled` | 400 | Invalid status filter |
| `Invalid priority. Must be one of: low, medium, high, urgent` | 400 | Invalid priority filter |
| `Invalid sortBy field. Must be one of: createdAt, updatedAt, title, priority, dueDate, status` | 400 | Invalid sort field |
| `Invalid sortOrder. Must be ASC or DESC` | 400 | Invalid sort order |
| `Invalid pagination parameters` | 400 | Invalid page or limit values |
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during task retrieval |

### Task Detail Errors (GET /api/tasks/:id)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Task not found` | 404 | Task doesn't exist or doesn't belong to user |
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during task retrieval |

### Task Update Errors (PUT /api/tasks/:id)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Task not found` | 404 | Task doesn't exist or doesn't belong to user |
| `Title cannot be empty` | 400 | Empty title provided |
| `Title must be 200 characters or less` | 400 | Title too long |
| `Status must be one of: pending, in_progress, completed, cancelled` | 400 | Invalid status value |
| `Priority must be one of: low, medium, high, urgent` | 400 | Invalid priority value |
| `Invalid due date format` | 400 | Malformed due date |
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during task update |

### Task Deletion Errors (DELETE /api/tasks/:id)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Task not found` | 404 | Task doesn't exist or doesn't belong to user |
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during task deletion |

### Task Statistics Errors (GET /api/tasks/stats)

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `No token provided` | 401 | Missing authentication |
| `Invalid token` | 401 | Invalid JWT token |
| `User not found or inactive` | 401 | User authentication failed |
| `Internal server error` | 500 | Server error during statistics retrieval |

## General API Errors

### Route Not Found
| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Route not found` | 404 | Endpoint doesn't exist |

### Server Errors
| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Internal Server Error` | 500 | Generic server error (production) |
| `[Specific error message]` | 500 | Detailed error message (development) |

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Common Error Scenarios

### 1. Authentication Issues

**Missing Token:**
```json
{
  "error": "No token provided"
}
```

**Invalid Token:**
```json
{
  "error": "Invalid token"
}
```

**Expired Token:**
```json
{
  "error": "Invalid token"
}
```

### 2. Validation Errors

**Missing Required Field:**
```json
{
  "error": "Title is required"
}
```

**Invalid Enum Value:**
```json
{
  "error": "Priority must be one of: low, medium, high, urgent"
}
```

**String Length Validation:**
```json
{
  "error": "Title must be 200 characters or less"
}
```

### 3. Resource Not Found

**Task Not Found:**
```json
{
  "error": "Task not found"
}
```

**User Not Found:**
```json
{
  "error": "User not found or inactive"
}
```

### 4. Duplicate Resource

**User Already Exists:**
```json
{
  "error": "User with this username or email already exists"
}
```

**Email Conflict:**
```json
{
  "error": "Email already in use by another user"
}
```

## Error Handling Best Practices

### Frontend Error Handling

```javascript
async function handleApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    switch (error.status) {
      case 400:
        console.error('Validation Error:', error.message);
        // Show user-friendly validation message
        break;
      case 401:
        console.error('Authentication Error:', error.message);
        // Redirect to login page
        break;
      case 403:
        console.error('Authorization Error:', error.message);
        // Show access denied message
        break;
      case 404:
        console.error('Not Found Error:', error.message);
        // Show not found message
        break;
      case 500:
        console.error('Server Error:', error.message);
        // Show generic error message
        break;
      default:
        console.error('Unknown Error:', error.message);
        // Show generic error message
        break;
    }
  }
}
```

### Backend Error Logging

The API logs errors with different levels:

- **Error Level**: 500 Internal Server Error
- **Warn Level**: 400 Bad Request, 401 Unauthorized, 403 Forbidden
- **Info Level**: 404 Not Found

### Rate Limiting Errors (Future Implementation)

When rate limiting is implemented, expect these errors:

| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Too many requests, please try again later` | 429 | Rate limit exceeded |
| `Rate limit exceeded for this endpoint` | 429 | Endpoint-specific rate limit |

## Database Errors

### Connection Errors
| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Unable to connect to the database` | 500 | Database connection failed |
| `Database timeout` | 500 | Database query timeout |

### Constraint Violations
| Error Message | Status Code | Description |
|---------------|-------------|-------------|
| `Unique constraint violation` | 400 | Duplicate unique field |
| `Foreign key constraint violation` | 400 | Invalid foreign key reference |

## Security Errors

### SQL Injection Prevention
The API uses Sequelize ORM which prevents SQL injection attacks. Any attempt to inject SQL will result in a validation error.

### XSS Prevention
All user inputs are sanitized. Malicious script injection attempts will be blocked.

### CSRF Protection
CSRF tokens are not currently implemented but should be added for production use.

## Debugging Tips

1. **Check HTTP Status Code**: Always check the status code first
2. **Read Error Message**: Error messages provide specific information about what went wrong
3. **Verify Token**: Ensure JWT token is valid and not expired
4. **Check Request Format**: Verify that request body matches the expected format
5. **Validate Input**: Ensure all required fields are provided and valid

## Error Monitoring

For production environments, consider implementing:

- **Error Tracking**: Use services like Sentry or Rollbar
- **Logging**: Implement structured logging with correlation IDs
- **Metrics**: Track error rates and response times
- **Alerts**: Set up alerts for critical errors

## Contact Support

If you encounter persistent errors not covered in this documentation, please:

1. Check the API logs for detailed error information
2. Verify your implementation against the API examples
3. Contact the development team with error details and reproduction steps