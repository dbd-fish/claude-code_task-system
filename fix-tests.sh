#!/bin/bash

# Fix userEvent.setup() issues in all test files
echo "Fixing userEvent.setup() issues..."

# List of test files to fix
TEST_FILES=(
    "frontend/src/components/Dashboard.test.tsx"
    "frontend/src/components/Login.test.tsx"
    "frontend/src/components/TaskForm.test.tsx"
    "frontend/src/components/TaskList.test.tsx"
    "frontend/src/hooks/useTaskManagement.test.ts"
    "frontend/src/services/api.test.ts"
    "frontend/src/tests/integration/api.integration.test.ts"
    "frontend/src/utils/errorHandler.test.ts"
    "frontend/src/utils/formValidation.test.ts"
    "frontend/src/utils/taskUtils.test.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        sed -i 's/const user = userEvent\.setup();/const user = userEvent;/g' "$file"
    fi
done

echo "Done fixing userEvent issues!"