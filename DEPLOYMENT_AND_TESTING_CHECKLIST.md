# UniJobs - Deployment & Testing Checklist

## BACKEND DEPLOYMENT CHECKLIST

### Pre-Deployment

#### Environment Setup
- [ ] Node.js 18+ installed
- [ ] npm or pnpm available
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster deployed
- [ ] Collection names verified:
  - [ ] `workers`
  - [ ] `companies`
  - [ ] `requirements`

#### Code Verification
- [ ] Run `pnpm typecheck` - should pass with no errors
- [ ] Run `pnpm build` - should generate dist/ folder
- [ ] Verify no console.log() in production code
- [ ] Review env vars needed:
  ```
  MONGODB_URI=mongodb+srv://...
  ADMIN_SECRET=your-secure-secret-here
  NODE_ENV=production
  ```

### Deployment (Replit/Heroku/VPS)

#### Database
```bash
# MongoDB Atlas
1. Create cluster (free tier ok for pilot)
2. Create database user
3. Add IP whitelist (0.0.0.0/0 for pilot, restrict for production)
4. Get connection string
```

#### Environment Variables
```bash
# Set these in deployment platform
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/unijobs"
ADMIN_SECRET="generate-random-32-char-secret"
NODE_ENV="production"
PORT="3000"  # or whatever port your platform uses
EXPO_PUBLIC_DOMAIN="your-api-domain.com"
```

- [ ] Create `.env.example` in the repository root to document required variables.

#### Test Connectivity
```bash
# After deployment, test health endpoint
curl https://your-api.replit.dev/api/healthz
# Expected response: { "status": "healthy" }
```

### Post-Deployment

- [ ] Health check passes
- [ ] API is accessible from internet
- [ ] CORS configured (currently allows all)
- [ ] Rate limiting (if applicable)
- [ ] Error logging working
- [ ] Database connection verified

---

## MOBILE APP DEPLOYMENT CHECKLIST

### Build Configuration

#### app.json Setup
```json
{
  "name": "Uni Jobs",
  "slug": "uni-jobs",
  "version": "1.0.0",
  "description": "Job marketplace for warehouse workers",
  "owner": "unijobs-cto",
  "runtimeVersion": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "userInterfaceStyle": "light",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#FFFFFF"
  },
  "updates": {
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/YOUR_PROJECT_ID"
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "supportsTabletMode": false,
    "infoPlist": {
      "NSLocalNetworkUsageDescription": "This app needs access to your network",
      "NSBonjourServices": [
        "_http._tcp",
        "_https._tcp"
      ]
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#FFFFFF"
    },
    "versionCode": 1,
    "package": "com.unijobs.app",
    "useNextNotificationApi": true
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "plugins": [
    [
      "expo-image-picker",
      {
        "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
      }
    ]
  ]
}
```

**Action Items**:
- [ ] Create icon image (1024x1024 PNG)
- [ ] Create splash screen (1170x2532 PNG)
- [ ] Create adaptive icon (foreground + background)
- [ ] Update package name to `com.unijobs.app`
- [ ] Set owner to your Expo account
- [ ] Generate EAS project (if using managed build)

#### Environment Setup
```bash
# .env.production
EXPO_PUBLIC_DOMAIN=api.unijobs.domain.com  # Update this!

# .env.development
EXPO_PUBLIC_DOMAIN=localhost:3000  # For local testing
```

- [ ] .env.production created
- [ ] .env.development created
- [ ] EXPO_PUBLIC_DOMAIN verified to match deployed API

### Build Generation

#### Option A: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

**Requirements**:
- [ ] Expo account created
- [ ] EAS CLI installed
- [ ] App configured in Expo dashboard

#### Option B: Local Build
```bash
# Install dependencies
pnpm install

# Generate APK locally
expo build:android --release-channel production
```

**Requirements**:
- [ ] Java SDK installed
- [ ] Android SDK tools available
- [ ] At least 8GB RAM available
- [ ] 30+ minutes build time

### Pre-Launch Testing

#### Device Testing
- [ ] Install APK on Android device (SDK 24+)
- [ ] Install on iOS device (if applicable)
- [ ] Grant required permissions:
  - [ ] Camera (image picker)
  - [ ] Photo library (image picker)
  - [ ] Network access

#### Functionality Testing
```
Registration Flow:
  [ ] Worker can register with valid phone (10 digits)
  [ ] Error shown for invalid phone
  [ ] Error shown for duplicate phone
  [ ] Aadhaar masked after registration (****XXXX)
  [ ] Worker appears in search after registration
  
Login Flow:
  [ ] Can login with phone number
  [ ] Error shown for non-existent phone
  [ ] Correct worker data displayed after login
  
Company Registration:
  [ ] Can register with email
  [ ] Error shown for invalid email
  [ ] Error shown for duplicate email/phone
  [ ] Shows "Pending" status until approved
  
Admin Approval:
  [ ] Admin can login with secret
  [ ] Can see all companies
  [ ] Can approve company
  [ ] Approved company status updates
  [ ] Approved company can search workers
  
Worker Search:
  [ ] Can search by category
  [ ] Can search by city
  [ ] Only shows available workers
  [ ] Worker profile displays all fields
  [ ] Aadhaar shows masked
  
Availability Toggle:
  [ ] Worker can toggle availability
  [ ] Status badge updates immediately
  [ ] Company search reflects changes
  [ ] Status persists after logout/login
  
Job Posting:
  [ ] Approved company can post job
  [ ] Job appears in worker's requirements list
  [ ] Can post multiple jobs
  [ ] Job shows correct category/city
```

#### API Connectivity
- [ ] Can reach API health endpoint
- [ ] API responses < 2 seconds
- [ ] Error messages display correctly
- [ ] Network timeout handled gracefully

#### Device Compatibility
- [ ] Works on 5.5" screen (min)
- [ ] Works on 6.5" screen (max)
- [ ] Works in portrait orientation
- [ ] Landscape mode not required
- [ ] Dark mode not required

---

## PILOT USER TESTING PROTOCOL

### Test Participant Setup

#### Worker Testers (5 people)

**Assignment**:
```
Worker 1: 9876543210, Picker, Bangalore
Worker 2: 8765432109, Scanner, Mumbai
Worker 3: 7654321098, Delivery, Delhi
Worker 4: 6543210987, Packing, Hyderabad
Worker 5: 5432109876, Warehouse Helper, Pune
```

**Aadhaar Numbers** (use sequential for testing):
```
Worker 1: 111111111111
Worker 2: 222222222222
Worker 3: 333333333333
Worker 4: 444444444444
Worker 5: 555555555555
```

**Pre-Pilot Brief**:
- [ ] Explain system has NO authentication (test-only)
- [ ] Explain availability toggle feature
- [ ] Show where to find their profile
- [ ] Show how to search for jobs
- [ ] Give test data (phone number, credentials)

#### Company Testers (2 people)

**Assignment**:
```
Company 1: Contact: Raj Kumar
  Email: company1@test.com
  Phone: 9900112233
  Company Name: ABC Logistics
  
Company 2: Contact: Priya Singh
  Email: company2@test.com
  Phone: 9900112244
  Company Name: XYZ Warehousing
```

**Pre-Pilot Brief**:
- [ ] Explain approval workflow
- [ ] Show how to search for workers
- [ ] Show how to post jobs
- [ ] Explain availability filter
- [ ] Provide registration details

#### Admin Tester (1 person)

**Admin Secret**: `pilot-secret-12345-change-after`

**Pre-Pilot Brief**:
- [ ] Show admin dashboard access
- [ ] Show company approval process
- [ ] Show worker management
- [ ] Request to NOT approve companies until workers are registered

---

## TESTING SCENARIOS

### Scenario 1: Worker Registration & Search

**Duration**: 10 minutes  
**Participants**: 2 workers, 1 admin

**Steps**:
1. Worker 1 downloads APK and installs
2. Worker 1 opens app → sees splash screen
3. Worker 1 registers with assigned phone number
4. Worker 1 sees profile with Aadhaar masked
5. Worker 1 toggles availability (verify status changes)
6. Worker 1 logs out
7. Worker 1 logs back in → sees saved profile

**Success Criteria**:
- ✅ Registration completes without errors
- ✅ Aadhaar displays as ****XXXX
- ✅ Availability toggle works
- ✅ Data persists across logout/login

### Scenario 2: Company Approval & Job Search

**Duration**: 15 minutes  
**Participants**: 2 companies, 1 admin, all workers registered

**Steps**:
1. Company 1 registers with email
2. Company 1 sees "Pending" status
3. Company 1 tries to search workers → error "Not approved"
4. Admin logs in, approves Company 1
5. Company 1 refreshes → sees "Approved" status
6. Company 1 searches for Picker category in Bangalore
7. Company 1 sees Worker 1 in results (only available workers)
8. Company 1 clicks Worker 1 → sees full profile

**Success Criteria**:
- ✅ Pending status blocks access
- ✅ Admin approval updates status immediately
- ✅ Only available workers shown
- ✅ Worker profile displays correctly

### Scenario 3: Job Posting

**Duration**: 10 minutes  
**Participants**: 1 company, all workers

**Steps**:
1. Company 1 (approved) posts job:
   - Title: "Logistics Coordinator"
   - Category: Picker
   - City: Bangalore
   - Vacancies: 3
2. All workers log in → see job in "Requirements" tab
3. Worker 2 (same city, different category) checks requirements
4. Worker 2 should NOT see the job (category filter in future)

**Success Criteria**:
- ✅ Job posts successfully
- ✅ All workers can see posted jobs
- ✅ Job shows correct company name
- ✅ Job shows correct category/city

### Scenario 4: Availability Toggle

**Duration**: 10 minutes  
**Participants**: 2 workers, 1 company

**Steps**:
1. Worker 1 sets availability to "Not Available"
2. Company 1 searches for workers
3. Worker 1 does NOT appear in search
4. Worker 2 is still "Available" → appears in search
5. Worker 1 sets availability back to "Available"
6. Worker 1 now appears in search again

**Success Criteria**:
- ✅ Toggle updates status immediately
- ✅ Search results reflect availability
- ✅ Other workers unaffected
- ✅ Status persists across sessions

### Scenario 5: Error Handling

**Duration**: 10 minutes  
**Participants**: 1 person

**Steps**:
1. Try to register with invalid phone (5 digits) → error shown
2. Try to register with duplicate phone → error shown
3. Try to register with invalid Aadhaar (11 digits) → error shown
4. Try to register company with invalid email → error shown
5. Try to post job with 0 vacancies → error shown
6. Try to access API without network → graceful error

**Success Criteria**:
- ✅ All error messages are clear
- ✅ App doesn't crash on errors
- ✅ User can retry after error

---

## DAILY PILOT MONITORING

### Metrics to Track

**Registration**:
```
Day 1: [ ] Total workers: 5
       [ ] Total companies: 2
       [ ] Admin verified: 1
```

**Activity**:
```
Daily: [ ] Worker searches
       [ ] Company searches
       [ ] Job postings
       [ ] Profile updates
       [ ] Availability toggles
```

**Errors**:
```
[ ] Crash logs (check app logs)
[ ] API errors (check server logs)
[ ] Data integrity issues
[ ] User reported issues
```

### Daily Standup (5 minutes)
```
Each day ask testers:
1. Any app crashes?
2. Any confusing flows?
3. Any data issues?
4. Feature requests?
```

### Server Monitoring
```bash
# Check logs
tail -f server-logs.txt | grep ERROR

# Check database
# Connect to MongoDB Atlas
# Verify:
  - [ ] No duplicate records
  - [ ] All required fields present
  - [ ] Status values correct
  - [ ] Availability values correct
```

---

## POST-PILOT ACTIONS

### After 1 Week

**Analysis**:
- [ ] Collect all feedback
- [ ] Review crash logs
- [ ] Verify data integrity
- [ ] Count successful workflows

**Report**:
- [ ] Prepare findings document
- [ ] Create issue backlog
- [ ] Prioritize next features
- [ ] Plan Phase 2

**Cleanup**:
- [ ] Change admin secret
- [ ] Archive test data
- [ ] Document lessons learned
- [ ] Thank testers

### Decision Points

**GO for Public Beta if**:
- ✅ No critical crashes
- ✅ All core workflows successful
- ✅ Data integrity verified
- ✅ User feedback positive

**Needs Fixes if**:
- ❌ Critical issues found
- ❌ Data loss occurred
- ❌ Core workflows broken
- ❌ Major UX confusion

---

## DEBUGGING CHECKLIST

### If App Crashes

```typescript
// Check error boundary logs
// Error logs go to console
// On device:
// 1. Open Expo app
// 2. Find your project
// 3. View logs
// 4. Screenshot and report
```

### If API Not Responding

```bash
# Test connectivity
curl -X GET https://your-api.com/api/healthz

# If fails:
1. Check MongoDB connection
2. Verify MongoDB_URI env var
3. Check firewall/IP whitelist
4. Check API server logs
5. Verify domain DNS resolves
```

### If Registration Fails

```
Check server logs for:
- [ ] Validation errors (check error message)
- [ ] Duplicate key error (already registered)
- [ ] Database connection error
- [ ] Invalid data

Fix:
- [ ] Use valid phone (10 digits)
- [ ] Use unique Aadhaar (12 digits)
- [ ] Wait 5 seconds and retry
- [ ] Clear app cache and try again
```

### If Worker Doesn't Appear in Search

```
Check:
1. Is worker registered? (check admin panel)
2. Is worker available? (check status in profile)
3. Is company approved? (check admin panel)
4. Is search filter correct? (category/city match)
5. Did you refresh the search? (pull to refresh)
```

---

## ROLLBACK PLAN

**If Critical Issue Found**:
1. Immediately stop pilot activities
2. Document exact issue and reproduction steps
3. Disable affected feature (if possible)
4. Fix in code
5. Re-test locally
6. Deploy fix
7. Resume pilot

**If Data Corruption**:
1. Restore from MongoDB backup (if available)
2. Identify cause
3. Add validation to prevent future occurrence
4. Re-test with clean data

---

**Pilot Launch Target Date**: June 5, 2026  
**Pilot Duration**: 1-2 weeks  
**Post-Pilot Analysis**: June 15, 2026  
**Phase 2 Planning**: June 20, 2026

