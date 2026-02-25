# Kneuss Asana Clone

An Asana-inspired project management application built with Next.js 14, Prisma, NextAuth, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Replit Helium DB) via Prisma ORM
- **Auth**: NextAuth v4 with credentials provider (JWT sessions)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts

## Project Structure

```
src/
  app/           # Next.js App Router pages
    api/         # API routes (auth, projects, tasks, users, etc.)
    (auth)/      # Auth pages (login, register)
    (dashboard)/ # Protected dashboard pages (home, projects, tasks, inbox)
  components/    # Reusable React components
    layout/      # Sidebar, navigation
    projects/    # Project views (board, list, timeline)
    tasks/       # Task components
    ui/          # Generic UI components
  lib/           # Utilities (auth config, prisma client, utils)
  middleware.ts  # NextAuth route protection
prisma/
  schema.prisma  # Database schema (PostgreSQL)
  seed.ts        # Database seeder
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (managed by Replit)
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Public URL of the app
- `PORT` - Server port (5000)

## Demo Credentials

- Email: `demo@asana.com` / Password: `password`
- Other users: sarah@kneuss.ch, thomas@kneuss.ch, anna@kneuss.ch, marco@kneuss.ch (all password: `password`)

## Development

The app runs on port 5000 with `npm run dev -- -H 0.0.0.0 -p 5000`.

## Database

Run `npm run db:push` to sync the schema and `npm run db:seed` to seed sample data.
