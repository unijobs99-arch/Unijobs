Use this prompt to describe the UniJobs app, its users, workflows, architecture, and running instructions.

Prompt:

"UniJobs is a mobile-first workforce hiring MVP built with Expo React Native and a TypeScript/Express backend. Explain the purpose of the app, the three main user roles, the core workflows, and the main technical architecture. Describe:

1. The app goal: connect workers and employers with admin-controlled company approval.
2. Worker functionality: register a profile, login by phone, edit their profile, and browse job requirements.
3. Company functionality: register a company, wait for admin approval, login by email, search workers by category/city, post requirements, and view their jobs.
4. Admin functionality: use a secure admin secret, review company registrations, approve/reject companies, and manage worker/company data.
5. Multi-language support: English and Hindi available in the mobile app.
6. The project layout:
   - `artifacts/uni-jobs-mobile`: Expo React Native mobile app
   - `artifacts/api-server`: Express + TypeScript backend API
   - `lib`: shared libraries and generated API/Zod types
7. Key technologies: Expo, React Native, TypeScript, Express, Node.js, MongoDB Atlas, Mongoose.
8. How to run it locally: install dependencies with `pnpm install`, start backend with `pnpm --filter @workspace/api-server start`, and start mobile with `cd artifacts/uni-jobs-mobile && npx expo start`.
9. MVP status: worker registration/login, company registration/login, admin approval workflow, worker search, job posting, and mobile-first UI are implemented."
