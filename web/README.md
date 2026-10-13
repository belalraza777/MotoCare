# MotoCare Web

The MotoCare web app is a Vite and React landing page for the MotoCare
motorcycle companion app. The mobile client contains the authenticated
motorcycle management experience; the API is provided by the backend service.

## Requirements

- Node.js 20 or newer
- npm

## Installation

From this directory:

```bash
npm install
```

The web app does not require environment variables for local development. It
uses the MotoCare logo from the mobile app's shared assets.

## Development

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Quality checks

Run linting and create a production build:

```bash
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Features

The landing page highlights:

- Motorcycle garage and vehicle details
- Maintenance reminders
- Fuel and service history
- Vehicle document tracking
- The MotoCare mobile app's iOS and Android availability

## Project structure

```text
src/
├── App.tsx       Landing page layout and content
├── App.css       Landing page styles
├── index.css     Global styles
└── main.tsx      React entry point
```

The logo is imported from `../mobile/assets/motocarelogo.png`. Keep that asset
path available when building the web app.

## Related apps

- [Mobile app](../mobile/README.md)
- [Backend API](../server/README.md)
