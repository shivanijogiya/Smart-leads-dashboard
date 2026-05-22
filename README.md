# Smart Leads Dashboard (assessment)

A full-stack MERN TypeScript smart lead management dashboard with JWT authentication, role-based access, backend filtering, pagination, debounced search, CSV export, responsive UI, and Docker setup.
live at https://smart-leads-dashboard-steel.vercel.app/login

## Requirements:

- React, TypeScript, and TailwindCSS frontend.
- Node.js, Express, TypeScript, MongoDB, and Mongoose backend.
- JWT auth with registration, login, bcrypt password hashing, protected routes, and auth middleware.
- Lead CRUD with name, email, status, source, and created date.
- Combined filtering by status/source, search by name or email, latest/oldest sorting.
- Backend pagination with 10 records per page and metadata.
- Clean UI with validation, loading states, empty states, and error handling.
- REST API standards, centralized error handling, request validation, and clean responses.
- Mandatory extras: debounced search, CSV export, admin/sales role-based access, and Docker.
- Bonus: dark mode support.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS, Axios, React Router, Lucide icons.
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, bcryptjs, JWT.
- Tooling: Docker Compose, ESLint, npm workspaces.

## Roles

- Admin: can view, create, update, delete, and export all leads.
- Sales User: can view, create, update, delete, and export only their own leads.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
copy .env.example server\.env
copy .env.example client\.env
```

3. Start MongoDB locally, or use Docker Compose.

4. Seed demo data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Demo Accounts for admin and sales

After running `npm run seed`:

- Admin: `admin@smartleads.dev` / `Password123`
- Sales: `sales@smartleads.dev` / `Password123`

## Docker Setup

```bash
docker compose up --build
```

Then open `http://localhost:5173`.

## API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require:

```http
Authorization: Bearer <token>
```

### Auth

`POST /auth/register`

```json
{
  "name": "Asha Mehta",
  "email": "asha@example.com",
  "password": "Password123",
  "role": "sales"
}
```

`POST /auth/login`

```json
{
  "email": "asha@example.com",
  "password": "Password123"
}
```

`GET /auth/me`

Returns the logged-in user.

### Leads

`GET /leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1&limit=10`

Returns paginated leads:

```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

`POST /leads`

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram"
}
```

`GET /leads/:id`

`PUT /leads/:id`

`DELETE /leads/:id`

`GET /leads/export?status=Qualified&source=Instagram&search=Rahul&sort=latest`

Downloads a CSV file using the same combined filters as the list endpoint.

## Build

```bash
npm run build
```

## Submission Notes

This repository includes:

- Full source code.
- `.env.example`.
- API documentation in this README.
- Setup instructions.
- Docker setup.
