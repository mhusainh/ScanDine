# Changelog

All notable changes to the frontend codebase will be documented in this file.

## [Unreleased]

### Added
- New directory structure for better organization.
- `hooks/` directory for custom React hooks.
- `services/` directory for API communication.
- `libs/` for third-party library configurations.
- `utils/` for helper functions.
- Unit testing setup with Vitest.

### Changed
- Refactored `MenuPage` and `CheckoutPage` to use custom hooks (`useMenu`, `useCheckout`).
- Moved global components to `components/shared` and `layouts`.
- Updated import paths across the application to reflect the new structure.
- Renamed controllers to hooks to follow React conventions.
- Standardized `axios` instance location to `libs/axios.js`.

### Removed
- `controllers/` directory (replaced by `hooks/`).
- `global_components/` directory (split into `components/shared` and `layouts`).
- Legacy code in `MenuPage` and `CheckoutPage` (moved to hooks).

## Migration Guide

### Import Paths
If you are importing components or hooks, please update your paths:
- `global_components/` -> `components/shared/` or `layouts/`
- `controllers/` -> `hooks/`
- `lib/` -> `libs/`

### Hook Usage
Logic previously found in controllers is now available as custom hooks:
```javascript
// Before
import MenuController from '../controllers/MenuController';
// After
import { useMenu } from '../hooks/useMenu';
const { products, loading } = useMenu();
```
