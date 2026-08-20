# SimplePOS — Vercel Deployment Guide

Yes, this project is **100% compatible with Vercel**. Next.js is built by Vercel, and the project already has `"postinstall": "prisma generate"` configured in `package.json`.

---

## Step 1: Cloud PostgreSQL Database (Free Tier)

Vercel hosts serverless web apps, but requires a cloud-accessible PostgreSQL database (it cannot connect to `localhost:5432`). 

You can set up a free managed PostgreSQL database in under 2 minutes using any of these:

- **[Neon.tech](https://neon.tech/)** (Recommended — free serverless PostgreSQL, zero config)
- **[Supabase](https://supabase.com/)** (Use only the PostgreSQL database URL)
- **[Aiven](https://aiven.io/)** / **[Railway](https://railway.app/)**
- **Vercel Postgres** (available directly in the Vercel Marketplace)

Copy your connection string from the provider dashboard. It will look like:
```env
DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Step 2: Push Your Code to GitHub

1. Ensure Git remote points to your repository:
   ```bash
   git remote remove origin
   git remote add origin https://github.com/YOUR_USERNAME/simplepos.git
   ```
2. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy SimplePOS"
   git push -u origin main
   ```

---

## Step 3: Deploy on Vercel

1. Log into [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import your **`simplepos`** GitHub repository.
4. Under **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your cloud PostgreSQL connection string (from Step 1)
5. Click **"Deploy"**.

Vercel will run `postinstall` (`prisma generate`) and `npm run build` automatically.

---

## Step 4: Initialize Cloud Database Tables & Seed

From your local machine, point your local CLI to the cloud database once to push the schema and seed the initial admin account and products:

```bash
# Push the Prisma schema to create tables in the cloud DB
npx prisma db push

# Seed the initial admin user and sample products
npm run db:seed
```
*(Make sure `DATABASE_URL` in `.env` is set to your cloud DB during this step)*

---

## Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

