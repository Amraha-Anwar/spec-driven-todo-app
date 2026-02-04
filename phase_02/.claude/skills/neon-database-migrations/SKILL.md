---
name: neon-database-migrations
description: Workflow for managing Neon PostgreSQL schema changes using Alembic and SQLModel. Use this when adding new tables, modifying columns, or synchronizing database versions to prevent manual schema drift.
---

# Neon Database Migrations

This skill establishes a strict migration-first workflow for managing your Neon PostgreSQL database schema using SQLModel and Alembic.

## Summary
A workflow for managing Neon PostgreSQL schema changes using Alembic and SQLModel to ensure database version control.

## Prerequisites
- **Python 3.12+**: The required runtime environment.
- **SQLModel**: The ORM used to define your data models.
- **Alembic**: The tool for handling database migrations.
- **DATABASE_URL**: Your Neon connection string (e.g., `postgresql://user:pass@ep-hostname.neon.tech/dbname`).

## Implementation Instructions

### 1. Initialize Alembic
In your `/backend` directory, set up the migration environment:
```bash
alembic init migrations
```

### 2. Configure 'env.py' for Auto-generation
To enable Alembic to detect your SQLModel changes automatically, you must link it to your models. Open `migrations/env.py` and import your `SQLModel` metadata:

```python
# migrations/env.py
from sqlmodel import SQLModel
from my_app.models import * # Import your models here

# Replace target_metadata = None with:
target_metadata = SQLModel.metadata
```

### 3. Migration Workflow
**Schema Drift** occurs when the code's model definition and the actual database structure become different. To prevent this, use **Migration Revisions**, which are versioned scripts (checkpoints) that describe how to change the database.

1. **Generate a Revision**: Create a new version script based on your SQLModel changes.
   ```bash
   alembic revision --autogenerate -m "Add user table"
   ```
2. **Apply the Migration**: Synchronize your Neon database with the local head version.
   ```bash
   alembic upgrade head
   ```

### 4. Verify in Neon Console
1. Log in to the Neon Console at [console.neon.tech](https://console.neon.tech).
2. Navigate to the **Tables** section for your branch and verify that the new columns or tables are present.
3. Check the `alembic_version` table in your database to see the ID of the current migration.

## Troubleshooting

- **Target database is not up to date**: This happens when the database is behind your local version. Run `alembic upgrade head` to catch up.
- **Out of Sync / Stuck Migrations**: If your migration history is corrupted, you might need to manually set the version using `alembic stamp <revision_id>` or, in extreme development cases, clear the `alembic_version` table and re-run.
- **Detection Failures**: If `autogenerate` doesn't see your changes, ensure that you have imported all your model classes (e.g., `from my_app.models import User`) in `env.py` so they are registered with the metadata.
