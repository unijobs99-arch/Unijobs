#!/bin/bash
# Setup script for local Expo Go development
# This script helps configure the API endpoint for testing on physical devices

set -e

echo "🚀 UniJobs - Expo Go Local Development Setup"
echo "=============================================="
echo ""

# Get machine IP
if [ "$(uname)" = "Darwin" ]; then
  # macOS
  MACHINE_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "127.0.0.1")
elif [ "$(uname)" = "Linux" ]; then
  # Linux
  MACHINE_IP=$(hostname -I | awk '{print $1}' || echo "127.0.0.1")
else
  # Windows / Git Bash
  MACHINE_IP=$(ipconfig | grep -i "IPv4 Address" | head -1 | awk '{print $NF}' || echo "127.0.0.1")
fi

echo "📱 Detected your machine IP: $MACHINE_IP"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running on port 5000..."
if nc -z "$MACHINE_IP" 5000 2>/dev/null; then
  echo "✅ Backend is running on $MACHINE_IP:5000"
else
  echo "⚠️  Backend is NOT running on $MACHINE_IP:5000"
  echo "    Start it with: pnpm --filter @workspace/api-server run dev"
  echo ""
fi

echo "🌍 Setting API endpoint..."
API_ENDPOINT="$MACHINE_IP:5000"
echo "   EXPO_PUBLIC_DOMAIN=$API_ENDPOINT"
echo ""

# Export and run
echo "🚀 Starting Expo Go dev server..."
export EXPO_PUBLIC_DOMAIN="$API_ENDPOINT"
cd "$(dirname "$0")"
pnpm exec expo start --localhost

