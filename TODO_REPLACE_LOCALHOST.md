# TODO: Replace Hardcoded localhost with Env Vars

## ✅ ALL COMPLETED

### Files Updated & Committed:

| File | Change |
|------|--------|
| `client/vite.config.js` | Uses `VITE_API_PROXY_URL` env var |
| `client/src/config.js` | NEW - Centralized API URL config |
| `client/src/api.js` | Imports from config.js |
| `server/services/emailService.js` | Uses `CLIENT_URL` env var |
| `server/routes/auth.js` | Uses `CLIENT_URL` env var |
| `server/index.js` | Removed static file serving |
| `server/verify-api.js` | Uses `API_URL` env var |

### Render Dashboard - Add Environment Variables:

**Backend Service:**
```
CLIENT_URL = https://expense-tracker-1-d6wy.onrender.com
```

**Frontend Service:**
```
VITE_API_URL = https://your-backend.onrender.com
```

### Deployment Steps:
1. ✅ Changes committed and pushed to `blackboxai/update-api-url`
2. Add env vars in Render dashboard
3. Redeploy both services

