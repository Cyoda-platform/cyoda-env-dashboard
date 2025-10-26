#!/bin/bash

# Start Cyoda Backend Mock Server
# This script starts the mock backend on ports 8081 and 8082

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Starting Cyoda Backend Mock Server${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check if backend-mock-server directory exists
if [ ! -d "backend-mock-server" ]; then
    echo -e "${RED}Error: backend-mock-server directory not found${NC}"
    exit 1
fi

cd backend-mock-server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Check if ports are already in use
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 8081 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 8082 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:8082 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}Starting mock backend servers...${NC}"
echo ""
echo -e "${CYAN}This will start:${NC}"
echo -e "  • API Server on port 8082"
echo -e "  • Processing Server on port 8081"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"
echo ""

# Start the server
npm start

