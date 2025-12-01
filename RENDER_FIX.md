# Quick Fix for Render Redis Connection Error

## Problem
```
Redis publisher error: AggregateError [ECONNREFUSED]
Redis subscriber error: AggregateError [ECONNREFUSED]
```

## Root Cause
After implementing WebSocket, your **Server** and **Worker** services are trying to connect to Redis Pub/Sub, but they're using the wrong hostname in Render.

---

## ✅ Quick Fix (5 Steps)

### Step 1: Find Redis Internal Hostname

Go to Render Dashboard → `ai-content-generator-redis` service → **Info tab**

Look for **"Internal Connection String"** or **"Hostname"**

It should be something like:
- `ai-content-generator-redis` (the service name)
- OR `red-xxxxx` (internal ID)

### Step 2: Update Server Environment Variables

Go to: `ai-content-generator-server` → **Environment** tab

Add/Update these variables:
```
REDIS_HOST=ai-content-generator-redis
REDIS_PORT=6379
REDIS_PASSWORD=<leave empty if no password>
```

### Step 3: Update Worker Environment Variables

Go to: `ai-content-generator-worker` → **Environment** tab

Add/Update these variables (same as server):
```
REDIS_HOST=ai-content-generator-redis
REDIS_PORT=6379
REDIS_PASSWORD=<leave empty if no password>
```

### Step 4: Verify All Services Are in Same Region

**CRITICAL:** All 3 services MUST be in the same region!

Check:
- `ai-content-generator-redis` → Settings → **Region**
- `ai-content-generator-server` → Settings → **Region**
- `ai-content-generator-worker` → Settings → **Region**

If they're different, recreate the service in the correct region.

### Step 5: Redeploy Both Services

1. Go to `ai-content-generator-server`
   - Click **"Manual Deploy"**
   - Select **"Deploy latest commit"**

2. Go to `ai-content-generator-worker`
   - Click **"Manual Deploy"**
   - Select **"Deploy latest commit"**

---

## ✅ Verify It's Working

### Check Server Logs:
Should see:
```
✅ Redis client connected successfully
✅ Redis publisher ready
✅ Redis subscriber ready
✅ Socket.IO initialized
```

### Check Worker Logs:
Should see:
```
✅ Redis client connected successfully
✅ Redis publisher ready
✅ Worker is now listening for jobs...
```

---

## If Still Not Working

### Option 1: Check Redis Service
- Is `ai-content-generator-redis` actually running?
- Go to the service and check status
- Restart it if needed

### Option 2: Use Full Internal URL
If you have Redis internal URL like `redis://red-abc123:6379`:

Set:
```
REDIS_HOST=red-abc123
REDIS_PORT=6379
```

### Option 3: Check Logs for Actual Error
Look at the full error message in logs - it might show the hostname it's trying to connect to.

---

## Summary

**The issue:** Services can't find Redis because hostname is wrong in Render

**The fix:** Use internal hostname (`ai-content-generator-redis`) instead of `localhost`

**Important:** All services must be in the same Render region!

---

For detailed explanation, see `RENDER_DEPLOYMENT.md`
