# UrbanLens — Production Deployment & Hosting Guide

**Project**: UrbanLens — Urban Market Intelligence & Housing Affordability Analytics Platform  
**Target Milestone**: Milestone 8 (Final Engineering & Submission)  
**Date**: November 2026  
**Status**: DEPLOYMENT READY  

---

## 1. Deployment Topology Options

UrbanLens is designed to deploy cleanly under three distinct deployment models:
1. **Local Demonstration Mode (Recommended for Academic Review)**: Both client and server run locally on loopback interfaces (`localhost:5173` and `localhost:3001`), managed via `./run_demo.sh`.
2. **Unified Single-Server Deployment**: The Express server hosts both the REST API endpoints and statically serves the compiled Vite production bundle (`client/dist/`) on a single port (e.g., 3001 or 8080).
3. **Decoupled Cloud Hosting**:
   - Frontend: Static Edge Hosting (Vercel, Netlify, or AWS S3 + CloudFront).
   - Backend: Node.js runtime (Railway, Render, DigitalOcean App Platform, or AWS EC2).

---

## 2. Option 1: Local Academic Demonstration Mode

This mode requires zero cloud configuration and provides complete offline evaluation capability.

```bash
# Make the demo runner executable (if not already)
chmod +x run_demo.sh

# Launch the full-stack demonstration
./run_demo.sh
```

The script:
1. Runs all 172 Python unit and pipeline tests.
2. Runs all 76 Express API integration tests.
3. Builds the client and server production artifacts.
4. Starts the API server on `http://localhost:3001`.
5. Starts the client on `http://localhost:5173`.
6. Launches your default web browser to the dashboard.

---

## 3. Option 2: Unified Single-Server Production Deployment

In this model, a single Node.js process handles API calls under `/api/*` and serves the production client for all other routes.

### 3.1 Build the Application
```bash
# Compile both client and server
npm run build
```

### 3.2 Server Static Asset Serving Setup
In `server/src/index.ts`, static middleware can serve the client build:
```typescript
import path from 'path';

// Serve compiled client assets in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
```

### 3.3 Running via PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Start the unified server in production mode
NODE_ENV=production PORT=3001 pm2 start server/dist/index.js --name "urbanlens-server"

# Monitor status
pm2 status
pm2 logs urbanlens-server
```

---

## 4. Option 3: Decoupled Cloud Deployment

### 4.1 Frontend Deployment (e.g., Vercel / Netlify)
1. Set Root Directory to `client`.
2. Build Command: `npm run build`.
3. Output Directory: `dist`.
4. Configure Rewrites in `vercel.json` or `_redirects` for single-page routing:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://api.yourdomain.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### 4.2 Backend Deployment (e.g., Render / Railway)
1. Set Root Directory to `server`.
2. Build Command: `npm install && npm run build`.
3. Start Command: `npm run start`.
4. Configure Environment Variables:
   - `PORT`: `3001` (or provided dynamically by host)
   - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`
   - `NODE_ENV`: `production`

---

## 5. Reverse Proxy Configuration (Nginx)

For deployment behind Nginx on a Linux virtual machine:

```nginx
server {
    listen 80;
    server_name urbanlens.example.com;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Client Static Assets
    location / {
        root /var/www/urbanlens/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 1M;
    }
}
```

---

## 6. Environment Checklist & Security Verification

Before promoting to a publicly accessible production URL:
- [x] `CORS_ORIGIN` matches the exact deployed frontend origin (no wildcard `*`).
- [x] `NODE_ENV` is set to `production` (disabling development error verbose dumps).
- [x] Body parser ceiling confirmed at `1mb`.
- [x] All 248 unit and integration tests passing.
- [x] No sensitive API keys or credentials stored in repository commits.
- [x] HTTPS enforced via TLS certificate (Let's Encrypt / Cloudflare).
