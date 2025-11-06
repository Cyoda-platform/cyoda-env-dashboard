#!/bin/bash

# Test Export/Import functionality for Report Definitions
# This script demonstrates how to export and import report definitions using the mock API

echo "========================================="
echo "  Testing Export/Import Functionality"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080"

echo -e "${BLUE}Step 1: Check available report definitions${NC}"
echo "GET $API_URL/platform-api/reporting/definitions"
echo ""
curl -s "$API_URL/platform-api/reporting/definitions" | jq '.._embedded.gridConfigFieldsViews[] | {id: .gridConfigFields.id, name: .gridConfigFields.name, description: .gridConfigFields.description}'
echo ""
echo ""

echo -e "${BLUE}Step 2: Export report definitions (RPT-001 and RPT-002)${NC}"
echo "GET $API_URL/platform-api/reporting/export-by-ids?includeIds=RPT-001,RPT-002"
echo ""
EXPORT_DATA=$(curl -s "$API_URL/platform-api/reporting/export-by-ids?includeIds=RPT-001,RPT-002")
echo "$EXPORT_DATA" | jq '.'
echo ""

# Save export data to file
echo "$EXPORT_DATA" > /tmp/exported-reports.json
echo -e "${GREEN}✓ Exported data saved to /tmp/exported-reports.json${NC}"
echo ""
echo ""

echo -e "${BLUE}Step 3: Modify the exported data (change names)${NC}"
# Modify the exported data to simulate importing with different names
MODIFIED_DATA=$(echo "$EXPORT_DATA" | jq '.data.value[0].name = "Imported Customer Report" | .data.value[0].id = null | .data.value[1].name = "Imported Order Report" | .data.value[1].id = null')
echo "$MODIFIED_DATA" | jq '.'
echo ""
echo ""

echo -e "${BLUE}Step 4: Import the modified report definitions${NC}"
echo "POST $API_URL/platform-api/reporting/import"
echo ""
IMPORT_RESULT=$(curl -s -X POST "$API_URL/platform-api/reporting/import" \
  -H "Content-Type: application/json" \
  -d "$MODIFIED_DATA")
echo "$IMPORT_RESULT" | jq '.'
echo ""
echo ""

echo -e "${BLUE}Step 5: Verify imported reports${NC}"
echo "GET $API_URL/platform-api/reporting/definitions"
echo ""
curl -s "$API_URL/platform-api/reporting/definitions" | jq '.._embedded.gridConfigFieldsViews[] | {id: .gridConfigFields.id, name: .gridConfigFields.name, description: .gridConfigFields.description}'
echo ""
echo ""

echo -e "${GREEN}========================================="
echo "  Export/Import Test Complete! ✓"
echo "=========================================${NC}"
echo ""
echo "Summary:"
echo "  1. Listed existing report definitions"
echo "  2. Exported 2 report definitions to JSON"
echo "  3. Modified the exported data"
echo "  4. Imported the modified definitions"
echo "  5. Verified the imported reports"
echo ""
echo "You can now test the UI by:"
echo "  1. Navigate to http://localhost:3007/tableau/reports"
echo "  2. Select one or more reports"
echo "  3. Click 'Export' to download JSON"
echo "  4. Click 'Import' to upload the JSON file"
echo ""

