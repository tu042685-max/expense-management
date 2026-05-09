#!/bin/bash

# SplitFlow Development Setup Script

echo "🚀 SplitFlow - Development Setup"
echo "================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo -e "${BLUE}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Backend setup
echo -e "${BLUE}Setting up backend...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Please copy .env.example to .env and update DATABASE_URL"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..

# Frontend setup
echo -e "${BLUE}Setting up frontend...${NC}"
cd client/Expense-management
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Using default VITE_API_URL=http://localhost:4000/api"
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ../..

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update server/.env with your DATABASE_URL"
echo "2. Run: npm run dev:all"
echo ""
echo -e "${BLUE}Or run separately:${NC}"
echo "  Backend:  cd server && npm run dev"
echo "  Frontend: cd client/Expense-management && npm run dev"
