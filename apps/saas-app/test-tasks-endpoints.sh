#!/bin/bash

# Test Tasks API Endpoints on Cyoda Backend
# This script tests if the Tasks/Alerts endpoints are available

echo "=========================================="
echo "Testing Tasks API Endpoints"
echo "=========================================="
echo ""

BACKEND_URL="https://cyoda-develop.kube3.cyoda.org"

echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Check if backend is reachable
echo "Test 1: Checking backend reachability..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL" 2>/dev/null)
if [ "$HTTP_CODE" != "000" ]; then
    echo "✓ Backend is reachable (HTTP $HTTP_CODE)"
else
    echo "✗ Backend is not reachable"
    echo "  Please check your network connection"
    exit 1
fi
echo ""

# Test 2: Check /api endpoint
echo "Test 2: Checking /api endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL/api" 2>/dev/null)
echo "  Response: HTTP $HTTP_CODE"
echo ""

# Test 3: Check /api/alerts endpoint
echo "Test 3: Checking /api/alerts endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL/api/alerts" 2>/dev/null)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ Alerts endpoint exists (HTTP $HTTP_CODE - requires authentication)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Alerts endpoint not found (HTTP $HTTP_CODE)"
    echo "  The backend may not have the Alerts/Tasks feature"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Alerts endpoint exists (HTTP $HTTP_CODE)"
else
    echo "  Response: HTTP $HTTP_CODE"
fi
echo ""

# Test 4: Check /api/alerts/tasks endpoint
echo "Test 4: Checking /api/alerts/tasks endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 10 "$BACKEND_URL/api/alerts/tasks" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ Tasks endpoint exists (HTTP $HTTP_CODE - requires authentication)"
    echo "  This is expected - you need to login first"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Tasks endpoint not found (HTTP $HTTP_CODE)"
    echo "  The backend does not have the Tasks API"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Tasks endpoint exists and is accessible (HTTP $HTTP_CODE)"
    if [ -n "$BODY" ]; then
        echo "  Response preview:"
        echo "$BODY" | head -c 200
        echo "..."
    fi
else
    echo "  Response: HTTP $HTTP_CODE"
fi
echo ""

# Test 5: Check /api/alerts/tasks/paged endpoint
echo "Test 5: Checking /api/alerts/tasks/paged endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL/api/alerts/tasks/paged" 2>/dev/null)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ Tasks paged endpoint exists (HTTP $HTTP_CODE - requires authentication)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Tasks paged endpoint not found (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Tasks paged endpoint exists (HTTP $HTTP_CODE)"
else
    echo "  Response: HTTP $HTTP_CODE"
fi
echo ""

# Test 6: Check /api/alerts/tasks/summary endpoint
echo "Test 6: Checking /api/alerts/tasks/summary endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL/api/alerts/tasks/summary" 2>/dev/null)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ Tasks summary endpoint exists (HTTP $HTTP_CODE - requires authentication)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Tasks summary endpoint not found (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Tasks summary endpoint exists (HTTP $HTTP_CODE)"
else
    echo "  Response: HTTP $HTTP_CODE"
fi
echo ""

# Test 7: Check /api/alerts/tasks/date-stats endpoint
echo "Test 7: Checking /api/alerts/tasks/date-stats endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BACKEND_URL/api/alerts/tasks/date-stats" 2>/dev/null)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✓ Tasks stats endpoint exists (HTTP $HTTP_CODE - requires authentication)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "✗ Tasks stats endpoint not found (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Tasks stats endpoint exists (HTTP $HTTP_CODE)"
else
    echo "  Response: HTTP $HTTP_CODE"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Interpretation of results:"
echo "  • HTTP 200 = Endpoint exists and is accessible"
echo "  • HTTP 401/403 = Endpoint exists but requires authentication (GOOD!)"
echo "  • HTTP 404 = Endpoint does not exist (Tasks feature not available)"
echo "  • HTTP 500 = Server error"
echo ""
echo "Next steps:"
echo "  1. If you see 401/403 responses, the Tasks API exists!"
echo "     → Login to the app and try accessing Tasks"
echo "  2. If you see 404 responses, the Tasks API is not available"
echo "     → Check with backend team if Tasks/Alerts are enabled"
echo "  3. Open the app at http://localhost:3000/tasks"
echo "     → Check browser console for actual API responses"
echo ""

