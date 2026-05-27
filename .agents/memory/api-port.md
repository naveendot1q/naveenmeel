---
name: Replit API port
description: The API server's actual TCP port and how the Vite proxy should target it
---

The API server (`artifacts/api-server`) listens on **port 8080** in the Replit environment.
Confirmed via `curl localhost:8080/api/healthz` → `{"status":"ok"}`.

The original `vite.config.ts` proxy had `target: "http://localhost:5000"` — this was wrong (port 5000 is not listening). Corrected to `localhost:${API_PORT || 8080}`.

**Why:** Replit assigns PORT=8080 to the api-server workflow; `/proc/net/tcp` shows 18080 as the raw socket but Replit's internal networking maps localhost:8080 → the api-server.

**How to apply:** Always use 8080 (or API_PORT env var) as the proxy target in vite.config.ts.
