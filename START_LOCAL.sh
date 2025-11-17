#!/bin/bash

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null

# Clear lock files
rm -rf .next/dev/lock 2>/dev/null

# Start Next.js dev server
echo "Starting Next.js dev server..."
npm run dev

