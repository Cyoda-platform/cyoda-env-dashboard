#!/bin/bash

# Interactive Cyoda Backend Connection Helper
# This script helps you quickly connect to the Cyoda backend

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
   ____                _         ____             _                  _ 
  / ___|   _  ___   __| | __ _  | __ )  __ _  ___| | _____ _ __   __| |
 | |  | | | |/ _ \ / _` |/ _` | |  _ \ / _` |/ __| |/ / _ \ '_ \ / _` |
 | |__| |_| | (_) | (_| | (_| | | |_) | (_| | (__|   <  __/ | | | (_| |
  \____\__, |\___/ \__,_|\__,_| |____/ \__,_|\___|_|\_\___|_| |_|\__,_|
       |___/                                                             
   ____                            _   _             
  / ___|___  _ __  _ __   ___  ___| |_(_) ___  _ __  
 | |   / _ \| '_ \| '_ \ / _ \/ __| __| |/ _ \| '_ \ 
 | |__| (_) | | | | | | |  __/ (__| |_| | (_) | | | |
  \____\___/|_| |_|_| |_|\___|\___|\__|_|\___/|_| |_|
                                                      
EOF
echo -e "${NC}"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Backend Connection Helper${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Test if backend is running
echo -e "${YELLOW}Testing backend connection...${NC}"
if curl -s -f -o /dev/null -m 3 "http://localhost:8080" 2>/dev/null || \
   curl -s -o /dev/null -w "%{http_code}" -m 3 "http://localhost:8080/api" 2>/dev/null | grep -q "401\|200"; then
    BACKEND_RUNNING=true
    echo -e "${GREEN}✓ Backend is running on localhost:8080${NC}"
else
    BACKEND_RUNNING=false
    echo -e "${RED}✗ Backend is NOT running on localhost:8080${NC}"
fi

echo ""
echo -e "${CYAN}What would you like to do?${NC}"
echo ""
echo "  1) 🚀 Use Mock Server (fastest - no backend needed)"
echo "  2) 🏠 Connect to Local Backend (localhost:8082/8081)"
echo "  3) 🌐 Connect to Remote Backend (cyoda-develop)"
echo "  4) 🔧 Setup from Template (recommended)"
echo "  5) 🧪 Test Backend Connection"
echo "  6) ℹ️  Show Connection Info"
echo "  7) ❌ Exit"
echo ""

read -p "Enter your choice [1-7]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Starting Mock Server...${NC}"
        echo ""
        echo -e "${YELLOW}This will start a mock API server on port 8080${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        
        if [ -f "react-project/packages/tableau-react/test-data/mock-server.mjs" ]; then
            cd react-project/packages/tableau-react
            echo -e "${BLUE}Starting mock server...${NC}"
            node test-data/mock-server.mjs
        else
            echo -e "${RED}Error: Mock server not found${NC}"
            echo "Expected location: react-project/packages/tableau-react/test-data/mock-server.mjs"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        if [ "$BACKEND_RUNNING" = false ]; then
            echo -e "${YELLOW}⚠ Warning: Backend is not currently running${NC}"
            echo ""
            read -p "Continue anyway? [y/N]: " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                echo "Cancelled"
                exit 0
            fi
        fi
        
        echo -e "${GREEN}Configuring connection to local backend...${NC}"
        cd react-project
        ./scripts/setup-backend-connection.sh local
        
        echo ""
        echo -e "${CYAN}Would you like to start the development server now?${NC}"
        read -p "Start dev server? [Y/n]: " start_dev
        
        if [[ ! $start_dev =~ ^[Nn]$ ]]; then
            echo ""
            echo -e "${GREEN}Starting development server...${NC}"
            npm run dev
        fi
        ;;
        
    3)
        echo ""
        echo -e "${GREEN}Configuring connection to remote backend (cyoda-develop)...${NC}"
        cd react-project
        ./scripts/setup-env-from-template.sh remote

        echo ""
        echo -e "${CYAN}Would you like to start the development server now?${NC}"
        read -p "Start dev server? [Y/n]: " start_dev

        if [[ ! $start_dev =~ ^[Nn]$ ]]; then
            echo ""
            echo -e "${GREEN}Starting development server...${NC}"
            npm run dev
        fi
        ;;

    4)
        echo ""
        echo -e "${GREEN}Setting up from template...${NC}"
        cd react-project
        ./scripts/setup-env-from-template.sh interactive

        echo ""
        echo -e "${CYAN}Would you like to start the development server now?${NC}"
        read -p "Start dev server? [Y/n]: " start_dev

        if [[ ! $start_dev =~ ^[Nn]$ ]]; then
            echo ""
            echo -e "${GREEN}Starting development server...${NC}"
            npm run dev
        fi
        ;;

    5)
        echo ""
        echo -e "${GREEN}Testing backend connection...${NC}"
        echo ""
        read -p "Enter backend URL [http://localhost:8080]: " backend_url
        backend_url=${backend_url:-http://localhost:8080}
        
        ./react-project/scripts/test-backend-connection.sh "$backend_url"
        ;;
        
    6)
        echo ""
        echo -e "${BLUE}=========================================${NC}"
        echo -e "${BLUE}  Connection Information${NC}"
        echo -e "${BLUE}=========================================${NC}"
        echo ""
        echo -e "${CYAN}Backend Status:${NC}"
        if [ "$BACKEND_RUNNING" = true ]; then
            echo -e "  ${GREEN}✓ Running on localhost:8080${NC}"
        else
            echo -e "  ${RED}✗ Not running${NC}"
        fi
        echo ""
        echo -e "${CYAN}Available Options:${NC}"
        echo "  • Mock Server: Quick testing without backend"
        echo "  • Local Backend: Connect to localhost:8082/8081"
        echo "  • Remote Backend: Connect to cyoda-develop.kube.cyoda.org"
        echo "  • Template Setup: Use .env.template files"
        echo ""
        echo -e "${CYAN}Backend Configurations:${NC}"
        echo "  Local Development:"
        echo "    - API:        http://localhost:8082/api"
        echo "    - Processing: http://localhost:8081/processing"
        echo "    - Base URL:   http://localhost:8081/"
        echo ""
        echo "  Remote Development (cyoda-develop):"
        echo "    - API:        https://cyoda-develop.kube.cyoda.org/api"
        echo "    - Processing: https://cyoda-develop.kube.cyoda.org/processing"
        echo "    - Base URL:   https://cyoda-develop.kube.cyoda.org"
        echo ""
        echo -e "${CYAN}Frontend Applications:${NC}"
        echo "  • COBI:               http://localhost:3009"
        echo "  • Tasks:              http://localhost:3010"
        echo "  • Processing Manager: http://localhost:3008"
        echo "  • Tableau:            http://localhost:3007"
        echo "  • Source Config:      http://localhost:5176"
        echo "  • State Machine:      http://localhost:3014"
        echo "  • SaaS:               http://localhost:3011"
        echo ""
        echo -e "${CYAN}Documentation:${NC}"
        echo "  • BACKEND_CONNECTION_GUIDE.md"
        echo "  • react-project/CONNECT_TO_BACKEND.md"
        echo "  • react-project/.env.template"
        echo ""
        ;;

    7)
        echo ""
        echo -e "${BLUE}Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

