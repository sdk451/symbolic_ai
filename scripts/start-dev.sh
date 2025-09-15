#!/bin/bash

# Bash script for starting the local development environment
# This script starts all necessary services for local development

echo "🚀 Starting Symbolic AI Website Local Development Environment"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please run setup-dev.sh first."
    exit 1
fi

# Check if Supabase is running
echo "🔍 Checking Supabase status..."
if command -v supabase &> /dev/null; then
    SUPABASE_STATUS=$(supabase status 2>/dev/null)
    if echo "$SUPABASE_STATUS" | grep -q "API URL: http://localhost:54321"; then
        echo "✅ Supabase is already running"
    else
        echo "🔄 Starting Supabase..."
        supabase start
        echo "✅ Supabase started"
    fi
else
    echo "⚠️  Supabase CLI not found. Make sure it's installed."
    echo "Run: npm install -g supabase"
fi

echo ""
echo "🌐 Starting development servers..."
echo ""

# Start the full development environment
echo "Starting Vite dev server and Netlify Functions..."
echo "Frontend will be available at: http://localhost:3000"
echo "Netlify Functions will be available at: http://localhost:8888"
echo "Supabase Studio will be available at: http://localhost:54323"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start the development servers
npm run dev:full
