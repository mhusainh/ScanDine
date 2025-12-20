# Frontend Documentation (resources/js)

## Overview
This directory contains the React frontend application for ScanDine. It is structured to separate concerns, improve maintainability, and ensure scalability.

## Directory Structure

```
resources/js/
├── components/         # Reusable UI components
│   ├── shared/         # Components shared across Admin and User views
│   └── ui/             # Generic UI elements (Buttons, Inputs, etc.)
├── contexts/           # React Context providers (Auth, Cart)
├── hooks/              # Custom React Hooks
├── layouts/            # Page layouts (AdminLayout, etc.)
├── libs/               # Modified third-party libraries (axios, etc.)
├── pages/              # Application views/pages
│   ├── admin/          # Admin dashboard and management pages
│   ├── auth/           # Authentication pages
│   └── user/           # Public user pages (Menu, Checkout)
├── services/           # API service layer
├── utils/              # Helper functions and utilities
├── app.jsx             # Application entry point (Routes)
└── bootstrap.js        # Laravel bootstrap logic
```

## Development Guide

### Prerequisites
- Node.js (v18+)
- NPM or Yarn

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Coding Conventions

- **Components**: PascalCase (e.g., `ProductCard.jsx`)
- **Hooks**: camelCase, prefixed with 'use' (e.g., `useMenu.js`)
- **Utilities**: camelCase (e.g., `submitToBlade.js`)
- **Services**: PascalCase (e.g., `MenuService.js`)
- **Clean Code**:
  - Functions max 20 lines.
  - Descriptive variable names.
  - No `console.log` in production.
  - JSDoc for all public functions/components.

## Testing

Run tests with Vitest:
```bash
npm test
```

## Dependencies
- React 19
- React Router DOM 7
- Axios
- Lucide React (Icons)
- Framer Motion (Animations)
- Tailwind CSS
