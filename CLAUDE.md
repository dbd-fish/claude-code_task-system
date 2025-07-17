# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a complete full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. The project includes comprehensive Docker containerization, testing infrastructure, and Japanese documentation. Originally developed using a multi-pane tmux workflow with all 15 development tasks successfully completed.

## Project Structure

- `frontend/` - React + TypeScript frontend application with responsive design
- `backend/` - Node.js + Express REST API server with JWT authentication
- `database/` - PostgreSQL initialization scripts and seed data
- `nginx/` - Nginx reverse proxy configuration
- `docs/` - Comprehensive Japanese documentation (システム操作マニュアル, Docker環境構築ガイド, etc.)
- `task.md` - Completed development task checklist (15/15 tasks completed)
- `claude-tmux.md` - tmux-based development workflow documentation
- `メモ.txt` - Development notes and tmux configuration commands

## Quick Start

### Simple Docker Startup (Recommended)
```bash
# Navigate to project directory
cd /mnt/c/Users/{user_name}}/Documents/github/sample_claude-code

# Start all services with simplified configuration
docker-compose -f docker-compose.simple.yml up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

### Test Login Credentials
- **Admin**: admin@example.com / password123
- **User**: test@example.com / password123

### Development Environment
```bash
# Start development environment with hot reload and volume mounting
docker-compose up -d

# Run tests
cd frontend && npm test
cd backend && npm test

# Run linting
cd frontend && npm run lint
cd backend && npm run lint
```

## Technology Stack (Implemented)

### Frontend
- **React 18** with TypeScript and modern hooks
- **CSS Modules** with responsive design
- **React Testing Library** + Jest for comprehensive testing
- **ESLint** + Prettier for code quality

### Backend
- **Node.js** + Express.js RESTful API
- **Sequelize ORM** with PostgreSQL
- **JWT Authentication** with bcrypt password hashing
- **Mocha/Chai** testing framework
- **Input validation** and error handling middleware

### Database & Infrastructure
- **PostgreSQL 13** with persistent data storage
- **Docker** + Docker Compose orchestration
- **Nginx** reverse proxy (production)
- **Health checks** and monitoring

## Development Commands

### Docker Operations
```bash
# Start services (simple/production)
docker-compose -f docker-compose.simple.yml up -d

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose build
```

### Testing & Quality Assurance
```bash
# Frontend testing
cd frontend
npm test                    # Run tests
npm run test:coverage       # Coverage report
npm run lint               # ESLint check
npm run format             # Prettier formatting

# Backend testing
cd backend
npm test                   # Run Mocha tests
npm run test:coverage      # Coverage report
npm run lint              # ESLint check

# Authentication testing
node test-auth.js         # Test auth system
```

## Documentation

Comprehensive Japanese documentation is available in the `/docs` folder:

- **システム操作マニュアル.md** - User manual with login instructions
- **Docker環境構築ガイド.md** - Complete Docker setup and troubleshooting
- **開発・テスト実行ガイド.md** - Development and testing workflows
- **API仕様書.md** - Complete API documentation

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000, 5000, 5432 are available
2. **Apache2 conflicts**: Stop Apache2 if running on port 80
3. **Docker permissions**: Add user to docker group on Linux
4. **Windows WSL**: Use Docker Desktop with WSL integration

### Windows-Specific Setup
```cmd
# Use Windows paths in Command Prompt
cd C:\Users\{user_name}\Documents\github\sample_claude-code
docker-compose -f docker-compose.simple.yml up -d
```

### Docker関連の問題

#### localhost:3000にアクセスできない場合
1. **Docker権限の確認**
   ```bash
   # Dockerサービスの状態確認
   sudo systemctl status docker
   
   # ユーザーをdockerグループに追加
   sudo usermod -aG docker $USER
   # 再ログインが必要
   ```

2. **コンテナの状態確認**
   ```bash
   # 起動中のコンテナ確認
   docker ps
   
   # ログの確認
   docker-compose -f docker-compose.simple.yml logs frontend
   ```

3. **Apache2との競合確認**
   ```bash
   # Apache2の停止
   sudo systemctl stop apache2
   sudo systemctl disable apache2
   ```

## File Structure
```
sample_claude-code/
├── frontend/              # React + TypeScript app
├── backend/               # Node.js + Express API
├── database/              # PostgreSQL setup
├── nginx/                 # Nginx configuration
├── docs/                  # Japanese documentation
├── docker-compose.yml     # Development environment
├── docker-compose.simple.yml  # Production environment
└── task.md               # Completed development tasks
```

## Authentication System

The application includes a complete authentication system:
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Test authentication script (`backend/test-auth.js`)

## Testing Infrastructure

Comprehensive testing is implemented:
- **Frontend**: Jest + React Testing Library
- **Backend**: Mocha + Chai + Supertest
- **Authentication**: Dedicated test scripts
- **Coverage reports**: Available for both frontend and backend
- **Linting**: ESLint + Prettier for code quality

## Important Notes

- All 15 development tasks have been completed successfully
- The system is production-ready with Docker containerization
- Japanese documentation provides comprehensive user and developer guides
- Windows/WSL compatibility has been thoroughly tested and documented
- Authentication system is fully functional with test accounts
- Testing infrastructure covers both unit and integration tests