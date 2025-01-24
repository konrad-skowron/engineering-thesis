# Survey Maker
This project is a web application for conducting surveys using a continuous Likert scale and much more.

<p align="center">
  <a href="#tech-stack">Tech stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#live-version">Live version</a>
</p>

## Tech stack

### Frontend
- Typescript
- React
- Next.js
- Mantine

### Backend
- Firebase Firestore Database
- Firebase Authentication

### Hosting
- Vercel

### Testing
- Jest
- Playwright

## Installation

1. **Clone the Repository**
```bash
git clone https://github.com/konrad-skowron/engineering-thesis.git

cd engineering-thesis
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create a .env.local file in the root directory and add the following:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

4. **Run the Application**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
The application should now be running at [http://localhost:3000](http://localhost:3000).

## Live version
Access the live version [here](survey-maker-pwr.vercel.app).
