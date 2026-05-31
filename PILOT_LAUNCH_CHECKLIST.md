# UniJobs - Pilot Launch Checklist

**Status**: Ready to Begin ✅  
**Target Launch**: Within 1 week  
**Pilot Duration**: 1-2 weeks  

---

## PRE-LAUNCH: BACKEND SETUP (2-3 days)

### Infrastructure Deployment

- [ ] **Choose Deployment Platform**
  - [ ] Option A: Replit (recommended - auto HTTPS)
  - [ ] Option B: AWS + CloudFront (SSL certificate)
  - [ ] Option C: Heroku (deprecated but still works)
  - [ ] Decision: _______________

- [ ] **Create Production Database**
  - [ ] MongoDB Atlas account created
  - [ ] Cluster provisioned (free tier OK)
  - [ ] Database user created
  - [ ] IP whitelist configured (0.0.0.0/0 for pilot)
  - [ ] Connection string: `mongodb+srv://...`

- [ ] **Deploy API**
  - [ ] Push code to GitHub/GitLab
  - [ ] Import into Replit (or deploy to AWS)
  - [ ] Set environment variables:
    - [ ] `MONGODB_URI=mongodb+srv://...`
    - [ ] `ADMIN_SECRET=` (generate random 32 chars)
    - [ ] `NODE_ENV=production`

- [ ] **Verify Deployment**
  - [ ] `curl https://[api-domain]/api/healthz`
  - [ ] Response: `{"status":"ok"}` ✅
  - [ ] Database connection working
  - [ ] HTTPS enabled and valid certificate

### Backend Validation

- [ ] **Test Health Endpoint**
  ```bash
  curl https://your-api.replit.dev/api/healthz
  # Should return: {"status":"ok"}
  ```

- [ ] **Test Worker Registration**
  ```bash
  curl -X POST https://your-api/api/workers/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Worker",
      "fatherName": "Father",
      "phone": "9876543210",
      "aadhaar": "123456789012",
      "uan": "UAN123",
      "address": "123 Main St",
      "city": "Mumbai",
      "education": "12th Pass",
      "experience": "2 years",
      "category": "Picker"
    }'
  # Should return: 201 Created
  ```

- [ ] **Test Duplicate Prevention**
  ```bash
  # Register same worker again
  # Should return: 409 Conflict
  # Error: "Phone already registered"
  ```

- [ ] **Test Company Registration**
  ```bash
  curl -X POST https://your-api/api/companies/register \
    -H "Content-Type: application/json" \
    -d '{
      "companyName": "Test Corp",
      "ownerName": "Owner",
      "email": "company@test.com",
      "phone": "9876543211"
    }'
  # Should return: 201 Created
  ```

---

## PRE-LAUNCH: MOBILE APP (2-4 days)

### Build Configuration

- [ ] **Setup Environment Variables**
  - [ ] Create `.env.production` file
  - [ ] Set `EXPO_PUBLIC_DOMAIN=your-deployed-api.com`
  - [ ] Example: `EXPO_PUBLIC_DOMAIN=unijobs-api.replit.dev`

- [ ] **Update app.json** (optional for pilot)
  - [ ] Verify version is `1.0.0`
  - [ ] Check package name is `com.unijobs.app`
  - [ ] Verify orientation is `portrait`

- [ ] **Build APK**
  ```bash
  cd artifacts/uni-jobs-mobile
  EXPO_PUBLIC_DOMAIN=your-api.replit.dev expo build:android -t apk
  # Wait for build... (5-10 minutes)
  # Download .apk file (~40-50MB)
  ```

### Device Testing

- [ ] **Install on Test Device 1**
  - [ ] Device model: _______________
  - [ ] Android version: _______________
  - [ ] Via: `adb install app.apk` or direct download

- [ ] **Install on Test Device 2**
  - [ ] Device model: _______________
  - [ ] Android version: _______________
  - [ ] Reason: Test on different screen size

- [ ] **Test Worker Workflow**
  - [ ] Open app → See role selection screen
  - [ ] Select "Worker"
  - [ ] Click "Register"
  - [ ] Enter test data:
    - Name: `Test Worker`
    - Father Name: `Father`
    - Phone: `9876543210` (unique)
    - Aadhaar: `123456789012`
    - UAN: `UAN123`
    - Address: `123 Main St`
    - City: `Mumbai`
    - Education: `12th Pass`
    - Experience: `2 years`
    - Category: `Picker`
  - [ ] Submit → Should succeed (201)
  - [ ] See dashboard with profile
  - [ ] Verify Aadhaar masked (****6789)
  - [ ] Click availability toggle → Status changes
  - [ ] Logout → Login with same phone
  - [ ] Verify availability persisted

- [ ] **Test Company Workflow**
  - [ ] Select "Company"
  - [ ] Click "Register"
  - [ ] Enter test data:
    - Company Name: `Test Company`
    - Owner Name: `Owner`
    - Email: `company@test.com` (unique)
    - Phone: `9876543211`
  - [ ] Submit → Should succeed
  - [ ] See "Pending Approval" message
  - [ ] **Use admin screen to approve**
  - [ ] Refresh → Now see search tab
  - [ ] Search for workers → Should find test workers
  - [ ] Click "Post Job"
  - [ ] Enter job details:
    - Title: `Picker - Full Time`
    - Description: `Pick items from shelf`
    - Category: `Picker`
    - City: `Mumbai`
    - Vacancies: `5`
  - [ ] Submit → Should succeed

- [ ] **Test Language Switching**
  - [ ] Find language selector
  - [ ] Switch to Hindi
  - [ ] Verify all text changes
  - [ ] Switch back to English

- [ ] **Test Error Handling**
  - [ ] Try registering with invalid phone (abc)
  - [ ] Should show: "Phone must be 10 digits"
  - [ ] Try registering with 11-digit phone
  - [ ] Should show: "Phone must be 10 digits"
  - [ ] Try registering with duplicate phone
  - [ ] Should show: "Phone number already registered"

### Network Testing

- [ ] **Test on WiFi**
  - [ ] All functionality works
  - [ ] No connection timeouts

- [ ] **Test on Cellular**
  - [ ] All functionality works
  - [ ] Slightly slower but acceptable

- [ ] **Test Offline Behavior**
  - [ ] Put phone in airplane mode
  - [ ] Try to register
  - [ ] Should show error: Cannot connect
  - [ ] Exit airplane mode
  - [ ] Try again → Should work

---

## PRE-LAUNCH: ADMIN SETUP (1 day)

### Admin Credentials

- [ ] **Generate Secure Admin Secret**
  - [ ] Use password generator
  - [ ] Minimum 32 characters
  - [ ] Include uppercase, lowercase, numbers, symbols
  - [ ] Example: `Xk9$mPqL2@vW5tYn!zB3cD7eF4gH6iJ1`
  - [ ] Secret: _______________

- [ ] **Store Secret Securely**
  - [ ] Password manager (1Password, LastPass, etc.)
  - [ ] DO NOT: Email, Slack, plain text file
  - [ ] Access: Only admin person

- [ ] **Set in Deployment**
  - [ ] Add to Replit Secrets: `ADMIN_SECRET=...`
  - [ ] Restart API
  - [ ] Verify still works

### Admin Testing

- [ ] **Access Admin Screen**
  - [ ] Open mobile app
  - [ ] Navigate to admin (if available)
  - [ ] Or: Set session in AsyncStorage
  - [ ] Enter admin secret

- [ ] **Test Admin Functions**
  - [ ] View all companies (pending + approved)
  - [ ] Approve a company (status: pending → approved)
  - [ ] Reject a company (status: pending → rejected)
  - [ ] View all workers
  - [ ] Verify data appears correctly

- [ ] **Monitor Admin Actions**
  - [ ] Check API logs for admin requests
  - [ ] Verify authentication working

---

## PRE-LAUNCH: TESTER BRIEFING (1 day)

### Create Test Plan Document

- [ ] **Generate Test IDs**
  - [ ] Worker 1 Phone: `9876543210` (Picker, Mumbai)
  - [ ] Worker 2 Phone: `9876543211` (Scanner, Delhi)
  - [ ] Worker 3 Phone: `9876543212` (Delivery, Bangalore)
  - [ ] Worker 4 Phone: `9876543213` (Packing, Pune)
  - [ ] Worker 5 Phone: `9876543214` (Warehouse Helper, Hyderabad)
  - [ ] Company 1 Email: `company1@test.com` (Warehouse Ops)
  - [ ] Company 2 Email: `company2@test.com` (Logistics)
  - [ ] Admin Secret: [From previous step]

- [ ] **Create User Guide**
  - [ ] How to install APK
  - [ ] How to register as worker
  - [ ] How to register as company
  - [ ] How to toggle availability
  - [ ] How to post jobs
  - [ ] How to search workers

- [ ] **Document Known Limitations**
  - [ ] "User impersonation: Anyone with phone number can access account"
  - [ ] "No password protection: This is test-only"
  - [ ] "Aadhaar stored in plain text: Masked in UI for privacy"

- [ ] **Communication Plan**
  - [ ] Send APK download link
  - [ ] Send test IDs
  - [ ] Send user guide
  - [ ] Send troubleshooting contact info

### Brief Each Tester

- [ ] **Worker Testers (5 people)**
  - [ ] Each gets unique phone number
  - [ ] Instructed to register only once
  - [ ] Explained availability toggle feature
  - [ ] Encouraged to provide feedback

- [ ] **Company Testers (2 people)**
  - [ ] Each gets unique email
  - [ ] Explained approval workflow
  - [ ] Explained job posting
  - [ ] Encouraged to try searching/posting

- [ ] **Admin Tester (1 person)**
  - [ ] Given admin secret
  - [ ] Instructed on secret security
  - [ ] Shown how to approve companies
  - [ ] Asked to monitor for issues

---

## LAUNCH DAY: EXECUTION (1 day)

### Morning: Final Checks

- [ ] **API Still Responding**
  ```bash
  curl https://your-api/api/healthz
  # Should return: {"status":"ok"}
  ```

- [ ] **Database Accessible**
  - [ ] Connect to MongoDB Atlas
  - [ ] Verify collections exist
  - [ ] Verify indexes created

- [ ] **APK Ready**
  - [ ] Downloaded
  - [ ] File size: ~40-50MB
  - [ ] Checksum verified

- [ ] **Admin Secret**
  - [ ] Stored securely
  - [ ] Access ready
  - [ ] Backup copy (encrypted)

### Noon: Distribute APK

- [ ] **Send to Testers**
  - [ ] Via Google Drive / WeTransfer / Email
  - [ ] Include installation instructions
  - [ ] Include test IDs and guide

- [ ] **Answer Questions**
  - [ ] Monitor email/chat for issues
  - [ ] Be ready to help with installation

### Afternoon: First Hour Monitoring

- [ ] **Monitor API Logs**
  - [ ] Check for registration attempts
  - [ ] Check for errors
  - [ ] Verify database updates

- [ ] **Monitor Device Performance**
  - [ ] Check for crashes
  - [ ] Monitor battery usage
  - [ ] Monitor network usage

- [ ] **Quick Triage**
  - [ ] Is APK installing?
  - [ ] Can users register?
  - [ ] Can they login?
  - [ ] Are availability changes working?

---

## PILOT WEEK 1: DAILY MONITORING

### Daily Stand-ups (5 minutes)

- [ ] **Every Morning**
  - [ ] Check API logs for errors
  - [ ] Check crash logs
  - [ ] Respond to tester messages
  - [ ] Update issue list

- [ ] **Issues Tracker**
  - [ ] User can't install APK
  - [ ] User can't register
  - [ ] Registration succeeds but can't login
  - [ ] Availability toggle doesn't work
  - [ ] App keeps crashing
  - [ ] Can't find workers to search
  - [ ] Can't post jobs

### Daily Deliverables

- [ ] **Log Check**
  - [ ] Analyze API request/response patterns
  - [ ] Identify any failed requests
  - [ ] Verify all validations working

- [ ] **Feature Verification**
  - [ ] Workers registered: ____ (target: 5)
  - [ ] Companies registered: ____ (target: 2)
  - [ ] Companies approved: ____ (target: 2)
  - [ ] Availability toggles: ____ (target: 5+)
  - [ ] Jobs posted: ____ (target: 2+)
  - [ ] Search attempts: ____

- [ ] **Issue Log**
  - [ ] Any crashes?
  - [ ] Any data integrity issues?
  - [ ] Any API errors?
  - [ ] Any UX problems?

### Weekly Summary (End of Week 1)

- [ ] **Compile Findings**
  - [ ] What worked well?
  - [ ] What problems occurred?
  - [ ] What feedback did testers give?
  - [ ] Any critical bugs?

- [ ] **Action Items**
  - [ ] Generate list of Priority 2 fixes
  - [ ] Estimate effort for each
  - [ ] Plan timeline

---

## PILOT WEEK 2: FEEDBACK & ITERATION

### Tester Feedback

- [ ] **Collect Feedback**
  - [ ] "What did you like about the app?"
  - [ ] "What was confusing?"
  - [ ] "What features do you want?"
  - [ ] "Any bugs or crashes?"
  - [ ] "Would you use this in production?"

- [ ] **Document Feedback**
  - [ ] Create feedback summary
  - [ ] Prioritize by frequency/impact

### Bug Fixes

- [ ] **Identify Bugs**
  - [ ] Any crashes in logs?
  - [ ] Any data issues?
  - [ ] Any validation failures?

- [ ] **Quick Fixes** (if needed)
  - [ ] Fix critical bugs
  - [ ] Redeploy API
  - [ ] Rebuild APK
  - [ ] Test on device

### Final Assessment

- [ ] **Validate Success Criteria**
  - [ ] ✅ Zero unhandled crashes
  - [ ] ✅ All workflows complete
  - [ ] ✅ No data corruption
  - [ ] ✅ Tester feedback positive
  - [ ] ✅ Availability feature works
  - [ ] ✅ Security incidents: 0

- [ ] **Decision**
  - [ ] ✅ Pilot successful → Plan production launch
  - [ ] ⚠️ Issues found → Iterate or continue

---

## POST-PILOT: PREPARATION FOR PRODUCTION (Weeks 3-5)

### Security Hardening Priority 1

- [ ] **Implement Authentication** (Weeks 1-2)
  - [ ] Device binding or OTP-less login
  - [ ] Session tokens instead of user ID
  - [ ] Test thoroughly before launch

- [ ] **Admin Account System**
  - [ ] Replace single secret with email/password
  - [ ] Implement session tokens
  - [ ] Add audit logging

### Feature Enhancements

- [ ] **Pagination** (Week 2)
  - [ ] Add limit/offset to API
  - [ ] Update mobile app
  - [ ] Test with 100+ workers

- [ ] **Encryption** (Weeks 2-3)
  - [ ] Encrypt Aadhaar at rest
  - [ ] Encrypt UAN at rest
  - [ ] Add TLS to all communication

### Operations Setup

- [ ] **Monitoring** (Week 3)
  - [ ] Setup error tracking (Sentry)
  - [ ] Setup performance monitoring
  - [ ] Setup alerting

- [ ] **Admin Dashboard** (Week 4)
  - [ ] Create web-based admin panel
  - [ ] Workers management
  - [ ] Companies management
  - [ ] Analytics dashboard

---

## SUCCESS CHECKLIST

### Pilot Success = All items ✅

- [ ] ✅ Zero crashes during 1-2 week pilot
- [ ] ✅ All 5 workers registered successfully
- [ ] ✅ Both companies registered successfully
- [ ] ✅ At least 1 company approved
- [ ] ✅ At least 5 availability toggles performed
- [ ] ✅ At least 2 jobs posted
- [ ] ✅ At least 1 company searched and found workers
- [ ] ✅ Aadhaar properly masked in UI
- [ ] ✅ Language switching works (English/Hindi)
- [ ] ✅ Data integrity maintained (no duplicates)
- [ ] ✅ Error messages clear and helpful
- [ ] ✅ Tester feedback mostly positive
- [ ] ✅ No security incidents in controlled environment
- [ ] ✅ API responsive (<100ms average)
- [ ] ✅ Mobile app stable and responsive

### Production Launch = Pilot + These items ✅

- [ ] ✅ Proper authentication implemented
- [ ] ✅ Admin account system working
- [ ] ✅ Sensitive data encrypted at rest
- [ ] ✅ HTTPS enforced
- [ ] ✅ Error tracking (Sentry) setup
- [ ] ✅ Monitoring and alerting active
- [ ] ✅ Audit logging implemented
- [ ] ✅ Admin dashboard operational
- [ ] ✅ Rate limiting configured
- [ ] ✅ Backup/restore tested

---

## EMERGENCY CONTACTS

**API Down / Critical Issue**:
- Backend Engineer: _______________
- Phone: _______________
- Email: _______________

**Mobile App Issue**:
- Mobile Engineer: _______________
- Phone: _______________
- Email: _______________

**Database Issue**:
- DevOps / Database: _______________
- Phone: _______________
- Email: _______________

**Admin Issue**:
- CTO / Product: _______________
- Phone: _______________
- Email: _______________

---

## USEFUL COMMANDS

### API Testing
```bash
# Health check
curl https://your-api/api/healthz

# Register worker
curl -X POST https://your-api/api/workers/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","fatherName":"Father",...}'

# Login worker
curl https://your-api/api/workers/login?phone=9876543210

# Update worker availability
curl -X PUT https://your-api/api/workers/{id}/availability \
  -H "Content-Type: application/json" \
  -d '{"availability":"notAvailable"}'
```

### Mobile Build
```bash
# Full build
cd artifacts/uni-jobs-mobile
EXPO_PUBLIC_DOMAIN=your-api.com expo build:android -t apk

# Development
EXPO_PUBLIC_DOMAIN=localhost:3000 pnpm dev
```

### Database Access
```bash
# MongoDB Atlas - Connection String
mongodb+srv://username:password@cluster.mongodb.net/unijobs
```

### Deployment Verification
```bash
# Replit
https://[project-name].replit.dev/api/healthz

# AWS CloudFront
https://[domain].cloudfront.net/api/healthz
```

---

**Checklist Version**: 1.0  
**Last Updated**: May 31, 2026  
**Status**: Ready to Execute ✅

