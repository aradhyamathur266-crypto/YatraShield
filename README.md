<h1 align="center">YatraShield</h1>

<p align="center">
Incident management platform for reporting, tracking, and resolving safety incidents with real-time notifications.
</p>

---

## Overview

YatraShield is a full-stack application that enables users to report incidents, track their status in real-time, and assign responders. The system supports role-based access control for tourists, responders, supervisors, and administrators.

## Architecture

### Backend

- **Framework**: Node.js with Express
- **Real-time**: Socket.IO for WebSocket communication
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT-based authentication
- **Key dependencies**:
  - `express`, `mongoose`, `socket.io`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`

### Frontend

- **Framework**: React 19 with Vite
- **UI**: React Leaflet for maps, React Router for navigation
- **Dependencies**:
  - `axios`, `react-leaflet`, `react-router-dom`, `socket.io-client`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (returns JWT + user) |
| POST | `/api/auth/login` | Login and receive JWT token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get authenticated user profile (protected) |
| GET | `/api/user/responders` | List responders — supervisor/admin/responder (protected) |
| GET | `/api/user/admin-test` | Admin-only test route (protected) |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents` | Report a new incident (protected) |
| GET | `/api/incidents` | Get incidents reported by logged-in user (protected) |
| GET | `/api/incidents/assigned` | Get incidents assigned to the responder (responder only) |
| GET | `/api/incidents/all` | Get all incidents (supervisor/admin only) |
| GET | `/api/incidents/:id` | Get one incident (owner, assigned responder, or staff) |
| PATCH | `/api/incidents/:id/status` | Update incident status (assigned responder, or supervisor/admin) |
| PATCH | `/api/incidents/:id/assign` | Assign incident to responder (admin/supervisor only) |

## Frontend ↔ Backend Mapping

| Frontend | Backend | Real-time |
|----------|---------|-----------|
| `src/pages/Login.jsx` / `Register.jsx` → `authApi.login/register` | `POST /api/auth/login` / `register` (JWT in `Authorization` header) | — |
| `ReportIncident.jsx` → `incidentApi.create` (GeoJSON `[lng, lat]`) | `POST /api/incidents` (server computes `priority`) | — |
| `SOS.jsx` → `incidentApi.create` (category `other` + critical keywords) | `POST /api/incidents` → `critical` priority | — |
| `MyIncidents.jsx` / `TouristDashboard.jsx` → `getMine` / `getAssigned` / `getAll` (by role) | `GET /api/incidents…` | `incident:status_updated`, `incident:assigned`, `incident:reassigned` |
| `AuthorityDashboard.jsx` → `getAll`, `listResponders`, `assign`, `updateStatus` | `GET /api/incidents/all`, `GET /api/user/responders`, `PATCH …/assign`, `PATCH …/status` | same events |
| `Profile.jsx` → `userApi.getProfile` | `GET /api/user/profile` | — |

**How it works:**
- `src/api/api.js` — single Axios instance (`VITE_API_URL`), attaches JWT, clears auth on 401.
- `src/api/socket.js` — single Socket.IO client (`VITE_SOCKET_URL` + JWT auth), joins `user:<id>` room.
- `src/context/AuthContext.jsx` — session state, `login/register/logout`.
- `src/components/ProtectedRoute.jsx` — guards all pages; unauthenticated → `/login`.
- `src/utils/incidents.js` — canonical enums, labels, `NEXT_STATUSES` mirror, formatters.

## Data Models

### User

- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, minlength 6)
- `role` (Enum: tourist, responder, supervisor, admin, default: tourist)

### Incident

- `reportedBy` (ObjectId ref to User, required)
- `category` (Enum: medical, accident, crime, lost_person, fire, harassment, natural_disaster, other, required)
- `description` (String, required)
- `location` (GeoJSON Point with coordinates, required)
- `priority` (Enum: low, medium, high, critical, default: medium)
- `status` (Enum: REPORTED, TRIAGED, ASSIGNED, ACKNOWLEDGED, EN_ROUTE, ON_SITE, RESOLVED, CLOSED, ESCALATED, default: REPORTED)
- `assignedResponder` (ObjectId ref to User, optional)

## Priority Engine

Incidents are assigned priority based on:

1. **Critical keywords** in description: unconscious, not breathing, life-threatening, severe bleeding, trapped, fire spreading → "critical"
2. **High keywords** in description: injured, bleeding, assault, weapon, threatened, missing child, stranded → "high"
3. **Category-based priority**: medical/accident/crime/lost_person → "high", fire/natural_disaster → "critical", harassment/other → "medium"

## Status Workflow

Incidents transition through statuses with permitted transitions:

```
REPORTED → TRIAGED, ESCALATED
TRIAGED → ASSIGNED, ESCALATED
ASSIGNED → ACKNOWLEDGED, ESCALATED
ACKNOWLEDGED → EN_ROUTE, ESCALATED
EN_ROUTE → ON_SITE, ESCALATED
ON_SITE → RESOLVED, ESCALATED
RESOLVED → CLOSED
ESCALATED → TRIAGED, ASSIGNED
```

Only supervisors/admins can escalate or close resolved incidents.

## Real-time Features

- Socket.IO rooms per user (`user:${userId}`)
- Events emitted:
  - `incident:status_updated` - when incident status changes
  - `incident:assigned` - when incident is assigned to a responder

## No-DB Dev Mode (MongoDB not set up yet)

The app server **always starts** — it never exits when Mongo is missing:

- `backend/config/db.js` — tries `MONGO_URI`, logs a warning and continues (no `process.exit`).
- `middleware/requireDB.js` — DB routes return `503 { code: "DB_NOT_CONNECTED", message: "Database not connected..." }`.
- `GET /` and `GET /api/health` report `{ db: "disconnected", dbConnected: false }`.
- Frontend shows a dismissible “Preview mode — no database” banner (`components/BackendStatus.jsx`) and friendly 503 messages; the UI shell, login form, and Safety Info page all load.

To enable full features later: start MongoDB (local or Atlas) and restart — no code changes needed.

## Setup

> **Folder layout:** `backend/` and `frontend/` are separate apps, each with its own `package.json`. `npm run dev` from the project root runs both (via the root `package.json`).

0. **MongoDB is optional for now** — the stack boots in **NO-DB mode** if Mongo isn't running:
   - Backend stays up, frontend loads, and login/incidents return `503 { code: "DB_NOT_CONNECTED" }` with a clear message.
   - For full functionality, set up MongoDB (local service or Atlas `MONGO_URI`) — no code changes needed.

1. Install dependencies (from the project root):

```bash
npm install          # installs `concurrently` at root
npm run install:all  # installs backend + frontend deps
```

2. Create `.env` files:

**Backend** (`backend/.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/yatrashield
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

3. Start development (from the project root):

```bash
npm run dev          # runs backend (port 5000) + frontend (port 5173)
# or individually:
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173 and register (choose any role).

## Available Scripts

### Root
- `npm run dev` — Start backend + frontend together
- `npm run dev:backend` — Start backend only
- `npm run dev:frontend` — Start frontend only
- `npm run install:all` — Install backend + frontend deps
- `npm run build` — Build frontend

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Lint source code
- `npm run preview` - Preview production build