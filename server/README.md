# MotoCare Backend

Express and MongoDB API for the MotoCare application.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB 7 or newer, running locally or hosted
- Clerk application credentials

## Installation

From this directory:

```bash
npm install
```

Create a local `.env` file:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/motocare
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Never commit `.env` or real credentials. Configure these values as secrets in the
deployment platform.

## Development

Start the API with TypeScript watch mode:

```bash
npm run dev
```

The server listens on `http://localhost:8000` by default.

## Production

Build the TypeScript source:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

The production process connects to MongoDB before opening the HTTP port. A
database connection failure causes startup to fail.

## Health check

The unauthenticated health endpoint is:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Server is healthy and running"
}
```

## API

All application routes are under `/api` and require a valid Clerk session
unless noted otherwise.

### Bikes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/bikes` | Create a bike |
| `GET` | `/api/bikes` | List the authenticated user's bikes |
| `GET` | `/api/bikes/:id` | Get a bike |
| `PATCH` | `/api/bikes/:id` | Update a bike |
| `DELETE` | `/api/bikes/:id` | Delete a bike |
| `GET` | `/api/bikes/:id/dashboard` | Get dashboard data |

### Maintenance

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/bikes/:bikeId/maintenance` | Create a maintenance record |
| `GET` | `/api/bikes/:bikeId/maintenance` | List maintenance records |
| `GET` | `/api/bikes/:bikeId/maintenance/:maintenanceId` | Get a maintenance record |
| `PATCH` | `/api/bikes/:bikeId/maintenance/:maintenanceId` | Update a maintenance record |
| `DELETE` | `/api/bikes/:bikeId/maintenance/:maintenanceId` | Delete a maintenance record |

### Fuel

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/bikes/:bikeId/fuel` | Create a fuel entry |
| `GET` | `/api/bikes/:bikeId/fuel` | List fuel entries |
| `GET` | `/api/bikes/:bikeId/fuel/:fuelId` | Get a fuel entry |
| `PATCH` | `/api/bikes/:bikeId/fuel/:fuelId` | Update a fuel entry |
| `DELETE` | `/api/bikes/:bikeId/fuel/:fuelId` | Delete a fuel entry |

### Services

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/bikes/:bikeId/services` | Create a service record |
| `GET` | `/api/bikes/:bikeId/services` | List service records |
| `GET` | `/api/bikes/:bikeId/services/:serviceId` | Get a service record |
| `DELETE` | `/api/bikes/:bikeId/services/:serviceId` | Delete a service record |

Service records are immutable after creation; delete and recreate a record
instead of updating it.

### Documents

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/bikes/:bikeId/documents` | Create or update a document |
| `GET` | `/api/bikes/:bikeId/documents` | List documents |
| `GET` | `/api/bikes/:bikeId/documents/:documentId` | Get a document |
| `DELETE` | `/api/bikes/:bikeId/documents/:documentId` | Delete a document |

## Authentication

The API uses Clerk Express middleware. Send the Clerk session token with
authenticated requests:

```http
Authorization: Bearer <clerk-session-token>
```

The first authenticated request for a Clerk user creates the corresponding
local user record when needed.

## Project structure

```text
src/
├── config/        Database and Clerk configuration
├── controllers/   HTTP request handlers
├── middlewares/   Authentication, validation, errors, and rate limiting
├── models/        Mongoose models
├── routes/        Express route definitions
├── services/      Business logic
├── utils/         Shared request and response helpers
└── validation/    Joi request schemas
```

## Deployment checklist

- Set `MONGODB_URI`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `PORT`
  in the deployment environment.
- Use a hosted MongoDB URI that is reachable from the server.
- Restrict CORS to the deployed client origin instead of allowing every origin.
- Enable the rate-limit middleware before exposing the API publicly.
- Run `npm run build` during deployment and use `npm start` for the release
  process.
- Configure the platform health check to call `GET /health`.
