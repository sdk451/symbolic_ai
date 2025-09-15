#!/bin/bash

# Bash script for setting up local development environment
# Run this script to set up the complete local development environment

echo "🚀 Setting up Symbolic AI Website Local Development Environment"
echo ""

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env.local exists, if not copy from .env.example
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please update it with your actual values."
    echo "⚠️  Remember to update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
else
    echo "✅ .env.local already exists"
fi

# Check if Supabase CLI is installed
echo ""
echo "🔍 Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo "✅ Supabase CLI version: $SUPABASE_VERSION"
else
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Supabase CLI"
        echo "Please install manually: https://supabase.com/docs/guides/cli/getting-started"
    else
        echo "✅ Supabase CLI installed successfully"
    fi
fi

# Check if Netlify CLI is installed
echo ""
echo "🔍 Checking Netlify CLI..."
if command -v netlify &> /dev/null; then
    NETLIFY_VERSION=$(netlify --version)
    echo "✅ Netlify CLI version: $NETLIFY_VERSION"
else
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Netlify CLI"
        echo "Please install manually: https://docs.netlify.com/cli/get-started/"
    else
        echo "✅ Netlify CLI installed successfully"
    fi
fi

# Run type check
echo ""
echo "🔍 Running TypeScript type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript type check found issues. Please review and fix."
else
    echo "✅ TypeScript type check passed"
fi

# Run linting
echo ""
echo "🔍 Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  ESLint found issues. Run 'npm run lint:fix' to auto-fix some issues."
else
    echo "✅ ESLint check passed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual Supabase credentials"
echo "2. Start Supabase locally: supabase start"
echo "3. Start the development server: npm run dev"
echo "4. Or start everything at once: npm run dev:full"
echo ""
echo "For more information, see docs/development-setup.md"
