#!/bin/bash
git commit -m "ci: fix GitHub Actions failure by switching to pnpm" -m "### 💡 What
Updated \`.github/workflows/ci-cd.yml\` to use \`pnpm/action-setup@v4\` and replaced all \`npm\` commands with their \`pnpm\` equivalents. Updated Node setup cache to \`cache: pnpm\`. Removed \`package-lock.json\` and added \`pnpm-lock.yaml\`.

### 🎯 Why
The repository strictly enforces \`pnpm\` for dependency management. The CI pipeline previously failed because \`npm ci\` was being run in an environment that only contains a \`pnpm-lock.yaml\` file.

### 📊 Impact
Restores the CI pipeline functionality to successfully install dependencies and build the application correctly using the project's mandated package manager."
