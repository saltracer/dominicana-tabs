#!/bin/bash

# Supabase Setup Script
# This script links the local project to the remote Supabase instance
# and verifies the connection

set -e  # Exit on any error

echo "🚀 Supabase Setup Script"
echo "========================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please create a .env file with the following variables:"
  echo "  SUPABASE_ACCESS_TOKEN=your_token"
  echo "  SUPABASE_PROJECT_REF=your_ref"
  echo ""
  echo "See env.example for the complete template"
  exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(grep -v '^#' .env | xargs)

# Check if required variables are set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Error: SUPABASE_ACCESS_TOKEN not set in .env"
  exit 1
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_PROJECT_REF not set in .env"
  exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Error: Supabase CLI is not installed"
  echo "Install it with: brew install supabase/tap/supabase"
  exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
if supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
  echo "✅ Successfully linked to project: $SUPABASE_PROJECT_REF"
else
  echo "❌ Failed to link project"
  echo "Please check your SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF"
  exit 1
fi
echo ""

# Verify connection
echo "🔍 Verifying connection..."
if supabase status; then
  echo "✅ Connection verified!"
else
  echo "⚠️  Could not verify connection status"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  - Run 'npm run db:status' to check database status"
echo "  - Run 'npm run db:pull' to sync remote schema"
echo "  - Run 'npm run db:push' to push local migrations"
echo ""

