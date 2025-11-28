#!/bin/bash

# This script runs during building the sandbox template
# and makes sure the Next.js app is (1) running and (2) the `/` page is compiled

set -e  # Exit on error

# Function to check if server is ready
function wait_for_server() {
    echo "Starting Next.js development server..."
    local counter=0
    local max_attempts=300  # 30 seconds timeout
    
    while [ $counter -lt $max_attempts ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null || echo "000")
        
        if [[ ${response} -eq 200 ]]; then
            echo "✅ Server is ready and page is compiled!"
            return 0
        fi
        
        if (( counter % 50 == 0 && counter > 0 )); then
            echo "⏳ Still waiting for server... (${counter}/10 seconds)"
        fi
        
        sleep 0.1
        ((counter++))
    done
    
    echo "❌ Server failed to start within timeout"
    return 1
}

# Change to the correct directory
cd /home/user

# Start the Next.js development server in background
echo "🚀 Starting Next.js development server with Turbopack..."
npm run dev -- --turbopack &
SERVER_PID=$!

# Wait for server to be ready
if wait_for_server; then
    echo "🎉 Next.js app is running and compiled successfully!"
    
    # Keep the server running
    wait $SERVER_PID
else
    echo "💥 Failed to start server"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi