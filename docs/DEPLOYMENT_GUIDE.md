# UrbanLens — Production Deployment & Hosting Guide

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Agent 6 — Deployment & Final Demonstration Engineering)  
**Date**: November 2026  
**Auditor**: Lead Systems Integration & Deployment Architect  
**Status**: LOCAL & PRODUCTION DEPLOYMENT READY  

---

## 1. Deployment Philosophy & Cloud Infrastructure Policy

UrbanLens is designed to be fully reproducible, modular, and deployable without expensive cloud subscriptions or proprietary cloud dependencies:
* **No Database Daemon**: Eliminates managed PostgreSQL/MongoDB cloud instances. Flat-file CSV and JSON datasets are packaged directly with the backend code.
* **Separation of Concerns**: Frontend client and backend API gateway maintain decoupled configurations, enabling unified single-server serving or multi-cloud edge deployment.
* **Zero Secret Exposure**: The application operates without requiring external paid API keys or private tokens. All environment variables have safe, local defaults.
* **Deployment Honesty**: The system is fully tested and verified for local host demonstration on macOS/Linux. No claim of live public cloud deployment is made unless an operator has explicitly provisioned and verified a remote instance.

---

## 2. Deployment Topology Options

UrbanLens supports three distinct hosting configurations:

```
+-----------------------------------------------------------------------------------------+
| Deployment Architectures                                                                |
+--------------------------+------------------------------+-------------------------------+
| Model                    | Frontend Hosting             | Backend API Hosting           |
+--------------------------+------------------------------+-------------------------------+
| 1. Local Academic Demo   | Vite Dev / Static Preview    | Express API Server (Port 3001)|
| 2. Unified Node Service  | Served from server/dist/     | Express API Gateway (Port 3001)|
| 3. Decoupled Edge / VPS  | Vercel / Netlify / Cloudflare| Render / Railway / EC2 / VPS  |
+--------------------------+------------------------------+-------------------------------+
```

---

## 3. Option 1: Local Demonstration Mode (Recommended for Defense)

The automated script [`run_demo.sh`](file:///Users/vanshbarnes/Documents/UrbanLens%20Project/run_demo.sh) provides a one-click execution pipeline that validates the environment, executes all 251 quality checks, and boots both servers concurrently:

```bash
# Make the demo runner executable (if necessary)
chmod +x run_demo.sh

# Run complete test verification and launch interactive demo
./run_demo.sh
```

### Execution Flow:
1. Validates Node.js (v18+) and Python 3.9+ runtimes.
2. Executes 172 Python analytical and ingestion tests (`server/python/tests/`).
3. Executes 76 Express API and Affordability tests (`server/src/__tests__/`).
4. Verifies production builds (`tsc -b` and `vite build`).
5. Launches Express API gateway on `http://localhost:3001` in background.
6. Launches React Vite dashboard on `http://localhost:5173`.
7. Traps exit signals (`Ctrl+C`) to terminate all child processes cleanly without orphaned ports.

---

## 4. Option 2: Unified Node.js Production Server

In this topology, a single Node.js process serves both the REST API under `/api/*` and the static compiled frontend bundle for all visual routes.

### 4.1 Production Build Generation
```bash
# Compile both client bundle and server TypeScript
npm run build
```
This produces:
* Client static assets: `client/dist/`
* Server transpiled JavaScript: `server/dist/`

### 4.2 Production Server Startup
```bash
# From repository root
cd server
NODE_ENV=production PORT=3001 node dist/index.js
```

### 4.3 Process Management with PM2
For high availability and automatic crash restarts on Linux or macOS servers:
```bash
# Install PM2 globally
npm install -g pm2

# Start server process with 1 GB memory limit
pm2 start server/dist/index.js --name "urbanlens" --max-memory-restart 500M --env production

# Check live status
pm2 status

# Inspect real-time logs
pm2 logs urbanlens
```

---

## 5. Option 3: Decoupled Cloud Deployment (Zero-Cost Tier)

### 5.1 Frontend Static Hosting (Vercel or Netlify)
1. **Root Directory**: `client`
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: `https://your-api-domain.com` (or leave blank if using reverse proxy rewrites)
5. **SPA Redirect Configuration (`client/public/_redirects` for Netlify)**:
   ```text
   /api/*  https://your-api-domain.com/api/:splat  200
   /*      /index.html                             200
   ```

### 5.2 Backend Service (Render or Railway)
1. **Root Directory**: `server`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start` (executes `node dist/index.js`)
4. **Environment Variables**:
   - `PORT`: `3001` (or dynamic port assigned by host)
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app`
   - `NODE_ENV`: `production`

---

## 6. Reverse Proxy Configuration (Nginx)

For deployment on a dedicated Linux VPS (Ubuntu/Debian) behind Nginx:

```nginx
server {
    listen 80;
    server_name urbanlens.example.com;

    # Static Frontend Assets
    location / {
        root /var/www/urbanlens/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Gateway Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 1M;
    }
}
```

---

## 7. Configuration Reference

| Variable | Scope | Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Server | `3001` | TCP port on which Express API gateway listens. |
| `CORS_ORIGIN` | Server | `http://localhost:5173,http://127.0.0.1:5173` | Comma-delimited list of permitted web origins. |
| `NODE_ENV` | Full-Stack | `development` | Set to `production` for optimized error masking and static serving. |
| `VITE_API_URL` | Client | `/api` | Base URL used by `client/src/api/client.ts` to issue HTTP requests. |

---

## 8. Troubleshooting Guide

### Port Already in Use (`EADDRINUSE: 3001`)
```bash
# Identify process occupying port 3001
lsof -i :3001

# Terminate occupying process
kill -9 $(lsof -t -i :3001)
```

### Python Subprocess Not Found (`python3: command not found`)
Ensure Python 3 is symlinked on your system PATH:
```bash
which python3 || which python
```
If Python is aliased, create a symlink or adjust your shell profile (`export PATH="/usr/local/bin:$PATH"`).

### Client Fails to Fetch API Data (CORS Error in Browser)
Verify that the `CORS_ORIGIN` environment variable in `server/.env` includes your exact browser URL (including protocol and port, e.g. `http://localhost:5173`).
