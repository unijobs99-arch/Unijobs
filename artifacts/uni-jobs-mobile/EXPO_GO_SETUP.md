# Expo Go Local Development Setup

This guide explains how to test the UniJobs mobile app on a physical device using Expo Go.

## Problem Solved

Previously, the app would hang indefinitely during registration because it couldn't reach the API server. This was caused by:
- `EXPO_PUBLIC_DOMAIN` environment variable not being set
- API client falling back to `/api` (relative path)
- Physical phones cannot access development machine's `/api` path

## Solution

The API client now:
- ✅ Requires explicit `EXPO_PUBLIC_DOMAIN` configuration
- ✅ Adds 15-second timeout for network requests
- ✅ Shows clear error messages if server is unreachable
- ✅ Supports both HTTP and HTTPS URLs

## Setup Steps

### 1. Get Your Machine's IP Address

**Windows (PowerShell):**
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.x.x or 10.0.x.x)
```

**Mac/Linux (Terminal):**
```bash
ifconfig
# or
ip addr
# Look for inet address on your network interface (not 127.0.0.1)
```

### 2. Start the Backend API Server

In a terminal, run:
```bash
cd Uni-Jobs-Board
pnpm --filter @workspace/api-server run dev
```

You should see:
```
Server listening { port: 5000 }
```

✅ Backend is now running on `http://YOUR_MACHINE_IP:5000`

### 3. Set Environment Variable for Expo Go

**Option A: Export and Start (Recommended)**

Linux/Mac:
```bash
export EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
pnpm --filter @workspace/uni-jobs-mobile run dev
```

Windows PowerShell:
```powershell
$env:EXPO_PUBLIC_DOMAIN = "192.168.1.100:5000"
pnpm --filter @workspace/uni-jobs-mobile run dev
```

Replace `192.168.1.100` with your actual machine IP.

**Option B: Create .env.local**

In `artifacts/uni-jobs-mobile/`, create `.env.local`:
```
EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
```

Then start:
```bash
pnpm --filter @workspace/uni-jobs-mobile run dev
```

### 4. Open Expo Go on Your Phone

1. Install [Expo Go](https://expo.dev/go) on your iOS or Android device
2. Ensure your phone is on **the same WiFi network** as your development machine
3. Scan the QR code shown in the terminal
4. Wait for the app to load (first load may take 30-60 seconds)

### 5. Test Registration

The app should now load without hanging. Test:

**Worker Registration:**
1. Select language (English/हिन्दी)
2. Tap "Worker"
3. Fill form with test data:
   - Name: John Doe
   - Father's Name: James Doe
   - Phone: 9876543210 (10 digits)
   - Aadhaar: 123456789012 (12 digits)
   - UAN: TEST123
   - Address: Test Address
   - City: Mumbai
   - Education: 12th
   - Experience: 2 years
   - Category: Carpenter
4. Tap "Register"
5. ✅ Should navigate to Worker Dashboard

**Company Registration:**
1. Go back to role selection
2. Tap "Employer"
3. Fill form:
   - Company Name: Acme Corp
   - Owner Name: Jane Smith
   - Email: contact@acme.com
   - Phone: 9876543210
4. Tap "Register"
5. ✅ Should navigate to Company Dashboard

## Error Messages

If registration fails, you'll see clear error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to server. Check if backend is running..." | Backend not running or wrong IP | Start backend with `pnpm --filter @workspace/api-server run dev` |
| "Request timed out after 15s" | Server took too long to respond | Check network connection, backend performance |
| "Set EXPO_PUBLIC_DOMAIN environment variable" | Environment variable not set | See "Set Environment Variable" section above |
| "API not configured" | Development environment not properly set up | Follow setup steps above |

## Debugging

**App is blank after scanning QR:**
- Wait 30-60 seconds for Metro bundler to compile
- Check terminal for bundling progress
- Device and machine must be on same WiFi

**"Cannot find module" errors:**
- Run `pnpm install` in workspace root
- Run `pnpm --filter @workspace/uni-jobs-mobile run typecheck`

**Backend server not responding:**
- Verify backend is running: `curl http://YOUR_MACHINE_IP:5000/health`
- Check MongoDB is running and `MONGODB_URI` env var is set
- Check `ADMIN_SECRET` env var is set

**Phone can't reach machine:**
- Verify same WiFi network
- Check firewall isn't blocking port 5000
- Try pinging machine from phone: `ping 192.168.x.x`
- Restart WiFi on phone and machine

## Network Security

For local development only. **Do not expose:**
- Private IPs on public WiFi
- Development API without authentication
- ADMIN_SECRET in code or public repositories

Use `ngrok` for safe public testing:
```bash
pnpm add -D ngrok-cjs
npx ngrok http 5000
# Use the ngrok URL as EXPO_PUBLIC_DOMAIN
```

## Troubleshooting Hangs

If registration still hangs after setup:

1. **Test backend directly:**
   ```bash
   curl -X POST http://YOUR_MACHINE_IP:5000/api/workers/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","phone":"9876543210",...}'
   ```

2. **Check logs in Expo Go:**
   - Shake device to open dev menu
   - Select "View all logs"

3. **Enable network debugging:**
   - In Expo terminal, press `w` for web debugging
   - Open browser developer tools (F12)
   - Check Network tab for requests

4. **Reset and rebuild:**
   ```bash
   cd artifacts/uni-jobs-mobile
   rm -rf node_modules
   pnpm install
   pnpm --filter @workspace/uni-jobs-mobile run typecheck
   ```

## For Replit Users

Replit automatically sets `EXPO_PUBLIC_DOMAIN` via the dev script. Just run:
```bash
pnpm --filter @workspace/uni-jobs-mobile run dev
```

The `REPLIT_DEV_DOMAIN` will be used automatically.

## For Production / Hosted Backend

Update `EXPO_PUBLIC_DOMAIN` to your production domain:
```bash
EXPO_PUBLIC_DOMAIN=api.yourdomain.com pnpm --filter @workspace/uni-jobs-mobile run dev
```

Or set in `.env.local`:
```
EXPO_PUBLIC_DOMAIN=api.yourdomain.com
```
