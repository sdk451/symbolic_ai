#!/bin/bash

# Netlify Deployment Script
# This script provides multiple deployment options for the Symbolic AI website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Netlify CLI is installed
check_netlify_cli() {
    if ! command -v netlify &> /dev/null; then
        print_error "Netlify CLI is not installed. Please install it first:"
        echo "npm install -g netlify-cli"
        exit 1
    fi
}

# Function to check if user is logged in to Netlify
check_netlify_auth() {
    if ! netlify status &> /dev/null; then
        print_warning "Not logged in to Netlify. Please log in:"
        netlify login
    fi
}

# Function to run quality checks
run_quality_checks() {
    print_status "Running quality checks..."
    
    # Type checking
    print_status "Running TypeScript type checking..."
    npm run type-check
    
    # Linting
    print_status "Running ESLint..."
    npm run lint
    
    # Testing
    print_status "Running tests..."
    npm test -- --run
    
    print_success "All quality checks passed!"
}

# Function to build the application
build_application() {
    print_status "Building application..."
    npm run build
    print_success "Build completed successfully!"
}

# Function for local development deployment
deploy_local() {
    print_status "Starting local Netlify development server..."
    netlify dev
}

# Function for preview deployment
deploy_preview() {
    print_status "Deploying preview to Netlify..."
    netlify deploy --dir=dist
    print_success "Preview deployment completed!"
}

# Function for production deployment
deploy_production() {
    print_status "Deploying to production..."
    netlify deploy --prod --dir=dist
    print_success "Production deployment completed!"
}

# Function for automated deployment with quality checks
deploy_automated() {
    print_status "Starting automated deployment process..."
    
    # Run quality checks
    run_quality_checks
    
    # Build application
    build_application
    
    # Deploy to production
    deploy_production
    
    print_success "Automated deployment completed successfully!"
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    netlify status
}

# Function to show help
show_help() {
    echo "Netlify Deployment Script for Symbolic AI Website"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local       Start local Netlify development server"
    echo "  preview     Deploy preview to Netlify"
    echo "  production  Deploy to production"
    echo "  automated   Run quality checks, build, and deploy to production"
    echo "  status      Show current deployment status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local       # Start local development"
    echo "  $0 preview     # Deploy preview"
    echo "  $0 production  # Deploy to production"
    echo "  $0 automated   # Full automated deployment"
}

# Main script logic
main() {
    # Check prerequisites
    check_netlify_cli
    check_netlify_auth
    
    # Parse command line arguments
    case "${1:-help}" in
        "local")
            deploy_local
            ;;
        "preview")
            deploy_preview
            ;;
        "production")
            deploy_production
            ;;
        "automated")
            deploy_automated
            ;;
        "status")
            show_status
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
