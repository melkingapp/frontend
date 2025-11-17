# 🚀 GitHub Actions Workflows (Frontend)

This folder hosts the automation for the standalone `melkingapp/frontend` repository.

## 📁 Files

### `ci-cd.yml`

Main pipeline triggered on pushes & pull requests for `main` and `develop`.

Steps:
1. **Install & Cache** Node 20 dependencies (`npm ci`)
2. **Lint** with ESLint
3. **Build** production bundle (`npm run build`) with `VITE_API_BASE_URL` injected from secrets
4. **Deploy** (pushes to `main` only):
   - Ship `dist/` via SSH to `/var/www/melking/frontend-new`
   - Switch the `current` symlink and reload Nginx
   - Health-check `DEPLOYMENT_URL`
5. **Notify** success or failure (placeholder logs – extend with Slack/Telegram later)

## 🔐 Required Secrets

See `../SECRETS_SETUP.md` for the full description. Minimum set:

| Secret | Purpose |
| --- | --- |
| `SSH_PRIVATE_KEY` | GitHub Actions → server authentication |
| `SSH_USER` / `SSH_HOST` | SSH credentials for the target host |
| `VITE_API_BASE_URL` | Backend endpoint injected during build |
| `DEPLOYMENT_URL` | Public URL for the health check |

## 🧪 Tips

- Keep `npm run lint` & `npm run build` green before pushing to `main`
- To rerun a failed job, use "Re-run jobs" in the Actions tab – no need to push dummy commits
- Update `DEPLOY_PATH` / `NGINX_SERVICE` in the workflow if the server layout changes

Need to tweak the pipeline? Edit the YAML, open a PR, and ensure the workflow passes before merging.*** End Patch

