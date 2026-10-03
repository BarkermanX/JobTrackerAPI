# Job Tracker

Job Tracker is a full-stack application designed to help manage the job search process. It is currently in an early stage and is structured to evolve into a personal system for tracking job applications, job fit, company fit, interview progress, follow-ups, and other decision-making factors used during a search.

The repository contains two main parts:

- JobTrackerAPI — a .NET Web API for authentication, data access, and application logic
- JobTrackerUI — a React + TypeScript frontend for interacting with the API

## Project goal

The long-term goal is to build a practical dashboard for:

- tracking job applications by company and role
- rating job fit based on skills, goals, and alignment
- recording interviews, rejections, and follow-ups
- comparing opportunities across multiple employers
- surfacing trends in job search activity and outcomes

This project is intentionally lightweight at the moment, but the architecture is meant to support more advanced tracking and reporting over time.

## Current state

The project currently includes:

- a .NET 10 API with JWT-based authentication
- SQL Server persistence via Entity Framework Core
- seeded user/personnel data
- CORS configuration for a React frontend
- a React + Vite frontend with login and protected dashboard screens
- basic auth flow and API access patterns for future CRUD features

## Azure

- Database hosted and accessible of Azure [x]
- .NET Web API hosted on Azure and can talk to the hosted Azure database [x]
- Static React front end hosted and talking to the .NET Azure hosted Web API [x]

## Architecture

```text
JobTrackerAPI/
├── Controllers/
├── Data/
├── DTOs/
├── Models/
├── Services/
├── Migrations/
├── Program.cs
├── appsettings.json
└── JobTrackerAPI.csproj

JobTrackerUI/
├── src/
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## Tech stack

### API

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT authentication
- OpenAPI / Swagger UI support

### UI

- React 19
- TypeScript
- Vite
- React Router

## Repository structure

### JobTrackerAPI

The backend currently focuses on authentication and personnel-related operations. It is set up to support a future job tracking domain model with a similar structure for roles, application records, attributes, notes, and scoring.

Key responsibilities include:

- handling auth and token validation
- exposing authenticated API endpoints
- managing user/personnel data
- providing a base for future application tracking services and repositories

### JobTrackerUI

The frontend is a small React app with:

- login page
- protected route handling
- dashboard access after authentication
- credentialed API calls to the backend

It acts as a front-end shell for the application and is designed to grow into a richer job search dashboard.

## Getting started

### Prerequisites

- .NET SDK 10+
- SQL Server instance or compatible database setup
- Node.js 18+ or 20+
- npm

### 1. Configure and run the API

From the JobTrackerAPI directory:

```bash
dotnet restore
dotnet build
dotnet run
```

The API is configured for development and exposes Swagger/OpenAPI in development mode.

### 2. Configure and run the UI

From the JobTrackerUI directory:

```bash
npm install
npm run dev
```

Set the backend URL in a `.env` file if needed, for example:

```env
VITE_API_URL=http://localhost:5000
```

This value is used by Vite to proxy requests to the backend API.

## Environment configuration

The API reads configuration from `appsettings.json` and the environment-specific settings file. The UI expects a `VITE_API_URL` environment variable to point at the running API.

## Current features summary

- JWT authentication flow
- secure cookie/token handling for authenticated requests
- protected frontend routes
- basic API/React integration
- database-backed persistence layer

## Roadmap

This project is planned to grow into a more complete job-search management tool. Possible future features include:

- job application tracking board
- job fit scoring and criteria evaluation
- company and role comparison views
- interview stage tracking
- notes and follow-up reminders
- status filters and dashboards
- analytics for search activity and outcomes
- export/reporting features

## Notes

This repository is a work in progress. The current implementation provides the foundation for a broader product rather than a finished job-search application. The core direction is to keep the stack simple while allowing the feature set to expand over time.

## License

This project currently does not define a formal license. If you intend to use or distribute it, add an appropriate license before publishing.
