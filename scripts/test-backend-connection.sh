#!/bin/bash

# Test Cyoda Backend Connection
# This script tests if the backend is accessible

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_URL=${1:-"http://localhost:8080"}

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Testing Cyoda Backend Connection${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "Backend URL: ${YELLOW}${BACKEND_URL}${NC}"
echo ""

# Test endpoints
ENDPOINTS=(
    "${BACKEND_URL}"
    "${BACKEND_URL}/api"
    "${BACKEND_URL}/platform-api"
    "${BACKEND_URL}/processing"
    "${BACKEND_URL}/platform-processing"
)

echo -e "${BLUE}Testing endpoints...${NC}"
echo ""

SUCCESS_COUNT=0
TOTAL_COUNT=${#ENDPOINTS[@]}

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "Testing ${endpoint}... "
    
    # Try to connect with timeout
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "${endpoint}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}✗ Failed (Connection refused)${NC}"
    elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✓ OK (HTTP ${HTTP_CODE})${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${YELLOW}⚠ Warning (HTTP ${HTTP_CODE})${NC}"
    fi
done

echo ""
echo -e "${BLUE}=========================================${NC}"

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Backend is accessible!${NC}"
    echo -e "  ${SUCCESS_COUNT}/${TOTAL_COUNT} endpoints responded"
    echo ""
    echo -e "${GREEN}You can now start the frontend:${NC}"
    echo -e "  ${YELLOW}cd react-project${NC}"
    echo -e "  ${YELLOW}npm run dev${NC}"
else
    echo -e "${RED}✗ Backend is not accessible${NC}"
    echo ""
    echo -e "${YELLOW}Possible solutions:${NC}"
    echo "  1. Start the Cyoda backend server"
    echo "  2. Check if the backend URL is correct"
    echo "  3. Verify firewall/network settings"
    echo "  4. Use a mock server for testing:"
    echo -e "     ${YELLOW}cd react-project/packages/tableau-react${NC}"
    echo -e "     ${YELLOW}node test-data/mock-server.mjs${NC}"
fi

echo -e "${BLUE}=========================================${NC}"
echo ""

exit 0

