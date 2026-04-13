## LoPiPo Setup & Deployment Guide

### 1. Install Dependencies

**Using npm:**
```bash
npm install
npx prisma generate
```

**Using pnpm:**
```bash
pnpm install
pnpm prisma generate
```

**Using yarn:**
```bash
yarn install
yarn prisma generate
```

### 2. Database Setup

**Local Development:**

1. Copy `.env.example` to `.env.local`
2. Update with your Neon credentials (already done in `.env.local`)
3. Run migrations:
```bash
npx prisma migrate deploy
```

**Important:** Prisma uses two database URLs:
- `DATABASE_URL`: Pooled connection (pgBouncer) for app queries
- `DIRECT_DATABASE_URL`: Direct connection for migrations (bypasses pooling)

Both are configured in `.env.local` pointing to your Neon instance.

### 3. Prisma Configuration

**Key Files:**
- `/prisma/schema.prisma` - Database schema with all models
- `/prisma/migrations/` - Migration history (auto-generated)
- `/.npmrc` - pnpm configuration for optimal dependency resolution

**Understanding Neon Pooling:**
- App queries use `DATABASE_URL` with `-pooler.neon.tech` endpoint (handles 10k+ concurrent connections)
- Migrations use `DIRECT_DATABASE_URL` without `-pooler` (direct database access)
- This two-URL pattern prevents "too many connections" errors at scale

### 4. Generate New Migrations

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_change
```

This:
1. Creates a migration file in `/prisma/migrations/`
2. Applies it to your local database
3. Regenerates Prisma client

### 5. Package.json Changes

Added for Prisma support:

**Dependencies:**
- `@prisma/client: ^5.8.0` - Runtime database client

**DevDependencies:**
- `prisma: ^5.8.0` - CLI tool for migrations and generation

### 6. .npmrc Configuration

Created for pnpm compatibility:
- `shamefully-hoist=true` - Allows peer dependency hoisting
- `strict-peer-dependencies=false` - Prevents pnpm strict mode errors
- `node-linker=hoisted` - Optimizes node_modules resolution for Prisma

### 7. Deployment to Vercel

In Vercel project settings, add environment variables:

```
DATABASE_URL=postgresql://...pooler.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
PI_API_KEY=your-pi-api-key
LOTTERY_DRAW_SECRET_KEY=your-secret-key
```

Vercel automatically runs `prisma generate` during build, so migrations happen via your CI/CD or manual execution.

### 8. Troubleshooting

**Issue: "Cannot find module @prisma/client"**
- Solution: Run `npm install` or `pnpm install` to install dependencies

**Issue: "Error: DIRECT_DATABASE_URL not set"**
- Solution: Add `DIRECT_DATABASE_URL` to `.env.local` and Vercel settings

**Issue: "Too many connections" errors**
- Solution: Ensure app uses pooled `DATABASE_URL` (with `-pooler`)

**Issue: Migration fails with "connection timeout"**
- Solution: Use `DIRECT_DATABASE_URL` for migrations, not pooled connection

### 9. Quick Start Checklist

- [x] @prisma/client installed in dependencies
- [x] prisma CLI installed in devDependencies
- [x] .npmrc created for pnpm compatibility
- [x] prisma/schema.prisma configured with dual-URL setup
- [x] .env.local has DATABASE_URL and DIRECT_DATABASE_URL
- [x] .env.example created as template for developers
- [ ] Run `npm install` to install new dependencies
- [ ] Run `npx prisma generate` to generate Prisma client
- [ ] Deploy to GitHub and Vercel

You're ready to use Prisma with full type safety and managed migrations!
