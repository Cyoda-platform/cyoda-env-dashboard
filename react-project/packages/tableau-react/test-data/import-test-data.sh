#!/bin/bash

# Import Test Data Script
# This script imports sample test data into the Cyoda platform

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
API_BASE="${BACKEND_URL}/platform-api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "  Cyoda Test Data Import Script"
echo "========================================="
echo ""
echo "Backend URL: ${BACKEND_URL}"
echo ""

# Check if backend is accessible
echo "Checking backend connectivity..."
if curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Backend may not be accessible at ${BACKEND_URL}${NC}"
    echo "  You can set a custom URL with: export BACKEND_URL=http://your-backend:port"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "  Importing Test Data"
echo "========================================="
echo ""

# Function to import entities
import_entities() {
    local file=$1
    local entity_class=$2
    local entity_name=$3
    
    echo "Importing ${entity_name}..."
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        "${API_BASE}/entity/${entity_class}/import" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@${file}" \
        -F "format=json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ Successfully imported ${entity_name}${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to import ${entity_name} (HTTP ${http_code})${NC}"
        echo "  Response: ${body}"
        return 1
    fi
}

# Import Customers
import_entities \
    "sample-customers.json" \
    "com.cyoda.tms.model.entities.Customer" \
    "Customers (5 records)"

echo ""

# Import Transactions
import_entities \
    "sample-transactions.json" \
    "com.cyoda.tms.model.entities.Transaction" \
    "Transactions (5 records)"

echo ""
echo "========================================="
echo "  Import Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Open the Tableau app: http://localhost:3007/"
echo "  2. Navigate to Reports → Report Config"
echo "  3. Create a new report using one of these entities:"
echo "     - com.cyoda.tms.model.entities.Customer"
echo "     - com.cyoda.tms.model.entities.Transaction"
echo "  4. Configure columns and filters"
echo "  5. Click 'Update and Run' to execute the report"
echo ""
echo "For more information, see test-data/README.md"
echo ""

