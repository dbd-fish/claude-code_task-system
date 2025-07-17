#!/bin/sh

# Frontend Docker entrypoint script

set -e

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to substitute environment variables in nginx config
substitute_env_vars() {
    log "Substituting environment variables in nginx config..."
    
    # Create a temporary file with environment variables
    envsubst < /etc/nginx/nginx.conf > /tmp/nginx.conf
    mv /tmp/nginx.conf /etc/nginx/nginx.conf
    
    log "Environment variables substituted successfully"
}

# Function to validate nginx configuration
validate_nginx_config() {
    log "Validating nginx configuration..."
    
    if nginx -t; then
        log "Nginx configuration is valid"
    else
        log "ERROR: Nginx configuration is invalid"
        exit 1
    fi
}

# Function to create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p /var/log/nginx
    mkdir -p /var/cache/nginx
    mkdir -p /run/nginx
    
    log "Directories created successfully"
}

# Function to set proper permissions
set_permissions() {
    log "Setting proper permissions..."
    
    chown -R nginx:nginx /var/log/nginx
    chown -R nginx:nginx /var/cache/nginx
    chown -R nginx:nginx /run/nginx
    chown -R nginx:nginx /usr/share/nginx/html
    
    log "Permissions set successfully"
}

# Function to check if static files exist
check_static_files() {
    log "Checking static files..."
    
    if [ ! -f "/usr/share/nginx/html/index.html" ]; then
        log "ERROR: Static files not found. Build may have failed."
        exit 1
    fi
    
    log "Static files found"
}

# Function to perform health check
health_check() {
    log "Performing initial health check..."
    
    # Start nginx in background for health check
    nginx -g "daemon off;" &
    NGINX_PID=$!
    
    # Wait for nginx to start
    sleep 2
    
    # Check if nginx is running
    if ! kill -0 $NGINX_PID 2>/dev/null; then
        log "ERROR: Nginx failed to start"
        exit 1
    fi
    
    # Stop nginx
    kill $NGINX_PID
    wait $NGINX_PID
    
    log "Health check passed"
}

# Main execution
main() {
    log "Starting frontend deployment preparation..."
    
    # Execute preparation steps
    substitute_env_vars
    create_directories
    set_permissions
    check_static_files
    validate_nginx_config
    
    log "Frontend deployment preparation completed successfully"
    
    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"