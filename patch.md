<<<<<<< SEARCH
      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Lint
        run: npm run lint
        continue-on-error: true

      - name: 🏗️ Build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL || 'http://171.22.25.201:9000/api/v1' }}
        run: npm run build
=======
      - name: ⚙️ Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: 📦 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 🔍 Lint
        run: pnpm run lint
        continue-on-error: true

      - name: 🏗️ Build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL || 'http://171.22.25.201:9000/api/v1' }}
        run: pnpm run build
>>>>>>> REPLACE
