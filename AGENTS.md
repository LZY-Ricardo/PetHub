# Repository Guidelines

## Project Structure & Module Organization
This repository is split into `frontend/`, `backend/`, and `docs/`.

- `frontend/src/` contains the React + Vite app, organized into `components/`, `contexts/`, and feature pages such as `pages/Auth/`, `pages/Pet/`, and `pages/Admin/`.
- `frontend/public/images/` stores static pet images and backups.
- `backend/src/` follows a layered Koa structure: `routes/` -> `controllers/` -> `services/` -> `dao/`, with shared logic in `middlewares/`, `utils/`, and `config/`.
- `backend/database/` contains schema, seed data, and database repair scripts.
- `docs/` holds the requirements, frontend/backend design notes, and API reference. Update these when behavior or interfaces change.

## Build, Test, and Development Commands
Run commands inside the relevant package directory.

- `cd frontend && npm install && npm run dev`: start the Vite dev server on `http://localhost:5173`.
- `cd frontend && npm run build`: create the production bundle.
- `cd frontend && npm run preview`: serve the built frontend locally.
- `cd backend && npm install && npm run dev`: start the Koa API with `nodemon` on `http://localhost:3000`.
- `cd backend && npm start`: run the backend without auto-reload.
- `cd backend && npm run db:init`: run database encoding fix and validation scripts.

The frontend proxies `/api` to `http://localhost:3000`, so both apps should run together in development.

## Coding Style & Naming Conventions
Follow the existing JavaScript style used in both apps: 2-space indentation, single quotes, and semicolons. Keep React components and page files in `PascalCase` such as `HomePage.jsx` and pair styles with matching names like `HomePage.css`. Use `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` for constants.

## Testing Guidelines
There is no automated test suite committed yet. The backend `npm test` script is still a placeholder, so contributors should validate changes manually before opening a PR:

- smoke-test affected API routes against the running backend
- verify impacted frontend flows in the browser
- rerun `npm run build` in `frontend/` for UI changes
- apply `backend/database/schema.sql` and `data.sql` when database changes are introduced

## Commit & Pull Request Guidelines
Recent history uses Conventional Commits with scopes, for example `feat(frontend): ...` and `style(frontend): ...`. Continue using `feat`, `fix`, `refactor`, `style`, `docs`, `test`, or `chore`, and prefer scopes such as `frontend`, `backend`, or `images`.

PRs should include a short summary, linked task or issue, test notes, and screenshots for UI changes. When API contracts, database schema, or setup steps change, update the relevant file under `docs/` in the same PR.

## Security & Configuration Tips
Backend configuration comes from environment variables such as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE`. Do not commit secrets or local database dumps. Keep JWT and auth-related changes aligned with the existing middleware and response helpers.
