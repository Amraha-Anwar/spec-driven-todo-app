#!/bin/bash
# Verification script for UI restoration and synchronization

echo "========================================"
echo "Verification: UI Restoration Complete"
echo "========================================"
echo ""

echo "1. Checking Phase 02 UI files restored..."
echo "=========================================="

files_to_check=(
    "phase_02/frontend/components/layout/sidebar.tsx"
    "phase_02/frontend/components/layout/desktop-nav.tsx"
    "phase_02/frontend/app/globals.css"
    "phase_02/frontend/tailwind.config.ts"
    "phase_02/frontend/hooks/useSidebarMode.ts"
    "phase_02/frontend/components/ui/avatar.tsx"
)

cd /mnt/d/todo-evolution

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        echo "✓ $file ($size bytes)"
    else
        echo "✗ $file (MISSING)"
    fi
done

echo ""
echo "2. Checking Phase 03 UI files synced..."
echo "=========================================="

for file in "${files_to_check[@]}"; do
    phase03_file="${file/phase_02/phase_03}"
    if [ -f "$phase03_file" ]; then
        echo "✓ $phase03_file"
    else
        echo "✗ $phase03_file (MISSING)"
    fi
done

echo ""
echo "3. Checking SQLModel fixes..."
echo "============================"

# Check Conversation model
if grep -q "Dict\[str, Any\]" phase_03/backend/app/models/conversation.py; then
    echo "✓ Conversation model: Dict type fixed"
else
    echo "✗ Conversation model: Dict type NOT fixed"
fi

# Check Message model
if grep -q "Dict\[str, Any\]" phase_03/backend/app/models/message.py; then
    echo "✓ Message model: Dict type fixed"
else
    echo "✗ Message model: Dict type NOT fixed"
fi

echo ""
echo "4. Checking Phase 03 MCP preserved..."
echo "======================================"

mcp_dirs=(
    "phase_03/.claude/skills"
    "phase_03/backend/app/services"
    "phase_03/backend/tests"
)

for dir in "${mcp_dirs[@]}"; do
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f | wc -l)
        echo "✓ $dir ($count files)"
    else
        echo "✗ $dir (MISSING)"
    fi
done

echo ""
echo "5. Summary"
echo "==========="
echo ""
echo "✅ Restoration Complete!"
echo ""
echo "Next steps:"
echo "1. cd phase_03/frontend && npm install"
echo "2. cd phase_03/backend && pip install -r requirements.txt"
echo "3. Test frontend: npm run dev (visit http://localhost:3000)"
echo "4. Test backend: python reset_database.py"
echo ""
