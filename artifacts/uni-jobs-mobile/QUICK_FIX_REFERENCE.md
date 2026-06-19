# Registration Bug Fix - Quick Reference

## Problem Fixed ✅
Registration hangs indefinitely in Expo Go on physical devices.

**Root Cause:** `EXPO_PUBLIC_DOMAIN` not set → API falls back to unreachable `/api` path → Fetch hangs forever

## Solution ✅

### What Changed
1. **api.ts** - Added timeout, removed unsafe fallback, better errors
2. **Configuration** - Must set `EXPO_PUBLIC_DOMAIN` environment variable
3. **Setup Guides** - Added `.env.example`, `EXPO_GO_SETUP.md`, setup scripts

### Files Modified
- `artifacts/uni-jobs-mobile/lib/api.ts` - ⭐ Main fix (timeout + error handling)
- `artifacts/uni-jobs-mobile/.env.example` - New template
- `artifacts/uni-jobs-mobile/EXPO_GO_SETUP.md` - New 50+ line guide
- `artifacts/uni-jobs-mobile/setup-expo-local.sh` - Auto-detect IP (Mac/Linux)
- `artifacts/uni-jobs-mobile/setup-expo-local.bat` - Auto-detect IP (Windows)
- `REGISTRATION_BUG_FIX.md` (root) - Complete documentation

## Test in 2 Minutes

### 1. Terminal 1 - Start Backend
```bash
pnpm --filter @workspace/api-server run dev
```
Should see: `Server listening { port: 5000 }`

### 2. Terminal 2 - Start Expo (replace IP with your machine)
```bash
# Mac/Linux
export EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
pnpm --filter @workspace/uni-jobs-mobile run dev

# Windows PowerShell
$env:EXPO_PUBLIC_DOMAIN = "192.168.1.100:5000"
pnpm --filter @workspace/uni-jobs-mobile run dev
```

### 3. Scan QR in Expo Go App
- Open Expo Go on physical device
- Same WiFi network as machine
- Scan QR code from terminal

### 4. Test Registration
- Select language
- Tap "Worker" or "Employer"
- Fill form, tap Register
- ✅ Should navigate to dashboard or show error (not hang)

## API Endpoints Now Reachable

| Flow | Before | After |
|------|--------|-------|
| Worker Registration | `/api/workers/register` ❌ | `https://192.168.1.100:5000/api/workers/register` ✅ |
| Worker Login | `/api/workers/login` ❌ | `https://192.168.1.100:5000/api/workers/login` ✅ |
| Company Registration | `/api/companies/register` ❌ | `https://192.168.1.100:5000/api/companies/register` ✅ |
| Company Login | `/api/companies/login` ❌ | `https://192.168.1.100:5000/api/companies/login` ✅ |

## New Features

✅ **15-second timeout** - No more infinite hangs
✅ **Clear error messages** - Users see what's wrong
✅ **Automatic IP detection** - setup-expo-local scripts find your IP
✅ **.env.example** - Developers know what to configure
✅ **Comprehensive guide** - 50+ line setup documentation

## Error Examples (Now Shown Immediately)

```
❌ "API not configured. Set EXPO_PUBLIC_DOMAIN environment variable."
   → Solution: Export or set env var

❌ "Cannot connect to server. Check if backend is running..."
   → Solution: Start backend server

❌ "Request timed out after 15s. Cannot connect to server..."
   → Solution: Check network, IP address, firewall

❌ "Cannot connect to server. Check network connection..."
   → Solution: Verify same WiFi network, firewall rules
```

## Configuration Locations

Set `EXPO_PUBLIC_DOMAIN` in one of these ways:

**Option 1: Export before running (Recommended)**
```bash
export EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
pnpm --filter @workspace/uni-jobs-mobile run dev
```

**Option 2: .env.local file**
Create `artifacts/uni-jobs-mobile/.env.local`:
```
EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
```

**Option 3: Use setup script (Auto-detects IP)**
```bash
# Mac/Linux
./artifacts/uni-jobs-mobile/setup-expo-local.sh

# Windows
artifacts/uni-jobs-mobile/setup-expo-local.bat
```

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Machine IP in `EXPO_PUBLIC_DOMAIN` (e.g., 192.168.1.100:5000)
- [ ] Phone on same WiFi network
- [ ] Expo Go app scans QR code
- [ ] App loads without hanging
- [ ] Worker registration completes or shows error
- [ ] Company registration completes or shows error
- [ ] Dashboard navigation works after registration

## Troubleshooting (30 seconds)

| Issue | Check |
|-------|-------|
| App blank after QR scan | Wait 30-60s for bundler, check terminal |
| "Cannot connect" error | `curl http://YOUR_IP:5000/health` |
| EXPO_PUBLIC_DOMAIN not set | Check `echo $EXPO_PUBLIC_DOMAIN` |
| Phone can't reach machine | Same WiFi? Check firewall. Try ping. |
| Still hangs | See `REGISTRATION_BUG_FIX.md` detailed troubleshooting |

## Full Documentation

See `REGISTRATION_BUG_FIX.md` for:
- Complete root cause analysis
- Detailed setup guide with screenshots
- Network troubleshooting
- Production deployment guidance

---

**Status:** ✅ Ready to test - Registration hangs are fixed!
