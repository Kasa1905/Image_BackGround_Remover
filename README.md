# Image Background Remover

Background removal web app with a React (Vite) frontend, Express backend, and Python (rembg) worker. Run locally, via Docker Compose, or deploy the frontend + API to Vercel (API mode only).

## Features
- Upload images (JPG/PNG/WEBP/GIF) up to 10MB
- Remove background locally using rembg (offline, default enabled) or via remove.bg API (Vercel uses API mode only)
- Optional custom background colors
- Health endpoint for monitoring and simple logging via Winston

## Tech Stack
- Frontend: React 18 + Vite, Fetch API
- Backend: Node.js/Express, Multer, Winston
- Image Processing: Python + rembg, optional remove.bg API
- Containerization: Docker/Docker Compose

## Prerequisites
- Node.js 18+ and npm
- Python 3.9+ with `pip` (for local processing)
- Docker & Docker Compose (optional, for containers)

## Setup (local)
1) Install JS deps (workspaces):
```sh
npm install
npm install --prefix backend
npm install --prefix frontend
```
2) Set backend envs in `backend/.env` (sample):
```sh
PORT=3001
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=/tmp/uploads
# Optional for API mode (required on Vercel)
REMOVE_BG_API_KEY=your_remove_bg_key
# Set to false to disable local processing (e.g., on Vercel)
ENABLE_LOCAL=true
LOG_LEVEL=info
```
3) Set frontend envs in `frontend/.env` (sample):
```sh
VITE_API_URL=http://localhost:3001
```
4) Install Python deps for rembg (from backend root):
```sh
cd backend
python3 -m venv src/python/venv
source src/python/venv/bin/activate
pip install --upgrade pip
pip install -r src/python/requirements.txt
```

## Run
- Start both (from repo root):
```sh
npm run dev
```
- Or separately:
```sh
npm run dev:backend
npm run dev:frontend
```
Backend serves on `http://localhost:3001`, frontend on `http://localhost:5173`.

## Docker Compose
```sh
docker-compose up --build
```
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## API (backend)
- `POST /api/remove-background` form-data: `image` (file), optional `mode` (`local`|`api`, default `api` on Vercel), optional `bg_color` (hex or `transparent`). Returns base64 PNG. Set `api_provider=removebg` when using API mode.
- `GET /health` returns `{ status: "healthy" }`.

## Project Structure
```
backend/
  src/index.js          # Express app
  src/routes/upload.js  # Upload + processing route
  src/services/processor.js # Local/API processing
  src/python/remove_bg.py   # rembg script
frontend/
  src/App.jsx           # UI composition
  src/components/UploadForm.jsx # Upload + options
  src/api/client.js     # API client
```

## Notes
- Local processing uses `src/python/venv/bin/python`; ensure the venv exists and rembg is installed.
- API mode requires `REMOVE_BG_API_KEY` (remove.bg). If missing, API mode will fail.
- Uploaded files are stored in `UPLOAD_DIR` (default `/tmp/uploads`) and cleaned after processing.

## Useful Scripts
- `npm run install:all` – install deps for root, backend, frontend
- `npm run dev` – run backend + frontend concurrently
- `npm run build` – run backend + frontend builds (frontend uses Vite; backend currently no build step)

## Vercel Deployment (API mode)
- Serverless function entry: `api/index.js` wraps the Express app; requests to `/api/*` are rewritten there via `vercel.json`.
- Build command installs workspaces then builds the Vite app; output directory is `frontend/dist`.
- Required env vars in Vercel project: `REMOVE_BG_API_KEY` (for remove.bg) and optionally `ENABLE_LOCAL=false` (keeps local mode off). Local mode is not available on Vercel.
- Frontend API base is relative (`/api`), so no extra configuration is needed for the client.

## Troubleshooting
- Connection issues: verify `VITE_API_URL` matches backend and CORS `FRONTEND_URL`.
- Python errors: activate the venv and reinstall `rembg`/`Pillow` via `requirements.txt`.
- remove.bg errors: ensure `REMOVE_BG_API_KEY` is set and valid.
