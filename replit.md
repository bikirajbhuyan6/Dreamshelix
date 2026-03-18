# Dreamshelix India - EdTech Platform

## Overview

Full-stack EdTech platform combining LMS, Referral/Affiliate System, and Admin Dashboard. Built with premium animated UI using Framer Motion.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite (artifacts/dreamshelix)
- **Animation**: Framer Motion + CSS custom utilities
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/        # Express API server (backend)
│   └── dreamshelix/       # React + Vite frontend
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas from OpenAPI
│   └── db/                # Drizzle ORM schema + DB connection
├── scripts/               # Utility scripts
│   └── src/seed.ts        # Database seeder
└── pnpm-workspace.yaml
```

## Demo Credentials

- **Admin**: admin@dreamshelix.in / admin123
- **Student**: student@dreamshelix.in / student123

## Database Schema

- `users` - Students and admins with referral codes and wallet
- `courses` - Course catalog with categories, pricing, levels
- `course_sections` + `lessons` - Course curriculum
- `enrollments` - Student-course relationships with progress
- `referrals` - Referral tree (direct + indirect)
- `earnings` - Commission tracking per user
- `payments` - Payment records with gateway integration
- `withdrawals` - Wallet withdrawal requests
- `notifications` - User notification system

## Key Features

### Public Website
- Landing page with animated hero, floating shapes, parallax
- Course listing with filters and animated cards
- Course detail page with curriculum accordion

### Student Dashboard
- Progress tracking with animated progress bars
- Referral link generator with copyable link
- Wallet balance and earnings history
- Withdrawal request system
- Notification center

### Admin Panel
- Animated analytics dashboard with Recharts
- User management (activate/deactivate)
- Course management (CRUD)
- Withdrawal approval system
- Referral management

### Referral System
- Direct commission: 20% of course purchase
- Indirect commission: 10% from referrer's direct referrals
- Real-time earnings tracking

### Auth System
- JWT tokens (30-day expiry)
- bcrypt password hashing (12 rounds)
- Role-based access control (student/admin)

## Seeding

Run `pnpm --filter @workspace/scripts run seed` to populate the database.

## API Endpoints

- `POST /api/auth/register` - Register with optional referral code
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/courses` - List published courses
- `GET/POST /api/courses/:id` - Course CRUD (admin)
- `GET/POST /api/enrollments` - Enrollment management
- `GET /api/referrals/my` - Referral details
- `GET /api/referrals/earnings` - Earnings breakdown
- `GET/POST /api/payments` - Payment management
- `GET/POST /api/withdrawals` - Withdrawal requests
- `GET/PUT /api/notifications` - Notification system
- `GET /api/admin/stats` - Admin analytics
- `GET/PUT /api/admin/users` - User management
- `GET/PUT /api/admin/withdrawals` - Withdrawal approvals
- `GET /api/admin/referrals` - Referral management
