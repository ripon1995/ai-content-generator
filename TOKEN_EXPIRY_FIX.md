# Token Expiry Fix - Automatic Login Redirect

## Problem

After 15 minutes, the JWT access token expires. When you refresh the page:
- ❌ The app loads from localStorage
- ❌ Shows as authenticated (but token is expired)
- ❌ Page gets stuck until an API call fails with 401
- ❌ Not user-friendly!

## Solution

Added **client-side token validation** on app initialization.

---

## What Was Implemented

### 1. **JWT Utilities** (`apps/web/src/utils/jwt.ts`)

Created utilities to decode and validate JWT tokens client-side:

```typescript
// Decode JWT token
const decoded = decodeToken(token);

// Check if expired
const expired = isTokenExpired(token);  // true/false

// Get time until expiry
const seconds = getTokenExpiryTime(token);  // seconds remaining
```

**How it works:**
- Decodes the JWT payload (base64url)
- Extracts the `exp` (expiration timestamp)
- Compares with current time
- Returns `true` if expired

**Note:** This is client-side validation only - NOT for security! The server still validates the token properly.

### 2. **Updated AuthContext** (`apps/web/src/contexts/AuthContext.tsx`)

Modified initialization to check token expiry:

```typescript
const initializeAuth = () => {
  const storedUser = getUser();
  const accessToken = getAccessToken();

  // ✅ NEW: Check if token is valid (not expired)
  if (storedUser && accessToken && !isTokenExpired(accessToken)) {
    // Token is valid - user stays authenticated
    setState({ user: storedUser, isAuthenticated: true });
  } else {
    // Token expired or missing - clear and logout
    if (accessToken && isTokenExpired(accessToken)) {
      removeTokens();
      toast.error('Session expired. Please login again.');
    }
    setState({ user: null, isAuthenticated: false });
  }
};
```

---

## How It Works Now

### Before (Broken):
```
1. User logs in → Token valid for 15 minutes
2. After 15 minutes → Token expires
3. User refreshes page
4. App loads from localStorage → isAuthenticated = true ❌
5. User sees the page (but token is expired)
6. Next API call → 401 → Redirect to login
7. Confusing experience! 😞
```

### After (Fixed):
```
1. User logs in → Token valid for 15 minutes
2. After 15 minutes → Token expires
3. User refreshes page
4. App checks token → isTokenExpired(token) = true ✅
5. Clears auth data → removeTokens()
6. Shows toast: "Session expired. Please login again."
7. ProtectedRoute sees isAuthenticated = false
8. Immediately redirects to /login
9. Clear, expected behavior! 😊
```

---

## Token Validation Flow

```
Page Refresh/App Load
        ↓
   Get token from localStorage
        ↓
   Decode JWT token
        ↓
   Extract expiration time (exp)
        ↓
   Compare with current time
        ↓
   ┌──────────────┐
   │  Expired?    │
   └──────┬───────┘
          │
    ┌─────┴─────┐
    ↓           ↓
  YES          NO
    │           │
    │           └→ Set isAuthenticated = true
    │              Show app normally
    │
    └→ Clear tokens
       Show toast: "Session expired"
       Set isAuthenticated = false
       ProtectedRoute redirects to /login
```

---

## Testing

### Test Case 1: Token Expired on Refresh

1. **Login** to the app
2. **Wait 15 minutes** (or manually expire token in localStorage)
3. **Refresh the page** (F5 or Ctrl+R)
4. **Expected:**
   - Toast notification: "Session expired. Please login again."
   - Immediately redirected to `/login`
   - No stuck page!

### Test Case 2: Token Still Valid

1. **Login** to the app
2. **Wait 5 minutes** (less than 15)
3. **Refresh the page**
4. **Expected:**
   - No redirect
   - Stays on current page
   - App works normally

### Test Case 3: Token Expires While Using App

1. **Login** to the app
2. **Stay on a page** without refreshing
3. **Wait 15 minutes**
4. **Make an API call** (create content, etc.)
5. **Expected:**
   - API returns 401
   - Interceptor clears tokens
   - Redirects to `/login`
   - (This was already working)

---

## Files Modified

1. ✅ **`apps/web/src/utils/jwt.ts`** - NEW
   - `decodeToken()` - Decode JWT payload
   - `isTokenExpired()` - Check if token is expired
   - `getTokenExpiryTime()` - Get seconds until expiry

2. ✅ **`apps/web/src/contexts/AuthContext.tsx`** - UPDATED
   - Added token expiry check in `initializeAuth()`
   - Clears tokens if expired on app load
   - Shows toast notification

---

## Security Notes

### Is Client-Side Validation Secure?

**NO!** And it doesn't need to be. Here's why:

**Client-side validation (this fix):**
- ✅ For UX only - improves user experience
- ✅ Avoids stuck pages on refresh
- ✅ Shows clear "session expired" message
- ❌ Can be bypassed (user can modify localStorage)
- ❌ NOT used for authorization decisions

**Server-side validation (already in place):**
- ✅ Real security - server verifies JWT signature
- ✅ Checks expiration on every request
- ✅ Cannot be bypassed
- ✅ Returns 401 if invalid/expired

**Summary:**
- Client-side check = Better UX 😊
- Server-side check = Real security 🔒
- Both together = Best of both worlds! 🎉

---

## Future Enhancements (Optional)

### 1. **Token Refresh**

Implement automatic token refresh before expiry:

```typescript
// Check if token expires in < 2 minutes
const timeUntilExpiry = getTokenExpiryTime(accessToken);
if (timeUntilExpiry < 120 && timeUntilExpiry > 0) {
  // Refresh token automatically
  await refreshAccessToken();
}
```

### 2. **Session Timeout Warning**

Show a countdown before session expires:

```
"Your session will expire in 2 minutes"
[Extend Session] [Logout]
```

### 3. **Remember Login State**

Use refresh token to auto-login on app load if access token expired.

---

## Summary

✅ **Problem:** Page stuck after token expiry on refresh
✅ **Solution:** Validate token on app initialization
✅ **Result:** Immediate redirect to login with clear message
✅ **User Experience:** Much better! No more confusion 🎉

---

## How to Test

1. **Start the app:**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Login** to the app

3. **Manually expire token:**
   - Open DevTools (F12)
   - Go to **Application** tab → **Local Storage**
   - Find `access_token`
   - Edit the expiry in the token (or just delete it)
   - OR wait 15 minutes

4. **Refresh the page** (F5)

5. **Expected result:**
   - Toast: "Session expired. Please login again."
   - Redirected to `/login`

That's it! 🚀
