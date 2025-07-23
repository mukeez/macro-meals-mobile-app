#!/bin/bash

# Build script for Macro Meals app
# Usage: ./scripts/build.sh [development|staging|production] [ios|android|both]

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

# Check if environment is provided
if [ -z "$1" ]; then
    print_error "Environment not specified. Usage: ./scripts/build.sh [development|staging|production] [ios|android|both]"
    exit 1
fi

ENVIRONMENT=$1
PLATFORM=${2:-"both"}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment. Must be one of: development, staging, production"
    exit 1
fi

# Validate platform
if [[ ! "$PLATFORM" =~ ^(ios|android|both)$ ]]; then
    print_error "Invalid platform. Must be one of: ios, android, both"
    exit 1
fi

print_status "Building Macro Meals app for $ENVIRONMENT environment on $PLATFORM platform"

# Setup icons for the environment
print_status "Setting up icons for $ENVIRONMENT environment..."
export ENV=$ENVIRONMENT
node scripts/copy-icons.js

# Function to build for a specific platform
build_platform() {
    local platform=$1
    print_status "Building for $platform..."
    
    case $platform in
        "ios")
            eas build --profile $ENVIRONMENT --platform ios
            ;;
        "android")
            eas build --profile $ENVIRONMENT --platform android
            ;;
    esac
    
    print_success "Build completed for $platform"
}

# Build based on platform selection
case $PLATFORM in
    "ios")
        build_platform "ios"
        ;;
    "android")
        build_platform "android"
        ;;
    "both")
        print_status "Building for both platforms..."
        eas build --profile $ENVIRONMENT --platform all
        print_success "Build completed for both platforms"
        ;;
esac

print_success "Build process completed successfully!"
print_status "Environment: $ENVIRONMENT"
print_status "Platform: $PLATFORM"

# Display next steps
case $ENVIRONMENT in
    "development")
        print_warning "Development build created. Install on development devices."
        ;;
    "staging")
        print_warning "Staging build created. Distribute to testers via internal distribution."
        ;;
    "production")
        print_warning "Production build created. Submit to app stores when ready."
        ;;
esac 