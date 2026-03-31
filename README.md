# FlowBoard

**Live:** [flowboard-frontend-three.vercel.app](https://flowboard-frontend-three.vercel.app)

A real-time collaborative Kanban board. Create fully customisable boards, drag and drop cards and columns, and collaborate with others live. Share boards with role-based access control — owners, editors, and viewers.

---

## What This Demonstrates

| Concern | Implementation |
|---|---|
| Real-time collaboration | Socket.IO — board state broadcast to all connected clients instantly |
| Live drag broadcasts | Drag events streamed to all clients in real time — other users see cards moving as you drag |
| Drag and drop | dnd-kit with live overlays, fractional positioning for conflict-free ordering |
| Pessimistic locking | Server-side lock acquisition before mutations — prevents lost updates under concurrent edits |
| RBAC | Owner / Editor / Viewer roles enforced at API and socket layer |
| Auth | JWT dual-token (access + refresh), HttpOnly cookies, token rotation |
| Optimistic UI | TanStack Query mutation lifecycle — UI updates instantly, rolls back on failure |

---

## Architecture

```
Browser A          Browser B
    │                  │
    │   Socket.IO       │
    └──────┬───────────┘
           │
    Express + Socket.IO (5000)
           │
      PostgreSQL
      (Prisma v6)
```

Backend on DigitalOcean VPS via PM2. Postgres in Docker. Frontend on Vercel.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), TanStack Query, Zustand, dnd-kit |
| Backend | Express, Socket.IO |
| Database | PostgreSQL + Prisma v6 |
| Auth | JWT access + refresh tokens, HttpOnly cookies |
| Infra | DigitalOcean VPS, Caddy, PM2 |

---

## Running Locally

### Prerequisites

- Node.js 24+, pnpm, Docker

### Setup

```bash
git clone https://github.com/yourusername/flowboard.git
cd flowboard
pnpm install
docker compose up -d
```

Create `.env` files using the provided `.env.example` files, then run migrations:

```bash
pnpm --filter @flowboard/backend run prisma:migrate
pnpm --filter @flowboard/backend run prisma:generate
```

Start services:

```bash
pnpm --filter @flowboard/backend run dev
pnpm --filter @flowboard/frontend run dev
```

Frontend at `http://localhost:3000`, backend at `http://localhost:5000`.
