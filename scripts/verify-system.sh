#!/bin/bash

# SignalFlow - Comprehensive System Verification
# Tests all endpoints and verifies the application is ready for submission

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         SignalFlow - System Verification Report          ║"
echo "║                  April 28, 2026                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
API_URL="http://localhost:3001/api"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    local data=$4
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅${NC} $name"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $name (HTTP $response)"
        ((FAIL++))
    fi
}

# ============================================
echo "📡 BACKEND SERVICES"
echo "============================================"

# Test backend health
echo ""
echo "Testing: Backend API Server..."
response=$(curl -s http://localhost:3001/health)
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✅${NC} Backend running on http://localhost:3001"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Backend not responding"
    ((FAIL++))
fi

# ============================================
echo ""
echo "🔌 API ENDPOINTS"
echo "============================================"
echo ""

# Test signal endpoints
test_endpoint "GET /api/signals" "$API_URL/signals" "GET"
test_endpoint "GET /api/signals (with params)" "$API_URL/signals?status=active" "GET"

# Test signal creation
signal_data='{"symbol":"TEST","signal_type":"BUY","confidence":0.8,"entry_price":100,"target_price":105,"stop_loss":95}'
test_endpoint "POST /api/signals" "$API_URL/signals" "POST" "$signal_data"

# Test portfolio
test_endpoint "GET /api/portfolio/demo-user" "$API_URL/portfolio/demo-user" "GET"

# Test AI endpoints
test_endpoint "GET /api/ai/predictions" "$API_URL/ai/predictions" "GET"

# Test SoSoValue endpoints
test_endpoint "GET /api/sosovalue/market/BTC" "$API_URL/sosovalue/market/BTC" "GET"
test_endpoint "GET /api/sosovalue/sentiment/BTC" "$API_URL/sosovalue/sentiment/BTC" "GET"

# ============================================
echo ""
echo "📊 DATA VERIFICATION"
echo "============================================"
echo ""

# Check signals count
signals_count=$(curl -s "$API_URL/signals" | grep -o '"id"' | wc -l)
if [ "$signals_count" -gt 0 ]; then
    echo -e "${GREEN}✅${NC} Database has $signals_count active signals"
    ((PASS++))
else
    echo -e "${RED}❌${NC} No signals in database"
    ((FAIL++))
fi

# Check portfolio
portfolio=$(curl -s "$API_URL/portfolio/demo-user")
if echo "$portfolio" | grep -q "BTC"; then
    echo -e "${GREEN}✅${NC} Portfolio data populated"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC} Portfolio may be empty (optional)"
fi

# ============================================
echo ""
echo "⚙️ SYSTEM REQUIREMENTS"
echo "============================================"
echo ""

# Check Node version
if command -v node &> /dev/null; then
    node_version=$(node -v)
    if [[ "$node_version" > "v18" ]] || [[ "$node_version" == "v18"* ]]; then
        echo -e "${GREEN}✅${NC} Node.js $node_version (supported)"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️${NC} Node.js $node_version (18+ recommended)"
    fi
else
    echo -e "${RED}❌${NC} Node.js not found"
    ((FAIL++))
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    echo -e "${GREEN}✅${NC} npm $npm_version"
    ((PASS++))
else
    echo -e "${RED}❌${NC} npm not found"
    ((FAIL++))
fi

# Check database
if [ -f "/home/obx/Desktop/SignalFlow/data/signalflow.db" ]; then
    db_size=$(ls -lh /home/obx/Desktop/SignalFlow/data/signalflow.db | awk '{print $5}')
    echo -e "${GREEN}✅${NC} Database exists ($db_size)"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Database not found"
    ((FAIL++))
fi

# ============================================
echo ""
echo "🎯 BUILDATHON REQUIREMENTS"
echo "============================================"
echo ""

# Check README
if [ -f "/home/obx/Desktop/SignalFlow/README.md" ]; then
    lines=$(wc -l < /home/obx/Desktop/SignalFlow/README.md)
    echo -e "${GREEN}✅${NC} README.md ($lines lines)"
    ((PASS++))
else
    echo -e "${RED}❌${NC} README.md missing"
    ((FAIL++))
fi

# Check API docs
if [ -f "/home/obx/Desktop/SignalFlow/docs/API.md" ]; then
    lines=$(wc -l < "/home/obx/Desktop/SignalFlow/docs/API.md")
    echo -e "${GREEN}✅${NC} API.md ($lines lines)"
    ((PASS++))
else
    echo -e "${RED}❌${NC} API.md missing"
    ((FAIL++))
fi

# Check env file
if [ -f "/home/obx/Desktop/SignalFlow/.env" ]; then
    echo -e "${GREEN}✅${NC} .env configured"
    ((PASS++))
else
    echo -e "${RED}❌${NC} .env not found"
    ((FAIL++))
fi

# Check GitHub structure
if [ -d "/home/obx/Desktop/SignalFlow/.git" ] || [ -f "/home/obx/Desktop/SignalFlow/.gitignore" ]; then
    echo -e "${GREEN}✅${NC} Git repository ready"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC} Not a git repository (initialize with: git init)"
fi

# ============================================
echo ""
echo "📝 DELIVERABLES CHECKLIST"
echo "============================================"
echo ""

# Check all required files
files=(
    "README.md:Main documentation"
    "QUICK_START.md:Quick start guide"
    "WAVE1_STATUS.md:Submission status"
    "BUSINESS_PLAN.md:Business overview"
    "docs/API.md:API documentation"
    ".env:Environment configuration"
    ".gitignore:Git ignore file"
    "backend/src/index.js:Backend server"
    "frontend/app/page.js:Frontend dashboard"
    "contracts/SignalFlowExecutor.sol:Smart contract"
    "ai-engine/src/engine.py:AI engine"
)

for file in "${files[@]}"; do
    filename="${file%%:*}"
    description="${file##*:}"
    fullpath="/home/obx/Desktop/SignalFlow/$filename"
    
    if [ -f "$fullpath" ]; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $description ($filename missing)"
        ((FAIL++))
    fi
done

# ============================================
echo ""
echo "🚀 DEPLOYMENT READINESS"
echo "============================================"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}✅ READY FOR SUBMISSION${NC}"
    echo ""
    echo "All systems operational. You are ready to:"
    echo "  1. Push to GitHub"
    echo "  2. Submit to Akindo"
    echo "  3. Wait for feedback"
    echo "  4. Iterate for Wave 2"
else
    echo -e "${YELLOW}⚠️ NEEDS ATTENTION${NC}"
    echo ""
    echo "Please fix the failing items before submission."
fi

# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    FINAL SUMMARY                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo "Status: ✅ PRODUCTION READY"
    exit 0
else
    echo "Status: ❌ NEEDS FIXES"
    exit 1
fi
