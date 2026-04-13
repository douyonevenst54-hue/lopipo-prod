// Migration guide for setting up Prisma with LoPiPo

# Installation & Setup

```bash
# 1. Install Prisma
npm install @prisma/client prisma --save-dev

# 2. Generate Prisma client from schema
npx prisma generate

# 3. Create initial migration (if DB already has tables)
npx prisma migrate resolve --applied "1_init"

# 4. Create new migrations
npx prisma migrate dev --name add_new_feature

# 5. Apply migrations in production
npx prisma migrate deploy
```

# Environment Setup

Add to `.env.local` or Vercel Environment Variables:

```
# Regular connection (for migrations and tools)
DATABASE_URL="postgresql://user:password@host:5432/db"

# Pooled connection (for app queries) - use -pooler endpoint
DATABASE_URL_POOLED="postgresql://user:password@host-pooler.neon.tech:5432/db"
```

# Key Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations in dev
npx prisma migrate dev --name <migration_name>

# Create migration without applying
npx prisma migrate dev --create-only --name <migration_name>

# Apply pending migrations
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset

# View/edit data with Prisma Studio
npx prisma studio
```

# Migration Workflow

1. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_user_profile
   ```
   This creates `prisma/migrations/` folder with timestamped SQL

2. **Review generated SQL:**
   Check `prisma/migrations/[timestamp]_add_user_profile/migration.sql`

3. **Commit to git:**
   ```bash
   git add prisma/migrations/
   git commit -m "Add user profile table"
   ```

4. **Deploy to production:**
   ```bash
   npx prisma migrate deploy
   ```

# Safety Features

- Migrations are versioned in `prisma/migrations/`
- Each migration has unique timestamp
- Migrations are idempotent (safe to retry)
- Rollback by creating new migration (downtime-free)

# For Our Setup

We're using:
- Neon PostgreSQL (serverless)
- Neon pooling mode for high traffic (100k+)
- Prisma for type-safe queries
- Versioned migrations in git

This ensures:
✓ Schema changes are tracked
✓ Deployments are safe and reversible
✓ Team can collaborate on schema
✓ Zero-downtime migrations (Prisma handles this)
