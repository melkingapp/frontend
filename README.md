# Melking Frontend

React + Vite implementation of the Melking experience (manager, resident, and public portals) with Redux Toolkit and end-to-end API integration with the Django backend.

## ⚙️ Requirements

- Node.js 20.x (use `nvm use 20` or install from nodejs.org)
- npm 10+
- Modern browser supporting ES2020

## 🚀 Quick Start

```bash
cd frontend
npm install
cp env.example .env.local   # یا فایل را دستی بسازید
npm run dev
```

Visit `http://localhost:5173` – the dev server will call the backend defined in `VITE_API_BASE_URL`.

## 📦 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the built bundle locally |
| `npm run lint` | ESLint (JS + JSX) checks |

## 🔑 Environment Variables

All Vite variables require the `VITE_` prefix. Copy `env.example` to `.env.local` (development) or `.env.production` (CI/CD) and update the values.

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the Django REST API | `https://melkingapp.ir/api/v1` |

## 🏗️ Project Structure

```
frontend/
├─ public/                 # Static assets copied as-is
├─ src/
│  ├─ app/                 # Redux store configuration
│  ├─ features/            # Domain slices + UI
│  ├─ layout/              # Shell layouts
│  ├─ pages/               # Route-level pages
│  ├─ shared/              # Components, hooks, services, utils
│  ├─ config/api.js        # API base + endpoint helpers
│  └─ styles/              # Global styles / fonts
├─ env.example             # Sample environment variables
└─ .github/workflows/      # CI/CD definitions
```

## 🤖 CI/CD

`ci-cd.yml` mirrors the backend pipeline with Node tooling:

1. **Install & Cache** – `npm ci` on Node 20 with dependency cache
2. **Lint** – `npm run lint`
3. **Build** – `npm run build` (injects `VITE_API_BASE_URL` from secrets)
4. **Deploy** – Copies `dist/` to `/var/www/melking/frontend-new`, updates the `current` symlink, reloads Nginx, and health-checks `DEPLOYMENT_URL`
5. **Notify** – Emits success/failure hooks (replace with Slack/Discord/etc.)

Read `CI_CD_SETUP.md`, `DEPLOYMENT.md`, and `.github/SECRETS_SETUP.md` for the detailed checklist (secrets, server prep, troubleshooting).

## 📄 Useful Docs

- `API_INTEGRATION_README.md` – Backend ↔ Frontend endpoints
- `CI_CD_SETUP.md` – GitHub Actions & secrets checklist
- `DEPLOYMENT.md` – Server steps (directory layout, Nginx, health checks)
- `.github/workflows/README.md` – Workflow overview

---

Need help? Open an issue in `melkingapp/frontend` یا به تیم DevOps/FE پیام بدهید. Happy shipping! 🚀

