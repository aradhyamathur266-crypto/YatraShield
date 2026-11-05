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
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get authenticated user profile (protected) |
| GET | `/api/user/admin-test` | Admin-only test route (protected) |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents` | Report a new incident (protected) |
| GET | `/api/incidents` | Get incidents reported by logged-in user (protected) |
| GET | `/api/incidents/:id` | Get a single incident by ID (protected) |
| PATCH | `/api/incidents/:id/status` | Update incident status (protected) |
| PATCH | `/api/incidents/:id/assign` | Assign incident to responder (admin/supervisor only) |

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

## Setup

1. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
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

3. Start development:

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

## Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Lint source code
- `npm run preview` - Preview production build