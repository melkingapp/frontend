# 🔐 Frontend Secrets Checklist

Set these secrets in **GitHub → Settings → Secrets and variables → Actions** for the `melkingapp/frontend` repository.

## 🚀 Deployment Secrets

| Name | Description | Example |
| --- | --- | --- |
| `SSH_PRIVATE_KEY` | Private key used by GitHub Actions to SSH into the server | (contents of `~/.ssh/id_ed25519`) |
| `SSH_USER` | SSH username with write + `systemctl reload nginx` access | `root` / `deploy` |
| `SSH_HOST` | Server IP or domain | `171.22.25.201` |
| `DEPLOYMENT_URL` | Public URL used for post-deploy health checks | `https://melkingapp.ir` |

## 🌐 Frontend Runtime Secrets

| Name | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend REST API base URL injected during `npm run build` | `http://171.22.25.201:9000/api/v1` |

## ⚙️ Optional Overrides

| Name | Description | Default |
| --- | --- | --- |
| `NGINX_SERVICE` | Service name reloaded after deploy | `nginx` (set as env in workflow) |
| `DEPLOY_PATH` | Target path for releases | `/var/www/melking/frontend-new` |

> If you need to override `NGINX_SERVICE` or `DEPLOY_PATH`, edit `.github/workflows/ci-cd.yml`.

## 🧪 Verification Steps

1. Generate SSH keys on the server (or locally) with `ssh-keygen -t ed25519 -C "github-actions@melking"`.
2. Add the public key to `~/.ssh/authorized_keys` on the server.
3. Add each secret above via the GitHub UI (copy/paste helper: `COPY_PASTE_SECRETS.txt`).
4. Push a test commit to `main` – the pipeline should run through build + deploy without manual steps.

## 🛡️ Security Tips

- Rotate SSH keys and API URLs regularly.
- Restrict repository access to the minimum number of maintainers.
- Never commit `.env` or SECRET values to git.
- Use branch protection on `main` once CI is green.

Need help? Ping DevOps or open an issue – better safe than sorry.*** End Patch

