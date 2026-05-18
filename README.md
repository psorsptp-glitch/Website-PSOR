# 🚢 Pelindo OrgChart — Full Stack

Sistem Manajemen Struktur Organisasi PT Pelindo Terminal Petikemas.

## Quick Start

```bash
# 1. Setup backend
cd backend && cp .env.example .env
# Edit .env dengan credentials Supabase & JWT secret
npm install && npm run dev

# 2. Setup frontend (terminal baru)
cd frontend && cp .env.example .env
npm install && npm run dev
```

Buka: **http://localhost:5173**

📖 Panduan lengkap: lihat `docs/SETUP_GUIDE.md`
📊 Database schema: lihat `docs/supabase_schema.sql`

## Tech Stack
- **Frontend**: Vue 3 + Vite + Pinia + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (jsonwebtoken)
