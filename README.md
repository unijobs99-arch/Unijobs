# UniJobs MVP

A mobile-first workforce hiring platform that connects workers and employers through a simple approval-based recruitment system.

## Overview

UniJobs helps employers discover workers and allows workers to register their profiles for job opportunities. Companies must be approved by an administrator before accessing worker data, creating a controlled and trusted hiring environment.

## Features

### Workers

* Register worker profile
* Login using phone number
* Edit profile information
* View available job requirements

### Companies

* Register company profile
* Login using email
* Search workers by category and city
* Post job requirements
* View previously posted jobs

### Admin

* Secure admin access
* Approve or reject companies
* View registered workers
* Manage company status

### Multi-Language Support

* English
* Hindi

## Tech Stack

### Mobile App

* Expo React Native
* TypeScript
* React Navigation
* AsyncStorage

### Backend

* Express.js
* TypeScript
* Node.js

### Database

* MongoDB Atlas
* Mongoose

## Project Structure

```text
Uni-Jobs-Board/
├── artifacts/
│   ├── api-server/
│   └── uni-jobs-mobile/
├── lib/
├── scripts/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Core Workflows

### Worker Flow

1. Register profile
2. Login using phone number
3. Update profile information
4. View available job requirements

### Company Flow

1. Register company
2. Await admin approval
3. Login using email
4. Search workers
5. Post job requirements

### Admin Flow

1. Login with admin secret
2. Review companies
3. Approve or reject registrations
4. Monitor worker database

## API Features

### Workers

* Register worker
* Login by phone number
* View profile
* Update profile

### Companies

* Register company
* Login by email
* Search workers
* View company profile

### Requirements

* Create requirement
* View requirements
* View company requirements

### Admin

* Company approval
* Company rejection
* Worker management

## Environment Variables

Backend requires:

```env
MONGODB_URI=
ADMIN_SECRET=
PORT=4001
```

## Local Development

### Install Dependencies

```bash
pnpm install
```

### Start Backend

```bash
pnpm --filter @workspace/api-server start
```

### Start Mobile App

```bash
cd artifacts/uni-jobs-mobile
npx expo start
```

### Run on Device

1. Install Expo Go on Android or iOS
2. Start Expo
3. Scan the QR code
4. Test the application on your device

## Current MVP Status

Implemented:

* Worker registration
* Worker login
* Company registration
* Company login
* Admin approval workflow
* Worker search
* Job posting
* English/Hindi support
* Mobile-first UI
* MongoDB integration

Planned:

* Worker PIN authentication
* Aadhaar masking
* APK builds
* Production deployment
* Improved security controls

## Security Notes

* Environment variables are excluded from source control.
* Admin access is protected using a server-side secret.
* Sensitive credentials should never be committed to GitHub.

## License

MIT License

## Author
Built by Shrey Sharma

Built by Shrey as part of the UniJobs MVP project.
