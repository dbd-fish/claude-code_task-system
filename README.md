# Task Manager Application

A complete, production-ready task management application built with React, TypeScript, Node.js, and PostgreSQL. Features comprehensive Docker containerization, JWT authentication, and extensive Japanese documentation.

## Features

- **User Authentication**: Secure login and registration
- **Task Management**: Create, edit, delete, and organize tasks
- **Dashboard**: Overview of task statistics and recent activities
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live updates across all connected clients
- **Dark Mode**: Toggle between light and dark themes
- **Search & Filter**: Find tasks quickly with advanced filtering
- **Export/Import**: Export tasks to various formats

## Technology Stack

### Frontend
- React 18 with TypeScript
- Modern CSS with responsive design
- React Hooks for state management
- Comprehensive test coverage with Jest and React Testing Library

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Redis for caching and sessions
- RESTful API design

### DevOps
- Docker containerization
- Docker Compose for multi-service orchestration
- Nginx reverse proxy
- Automated deployment scripts
- Health checks and monitoring

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git (for cloning the repository)

### Simple Installation (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sample_claude-code
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services (database, backend, frontend)
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Database**: localhost:5432

### Test Login Credentials
- **Admin**: admin@example.com / password123
- **User**: test@example.com / password123

### Development Environment
```bash
# Start development environment with hot reload
docker-compose up -d

# Run tests
cd frontend && npm test
cd backend && npm test
```

## Deployment Environments

### Development (with hot reload)
```bash
docker-compose up -d
```

### Production (optimized build)
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Container Management
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose build
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

## Frontend Architecture

### Directory Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── TaskForm/
│   │   └── TaskList/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── package.json
└── README.md
```

### Key Components

- **Dashboard**: Main application dashboard with statistics
- **Login**: User authentication component
- **TaskForm**: Create and edit tasks
- **TaskList**: Display and manage tasks
- **Custom Hooks**: Reusable logic for task management

### State Management

The application uses React hooks for state management:
- `useTaskManagement`: Handles task operations
- `useAuth`: Manages authentication state
- `useLocalStorage`: Persists data locally

## Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── package.json
└── README.md
```

### Key Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling
- **Rate Limiting**: Protection against abuse
- **Logging**: Structured logging with Winston
- **Testing**: Unit and integration tests

## Testing

### Frontend Tests
```bash
cd frontend
npm test                    # Run Jest + React Testing Library tests
npm run test:coverage       # Generate coverage report
npm run lint               # ESLint check
npm run format             # Prettier formatting
```

### Backend Tests
```bash
cd backend
npm test                   # Run Mocha + Chai tests
npm run test:coverage      # Generate coverage report
npm run lint              # ESLint check
node test-auth.js         # Test authentication system
```

### Testing Features
- **Unit Tests**: Components and API endpoints
- **Integration Tests**: Database operations and API flows
- **Authentication Tests**: JWT token validation and user management
- **Coverage Reports**: Detailed test coverage analysis

## Monitoring & Logs

### Container Monitoring
```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db

# Monitor resource usage
docker stats
```

### Health Checks
- **Database**: Automatic connection health checks
- **Backend API**: Health endpoint at `/health`
- **Frontend**: Nginx status monitoring

## Security

### Implemented Security Measures

- **Authentication**: JWT tokens with secure storage
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Configured cross-origin resource sharing
- **Rate Limiting**: Protection against brute force attacks
- **HTTPS**: SSL/TLS encryption in production
- **Security Headers**: Comprehensive security headers
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy

## Performance

### Optimization Techniques

- **Code Splitting**: Lazy loading of components
- **Caching**: Redis caching for frequently accessed data
- **Database Optimization**: Indexed queries and connection pooling
- **Asset Optimization**: Minification and compression
- **CDN**: Content delivery network for static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation as needed
- Ensure code passes all linters and tests

## Documentation

### 📚 Japanese Documentation (docs/ folder)
- **システム操作マニュアル.md** - Complete user manual with login instructions
- **Docker環境構築ガイド.md** - Docker setup and troubleshooting guide
- **開発・テスト実行ガイド.md** - Development and testing workflows
- **API仕様書.md** - Complete REST API documentation

### Quick Documentation Access
```bash
# View documentation structure
ls docs/

# Quick start guide for Windows users
cat docs/Docker環境構築ガイド.md
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Common Issues

1. **Container Access Issues**
   ```bash
   # Check container status
   docker-compose ps
   
   # View container logs
   docker-compose logs <service_name>
   ```

2. **Port Conflicts**
   - Ensure ports 3000, 5000, 5432 are available
   - Stop Apache2 if running: `sudo systemctl stop apache2`

3. **Docker Permission Issues (Linux)**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Restart terminal session
   ```

4. **Windows/WSL Issues**
   - Use Windows paths: `C:\Users\{user_name}\Documents\github\sample_claude-code`
   - Ensure Docker Desktop is running
   - Enable WSL integration in Docker Desktop

### Quick Fixes

```bash
# Restart all services
docker-compose down && docker-compose up -d

# Clear and rebuild
docker-compose down -v
docker-compose build
docker-compose up -d

# Check service health
curl http://localhost:3000  # Frontend
curl http://localhost:5000  # Backend API
```

### Getting Help

- Check comprehensive troubleshooting: `docs/Docker環境構築ガイド.md`
- View application logs: `docker-compose logs -f`
- Test authentication: `cd backend && node test-auth.js`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Status

### ✅ Completed Features (15/15 tasks)
- Complete React + TypeScript frontend
- Full Node.js + Express backend with REST API
- PostgreSQL database with Sequelize ORM
- JWT authentication system
- Docker containerization (development & production)
- Comprehensive testing infrastructure
- Japanese documentation suite
- Windows/WSL compatibility

### 🚀 Ready for Production
This application is production-ready with:
- Optimized Docker containers
- Security best practices
- Comprehensive error handling
- Health monitoring
- Performance optimization

## Acknowledgments

- React team for the robust frontend framework
- Node.js and Express.js communities
- PostgreSQL for reliable data persistence
- Docker for seamless containerization
- Claude Code for development automation
- tmux-based multi-agent development methodology