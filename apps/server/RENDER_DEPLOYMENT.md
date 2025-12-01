# Render Deployment Configuration for WebSocket

This guide shows how to configure Redis Pub/Sub for WebSocket in Render.

---

## Problem

After implementing WebSocket with Redis Pub/Sub, you're getting:

```
Redis publisher error: AggregateError [ECONNREFUSED]
Redis subscriber error: AggregateError [ECONNREFUSED]
```

This means the **PubSubService cannot connect to Redis**.

---

## Solution: Configure Internal Redis Connection

### Step 1: Check Redis Service in Render

1. Go to your **Render Dashboard**
2. Find your `ai-content-generator-redis` service
3. Click on it and go to **"Info"** tab
4. Copy the **Internal Redis URL**
   - Should look like: `redis://ai-content-generator-redis:6379`
   - Or: `redis://red-xxxxx:6379` (internal hostname)

### Step 2: Update Environment Variables

For **BOTH** `ai-content-generator-server` and `ai-content-generator-worker`:

#### Option A: Use Internal Redis URL (Recommended)

Add this environment variable:

```
REDIS_HOST=ai-content-generator-redis  # Internal hostname (no http://)
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>   # If you set one
```

#### Option B: Use Full Internal URL

If you have a full internal URL like `redis://red-xxxxx:6379`:

Parse it and set:
```
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
```

### Step 3: Link Services in Render

Make sure your services are in the **same region**:

1. Go to `ai-content-generator-server` settings
2. Check **Region** (e.g., Oregon)
3. Go to `ai-content-generator-worker` settings
4. Make sure it's in the **same region**
5. Go to `ai-content-generator-redis` settings
6. Make sure it's in the **same region**

**Services in different regions cannot connect via internal hostnames!**

### Step 4: Verify Environment Variables

In your Render dashboard, for each service, verify:

**Server:**
```
REDIS_HOST=ai-content-generator-redis
REDIS_PORT=6379
REDIS_PASSWORD=<password>
NODE_ENV=production
PORT=5001
```

**Worker:**
```
REDIS_HOST=ai-content-generator-redis
REDIS_PORT=6379
REDIS_PASSWORD=<password>
NODE_ENV=production
PORT=5002
```

---

## Alternative: Use Redis External URL (Not Recommended for Production)

If internal connection doesn't work, you can use the **external Redis URL**:

1. Get the external URL from Redis service: `redis-xxxxx.render.com:6379`
2. Set:
   ```
   REDIS_HOST=redis-xxxxx.render.com
   REDIS_PORT=6379
   ```

**Note:** External connections are slower and less secure. Use internal hostnames when possible.

---

## How to Find Internal Hostname

### Method 1: Render Dashboard
1. Go to your Redis service
2. Click **"Info"** tab
3. Look for **"Internal Connection String"**

### Method 2: Service Name Pattern
Internal hostname is usually:
- Service name: `ai-content-generator-redis`
- Internal hostname: `ai-content-generator-redis` (same name)

### Method 3: From Logs
1. Deploy a service
2. Check logs for connection attempts
3. Look for the hostname it's trying to connect to

---

## Common Issues

### Issue 1: "ECONNREFUSED"
**Cause:** Wrong hostname or services in different regions

**Fix:**
- Verify services are in same region
- Use correct internal hostname
- Check Redis is actually running

### Issue 2: "Authentication failed"
**Cause:** Wrong password or no password set

**Fix:**
- Check if your Redis requires a password
- If yes, set `REDIS_PASSWORD`
- If no, you can remove it from env vars

### Issue 3: "Connection timeout"
**Cause:** Network/firewall issue or wrong port

**Fix:**
- Verify port is 6379 (default Redis port)
- Check Redis service is running
- Restart services

---

## Testing After Configuration

After updating env vars:

1. **Redeploy Server:**
   - Go to `ai-content-generator-server`
   - Click **"Manual Deploy" → "Deploy latest commit"**

2. **Redeploy Worker:**
   - Go to `ai-content-generator-worker`
   - Click **"Manual Deploy" → "Deploy latest commit"**

3. **Check Logs:**

**Server logs should show:**
```
Redis client connected successfully
Redis publisher ready
Redis subscriber ready
Socket.IO initialized
```

**Worker logs should show:**
```
Redis client connected successfully
Redis publisher ready
Worker is now listening for jobs...
```

---

## Render Service Configuration Checklist

### Redis Service:
- ✅ Service type: Redis
- ✅ Plan: Free or Starter
- ✅ Region: e.g., Oregon (US West)
- ✅ Version: 7.x

### Server Service:
- ✅ Service type: Web Service
- ✅ Build command: `pnpm install --frozen-lockfile; pnpm build`
- ✅ Start command: `pnpm start`
- ✅ Region: **Same as Redis**
- ✅ Environment variables set correctly

### Worker Service:
- ✅ Service type: Background Worker
- ✅ Build command: `pnpm install --frozen-lockfile; pnpm build`
- ✅ Start command: `pnpm worker:prod`
- ✅ Region: **Same as Redis**
- ✅ Environment variables set correctly

---

## Architecture in Render

```
┌─────────────────────────────────────────┐
│           Render Region (Oregon)        │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Server     │◄───┤    Redis     │  │
│  │  Port 5001   │    │  Port 6379   │  │
│  └──────────────┘    └──────┬───────┘  │
│         ▲                    │          │
│         │                    │          │
│         │      Internal      │          │
│         │      Network       │          │
│         │                    │          │
│         │                    ▼          │
│  ┌──────┴───────┐    ┌──────────────┐  │
│  │   Browser    │    │   Worker     │  │
│  │  (External)  │    │  Port 5002   │  │
│  └──────────────┘    └──────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Key Points:**
- Server, Worker, and Redis **MUST** be in same region
- Use **internal hostnames** for Redis connection
- External users connect to Server via public URL
- Worker and Server communicate via Redis Pub/Sub

---

## Quick Fix Summary

1. **Check Redis internal hostname:**
   ```
   ai-content-generator-redis
   ```

2. **Set environment variables in BOTH server and worker:**
   ```
   REDIS_HOST=ai-content-generator-redis
   REDIS_PORT=6379
   ```

3. **Redeploy both services**

4. **Check logs** - should see "Redis publisher ready" and "Redis subscriber ready"

That's it! WebSocket should now work in production. 🚀
