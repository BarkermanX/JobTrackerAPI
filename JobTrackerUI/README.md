# Job Tracker UI

This is the frontend application for the Job Tracker system. It is a React + TypeScript + Vite app that provides a simple authentication flow and a dashboard for viewing personnel records from the backend API.

The UI is designed to work with the companion backend service, typically a .NET API that exposes authentication and personnel endpoints under `/api`.

## Overview

The application currently includes:

- User login screen
- Protected dashboard route
- Session validation using `/api/Auth/me`
- Automatic retry after unauthenticated responses via `/api/Auth/refresh`
- Personnel listing display
- Logout support

This project is intentionally lightweight and focuses on authentication + basic data access rather than a full enterprise dashboard.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Native browser `fetch` for API communication

## Project Structure

```text
JobTrackerUI/
├── public/
├── src/
│   ├── App.tsx
│   ├── AuthContext.tsx
│   ├── Dashboard.tsx
│   ├── ProtectedRoute.tsx
│   ├── api.ts
│   ├── login.tsx
│   ├── login.css
│   ├── index.css
│   ├── main.tsx
│   └── assets/
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Key Application Behavior

### Authentication flow

The app uses a custom `AuthContext` that manages whether the user is currently logged in and whether the app is still checking authentication.

Important endpoints used by the frontend:

- `POST /api/Auth/login` — submits username/password
- `GET /api/Auth/me` — checks whether the current session is authenticated
- `POST /api/Auth/refresh` — refreshes expired authentication if needed
- `POST /api/Auth/logout` — logs the user out

The `apiFetch` helper in `src/api.ts` automatically retries the request after a 401 response by calling the refresh endpoint.

### Route protection

The application uses a `ProtectedRoute` guard to enforce access rules:

- `/login` is public
- `/dashboard` requires authentication
- `/` and any unknown route redirect to `/dashboard` when authenticated, otherwise `/login`

### Dashboard

Once logged in, the dashboard loads personnel records from:

- `GET /api/Personnel`

Each entry is displayed as a name and email, and a logout button is provided.

## Prerequisites

Before running this UI, make sure you have:

- Node.js 18+ or 20+ recommended
- npm
- A running instance of the Job Tracker backend API
- A configured API base URL for the frontend

## Environment Configuration

The app expects the backend API URL to be supplied via an environment variable named `VITE_API_URL`.

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

This value is used by Vite's dev server proxy defined in `vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": {
      target: env.VITE_API_URL,
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This means requests like `/api/Auth/login` are forwarded to the configured backend endpoint.

## Installation

Install the project dependencies:

```bash
npm install
```

## Running the App

Start the development server:

```bash
npm run dev
```

Then open the local URL printed by Vite in the terminal, typically:

```text
http://localhost:5173
```

## Production Build

Create a production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev
```
Starts the Vite development server with hot module reloading.

```bash
npm run build
```
Runs TypeScript compilation and builds the app for deployment.

```bash
npm run preview
```
Serves the production build locally for testing.

```bash
npm run lint
```
Runs ESLint across the source files.

## API Integration Notes

This frontend assumes the backend provides secure cookie-based or session-based authentication. The code calls the API with `fetch` and expects the browser to manage cookies automatically.

If the backend is configured for cookies, the frontend must be served from the same origin or from a domain that allows credentialed cross-origin requests, depending on the backend CORS configuration.

## Typical Development Workflow

1. Start the backend API.
2. Set `VITE_API_URL` to the backend host.
3. Run `npm install`.
4. Run `npm run dev`.
5. Sign in with a valid username/password from the API.
6. View the personnel dashboard.

## Common Issues

### Login does not work

Check that:

- The backend is running
- `VITE_API_URL` points to the correct backend host/port
- The login endpoint exists at `/api/Auth/login`
- CORS and cookies are configured correctly

### Dashboard shows nothing or redirects to login

Check whether:

- `/api/Auth/me` returns a valid authenticated response
- The backend session is still valid
- The refresh endpoint `/api/Auth/refresh` is working properly
- The browser is accepting cookies from the backend

### 401 errors continue occurring

The frontend calls `/api/Auth/refresh` automatically when a request returns `401`. If refresh fails, the app keeps the user unauthenticated and redirects them to the login page.

## Notes

This project is a UI layer only. It depends on the backend API for all business logic, persistence, and authentication. If you want a full local setup, run both the API and this frontend together.

## License

This project does not currently specify a custom license. Review the repository or your organization’s policies before distributing or deploying it externally.

