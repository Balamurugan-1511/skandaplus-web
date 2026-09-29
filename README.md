# SkandaPlus

An AI and IT training institute platform built with Next.js — course catalog, blog, job board, enrollment and payment tracking, and an admin dashboard for managing content and applications.


## Features

- **Course catalog** — browse AI courses and corporate training programs, filterable by category and level
- **Blog** — published articles with an admin approval workflow (pending / published / rejected)
- **Careers** — job listings, applications, and saved jobs for candidates
- **Enrollments & payments** — course enrollment with payment status tracking
- **Admin dashboard** — manage blogs, courses, course materials, and job postings
- **Authentication** — session-based login for users and admins

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **File storage:** Supabase Storage (course covers, blog images)
- **Auth:** JWT-based sessions (`jose`), bcrypt password hashing
- **Email:** Nodemailer

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com))

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/Balamurugan-1511/new-static.git
   cd new-static
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   This also runs `prisma generate` automatically via `postinstall`.

3. Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:4029](http://localhost:4029) in your browser.

## Environment Variables

Create a `.env` file with the following (never commit this file):

```env
DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAILS=
```

> **Note:** Use your database provider's *connection pooling* URL for `DATABASE_URL` if deploying to a serverless platform (Netlify, Vercel) — direct connection strings can hit connection limits under serverless load.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 4029 |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed the database |

## Project Structure

```
skandaplus/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Seed script
├── public/
│   └── assets/            # Static images and payment QR codes
├── src/
│   ├── app/                # App Router pages and API routes
│   │   ├── api/            # API endpoints (admin, courses, blogs, jobs, etc.)
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── dashboard/      # User dashboard
│   │   └── ...             # Public pages (courses, blog, careers, about, etc.)
│   ├── components/         # Reusable UI components
│   ├── lib/                 # Auth, mailer, payment config, Prisma client
│   ├── middleware.js        # Route middleware
│   └── styles/               # Global styles and Tailwind config
├── next.config.mjs
└── package.json
```

## Deployment

This project is configured for deployment on **Netlify** using the Next.js Runtime, which supports API routes, server-side rendering, and Prisma out of the box.

1. Connect the repository to Netlify.
2. Set build command to `npm run build`.
3. Add all environment variables listed above in **Site settings → Environment variables**.
4. Deploy.

## License

Private — all rights reserved.
