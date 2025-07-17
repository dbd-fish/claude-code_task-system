#!/bin/bash

# Task Manager Deployment Script
# This script handles the deployment of the Task Manager application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="task-manager"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
}

# Check if Docker is installed and running
check_docker() {
    log "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Docker is installed and running"
}

# Check if Docker Compose is installed
check_docker_compose() {
    log "Checking Docker Compose installation..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker Compose is installed"
}

# Check if environment file exists
check_env_file() {
    log "Checking environment file..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found. Creating from template..."
        
        if [ -f ".env.example" ]; then
            cp .env.example "$ENV_FILE"
            log_success "Environment file created from template"
            log_warning "Please update the environment variables in $ENV_FILE"
        else
            log_error "No environment template found"
            exit 1
        fi
    else
        log_success "Environment file exists"
    fi
}

# Build images
build_images() {
    log "Building Docker images..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f "$COMPOSE_PROD_FILE" build --no-cache
    else
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    fi
    
    log_success "Docker images built successfully"
}

# Deploy application
deploy() {
    local environment=${1:-development}
    
    log "Deploying application in $environment mode..."
    
    # Stop existing containers
    stop_application "$environment"
    
    # Remove old containers
    remove_containers "$environment"
    
    # Start new containers
    if [ "$environment" = "production" ]; then
        docker-compose -f "$COMPOSE_PROD_FILE" up -d
    else
        docker-compose -f "$COMPOSE_FILE" up -d
    fi
    
    log_success "Application deployed successfully"
}

# Stop application
stop_application() {
    local environment=${1:-development}
    
    log "Stopping application..."
    
    if [ "$environment" = "production" ]; then
        docker-compose -f "$COMPOSE_PROD_FILE" down
    else
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    log_success "Application stopped"
}

# Remove containers
remove_containers() {
    local environment=${1:-development}
    
    log "Removing containers..."
    
    if [ "$environment" = "production" ]; then
        docker-compose -f "$COMPOSE_PROD_FILE" rm -f
    else
        docker-compose -f "$COMPOSE_FILE" rm -f
    fi
    
    log_success "Containers removed"
}

# Check application health
check_health() {
    local environment=${1:-development}
    
    log "Checking application health..."
    
    # Wait for services to start
    sleep 30
    
    # Check frontend health
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    # Check backend health
    if curl -f http://localhost:5000/health &> /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    log_success "All services are healthy"
}

# Show application logs
show_logs() {
    local environment=${1:-development}
    local service=${2:-}
    
    if [ "$environment" = "production" ]; then
        if [ -n "$service" ]; then
            docker-compose -f "$COMPOSE_PROD_FILE" logs -f "$service"
        else
            docker-compose -f "$COMPOSE_PROD_FILE" logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker-compose -f "$COMPOSE_FILE" logs -f "$service"
        else
            docker-compose -f "$COMPOSE_FILE" logs -f
        fi
    fi
}

# Show application status
show_status() {
    local environment=${1:-development}
    
    log "Application status:"
    
    if [ "$environment" = "production" ]; then
        docker-compose -f "$COMPOSE_PROD_FILE" ps
    else
        docker-compose -f "$COMPOSE_FILE" ps
    fi
}

# Backup data
backup_data() {
    log "Creating backup..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    docker exec task-manager-db pg_dump -U postgres taskmanager > "$backup_dir/database.sql"
    
    # Backup uploaded files (if any)
    if [ -d "uploads" ]; then
        cp -r uploads "$backup_dir/"
    fi
    
    log_success "Backup created in $backup_dir"
}

# Restore data
restore_data() {
    local backup_dir=$1
    
    if [ -z "$backup_dir" ]; then
        log_error "Please specify backup directory"
        exit 1
    fi
    
    if [ ! -d "$backup_dir" ]; then
        log_error "Backup directory not found: $backup_dir"
        exit 1
    fi
    
    log "Restoring data from $backup_dir..."
    
    # Restore database
    if [ -f "$backup_dir/database.sql" ]; then
        docker exec -i task-manager-db psql -U postgres taskmanager < "$backup_dir/database.sql"
        log_success "Database restored"
    fi
    
    # Restore uploaded files
    if [ -d "$backup_dir/uploads" ]; then
        cp -r "$backup_dir/uploads" .
        log_success "Files restored"
    fi
    
    log_success "Data restored successfully"
}

# Update application
update() {
    local environment=${1:-development}
    
    log "Updating application..."
    
    # Pull latest code
    git pull origin main
    
    # Backup current data
    backup_data
    
    # Build and deploy
    build_images "$environment"
    deploy "$environment"
    
    # Check health
    check_health "$environment"
    
    log_success "Application updated successfully"
}

# Show help
show_help() {
    echo "Task Manager Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  deploy [env]    Deploy application (env: development|production)"
    echo "  build [env]     Build Docker images"
    echo "  stop [env]      Stop application"
    echo "  restart [env]   Restart application"
    echo "  status [env]    Show application status"
    echo "  logs [env] [service]  Show application logs"
    echo "  health [env]    Check application health"
    echo "  backup          Create data backup"
    echo "  restore <dir>   Restore data from backup"
    echo "  update [env]    Update application"
    echo "  help            Show this help message"
    echo ""
    echo "Environment:"
    echo "  development     Development environment (default)"
    echo "  production      Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 deploy development"
    echo "  $0 deploy production"
    echo "  $0 logs production backend"
    echo "  $0 backup"
    echo "  $0 restore backups/20231201_120000"
}

# Main function
main() {
    local command=${1:-help}
    local environment=${2:-development}
    local service=${3:-}
    
    case "$command" in
        deploy)
            check_docker
            check_docker_compose
            check_env_file
            build_images "$environment"
            deploy "$environment"
            check_health "$environment"
            ;;
        build)
            check_docker
            check_docker_compose
            build_images "$environment"
            ;;
        stop)
            check_docker
            check_docker_compose
            stop_application "$environment"
            ;;
        restart)
            check_docker
            check_docker_compose
            stop_application "$environment"
            deploy "$environment"
            check_health "$environment"
            ;;
        status)
            check_docker
            check_docker_compose
            show_status "$environment"
            ;;
        logs)
            check_docker
            check_docker_compose
            show_logs "$environment" "$service"
            ;;
        health)
            check_health "$environment"
            ;;
        backup)
            check_docker
            backup_data
            ;;
        restore)
            check_docker
            restore_data "$environment"
            ;;
        update)
            check_docker
            check_docker_compose
            update "$environment"
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"