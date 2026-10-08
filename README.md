# Job Tracker

Job Tracker is a full-stack application designed to help manage the job search process. It is currently in an early stage and is structured to evolve into a personal system for tracking job applications, job fit, company fit, interview progress, follow-ups, and other decision-making factors used during a search.

The repository contains two main parts:

- JobTrackerAPI — a .NET Web API for authentication, data access, and application logic
- JobTrackerUI — a React + TypeScript frontend for interacting with the API

# Let's Have a Look Then!

**[Open the live demo](https://yellow-glacier-0d69f4c0f.5.azurestaticapps.net/dashboard)**

**Demo login**

* **Username:** `user1`
* **Password:** `password`

### Safari User Issues (iPhone/Mac)

The demo works on Safari, but Safari's **Prevent cross-site tracking** setting can prevent the authentication cookie from being accepted because the frontend and API are hosted on separate Azure domains.

If login doesn't work in Safari:

**Safari → Settings → Privacy → untick "Prevent cross-site tracking"**

Then reload the demo and log in again.

The application is currently running on the **Azure Free tier**. Azure's Static Web App API proxy, which would allow the frontend and API to use the same domain and avoid this Safari issue, requires the **Standard** tier. I'm keeping the project on the Free tier for now to keep costs down and looking into bearer tokens.

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
- an authenticated Adzuna job-search proxy with debounced dashboard results
- basic auth flow and API access patterns for future CRUD features

## Azure

- Database hosted and accessible of Azure ✅
- .NET Web API hosted on Azure and can talk to the hosted Azure database ✅
- Static React front end hosted and talking to the .NET Azure hosted Web API ✅

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
│   └── components/dashboard/
│       ├── DashboardLayout.tsx
│       ├── DashboardOverview.tsx
│       └── AdzunaJobSearch.tsx
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
dotnet ef database update
dotnet build
dotnet run
```

Configure the API's SQL Server connection string before applying migrations. The API is configured for development and exposes Swagger/OpenAPI in development mode.

### Job expectations

Each authenticated user can save one job-expectations profile covering job titles, company size/values/culture preferences, location, commute time, salary range, and work arrangement (on-site, remote, hybrid, or all). The dashboard loads this profile and allows it to be edited; after saving, it reloads the profile from the API so the displayed values reflect persisted data.

The API exposes authenticated `GET` and `PUT` endpoints at `/api/JobExpectations`. Apply the `AddJobExpectations` and `AddJobWorkArrangement` migrations before using these endpoints against a database.

### Personal details

Each authenticated user can maintain a personal profile with their name, email, phone number, location, and professional summary. The dashboard displays the saved details and provides an edit form; saving updates the database and refreshes the displayed profile.

The API exposes authenticated `GET` and `PUT` endpoints at `/api/PersonalDetails`. Apply the `AddPersonalDetails` migration before using these endpoints against a database.

### Job applications

Each authenticated user can add multiple job applications with company, role, location, application date, and status. The dashboard returns to the complete list after an application is added. Applications are ordered by workflow status (Applied, Interview, Offer, Rejected, Withdrawn) and then by application date, newest first; status can be updated directly from the list.

The API exposes authenticated `GET` and `POST` endpoints at `/api/JobApplications`, a `PUT /api/JobApplications/{id}/status` endpoint, and a `DELETE /api/JobApplications/{id}` endpoint. Apply the `AddJobApplications` migration before using these endpoints against a database.

### Jobs considering

Each authenticated user can save and update multiple roles they are considering, including company, job title, salary, URL, location, closing date, and notes. The dashboard highlights roles with a deadline in the next three days and flags roles whose closing date has passed. Saved roles can be deleted from the list.

The API exposes authenticated `GET` and `POST` endpoints at `/api/SavedJobs`, `PUT` and `DELETE` endpoints at `/api/SavedJobs/{id}`. Apply the `AddSavedJobs` migration before using these endpoints against a database.

### Interviews and follow-ups

Each authenticated user can add, edit, and delete interview or follow-up calendar events. Events track company, job title, date and time, an optional location or meeting link, and notes. Upcoming events are listed before past events, and the dashboard interview count reflects upcoming interviews.

The API exposes authenticated `GET` and `POST` endpoints at `/api/InterviewFollowUps`, and `PUT` and `DELETE` endpoints at `/api/InterviewFollowUps/{id}`. Apply the `AddInterviewFollowUps` migration before using these endpoints against a database.

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

Adzuna job search is proxied through the authenticated API so provider credentials are not exposed to the browser. Register for Adzuna API credentials and configure these API settings using user secrets locally or application settings in Azure:

```text
Adzuna__AppId
Adzuna__AppKey
Adzuna__CountryCode=gb
```

The dashboard automatically searches UK listings after a job title or keyword is entered. Searches are debounced while typing; location is optional. Without the app ID and key, the API returns a configuration message and job results remain unavailable.

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
