# Info Hub

## Backend setup

The schema is managed by Flyway (`backend/src/main/resources/db/migration`) and applied automatically on startup — no manual table creation needed.

1. Create the (empty) database once:
   ```sql
   CREATE DATABASE info_hub;
   ```
2. Set `DB_USERNAME` / `DB_PASSWORD` env vars if they differ from the defaults in `backend/src/main/resources/application.properties`.
3. Run the backend — Flyway creates the schema on first startup:
   ```sh
   cd backend
   ./mvnw spring-boot:run
   ```
