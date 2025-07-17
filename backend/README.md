# Task Management Backend

## Database Setup

### Prerequisites
- PostgreSQL server running
- Database `task_management_dev` created

### Setup Commands

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed database with demo data
npm run seed

# Start development server
npm run dev
```

### Database Commands

```bash
# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:undo

# Seed database
npm run seed

# Remove seeded data
npm run seed:undo
```

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- firstName
- lastName
- isActive
- lastLogin
- createdAt
- updatedAt

### Tasks Table
- id (Primary Key)
- title
- description
- status (pending, in_progress, completed, cancelled)
- priority (low, medium, high, urgent)
- dueDate
- completedAt
- userId (Foreign Key)
- createdAt
- updatedAt

## Environment Configuration

Configure database connection in `config/config.json`:

```json
{
  "development": {
    "username": "postgres",
    "password": "password",
    "database": "task_management_dev",
    "host": "localhost",
    "dialect": "postgres",
    "port": 5432
  }
}
```