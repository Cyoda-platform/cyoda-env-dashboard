#!/bin/bash

# Refine Installation Script for Cyoda SaaS App
# This script installs Refine dependencies and sets up the integration

set -e

echo "🚀 Installing Refine for Cyoda SaaS App"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the react-project directory."
    exit 1
fi

# Check for Yarn
if ! command -v yarn &> /dev/null; then
    echo "⚠️  Yarn not found. Attempting to enable Corepack..."
    if command -v corepack &> /dev/null; then
        corepack enable
        echo "✅ Corepack enabled"
    else
        echo "❌ Error: Corepack not available. Please install Node.js 16.9+ or manually install Yarn."
        exit 1
    fi
fi

# Display Yarn version
echo "📦 Yarn version:"
yarn --version
echo ""

# Install dependencies
echo "📥 Installing Refine dependencies..."
echo ""

# Try to install using yarn
if yarn install; then
    echo ""
    echo "✅ Dependencies installed successfully!"
else
    echo ""
    echo "❌ Failed to install dependencies with Yarn."
    echo "   Trying with npm..."
    
    # Fallback to npm if yarn fails
    if npm install; then
        echo ""
        echo "✅ Dependencies installed successfully with npm!"
    else
        echo ""
        echo "❌ Failed to install dependencies."
        echo "   Please check the error messages above and try manually."
        exit 1
    fi
fi

echo ""
echo "🎉 Refine installation complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Review the integration guide: cat REFINE_INTEGRATION.md"
echo "   2. Start the development server: npm run dev:saas"
echo "   3. Open http://localhost:3000 in your browser"
echo "   4. Try logging in with demo@cyoda.com / demo"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+K (Cmd+K on Mac) to open the command palette"
echo "   - The sidebar menu is automatically generated from resources"
echo "   - Check the console for any errors or warnings"
echo ""

