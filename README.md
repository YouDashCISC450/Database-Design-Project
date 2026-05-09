# Database-Design-Project

YouDash — a DoorDash-style food pickup app. Class database design project.
LIVE DEMO: database-design-project.vercel.app

## Web Frontend

The Next.js frontend lives in the `web/` directory and talks directly to the
Neon Postgres database via API routes.

### Quick start

```bash
cd web
cp .env.local.example .env.local   # then fill in your real DATABASE_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment variables

| Variable       | Description                                         |
|----------------|-----------------------------------------------------|
| `DATABASE_URL` | Neon Postgres connection string (see `.env.local.example`) |

## Python CLI (legacy)

The original CLI insert tool is in the repo root (`database.py`).
See the `routes/` directory for per-table insert scripts.

```bash
pip install psycopg
python database.py
```
