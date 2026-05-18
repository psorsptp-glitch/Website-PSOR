# 🚢 Pelindo OrgChart — Panduan Setup Lengkap

---

## 📋 Prasyarat
- Node.js ≥ 18
- npm ≥ 9
- Akun Supabase (gratis di supabase.com)

---

## LANGKAH 1 — Setup Supabase

### 1.1 Buat project Supabase
1. Buka [supabase.com](https://supabase.com) → New Project
2. Catat: **Project URL** dan **API Keys** (Settings → API)

### 1.2 Jalankan SQL Schema
1. Di Supabase dashboard → **SQL Editor**
2. Copy-paste isi file `docs/supabase_schema.sql`
3. Klik **Run**

### 1.3 Ambil credentials
Di Supabase → Settings → API:
- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_KEY` = service_role key *(jaga kerahasiaannya!)*

---

## LANGKAH 2 — Setup Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...   # service_role key
SUPABASE_ANON_KEY=eyJhbGci...      # anon key

JWT_SECRET=your-secret-min-32-chars-change-this-now!
JWT_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:5173
```

Install & jalankan:
```bash
npm install
npm run dev
```

✅ Backend berjalan di: **http://localhost:3000**
✅ Health check: **http://localhost:3000/api/health**

---

## LANGKAH 3 — Setup Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Install & jalankan:
```bash
npm install
npm run dev
```

✅ Frontend berjalan di: **http://localhost:5173**

---

## LANGKAH 4 — Login Pertama

Default admin (dari seed data):
- **Email**: `admin@pelindo.co.id`
- **Password**: `admin123`

⚠️ **Ganti password segera setelah login pertama!**

---

## 📁 Struktur Project

```
pelindo-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js       # Supabase client
│   │   │   └── constants.js      # App constants
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Login, register, me
│   │   │   ├── jabatan.controller.js # CRUD + tree + move
│   │   │   └── users.controller.js   # User management
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verify + role check
│   │   │   ├── validate.js       # Joi validation
│   │   │   └── errorHandler.js   # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── jabatan.routes.js
│   │   │   ├── users.routes.js
│   │   │   └── index.js
│   │   ├── validators/
│   │   │   └── jabatan.validator.js  # Joi schemas
│   │   ├── utils/
│   │   │   ├── response.js       # Standardized API responses
│   │   │   └── logger.js         # Colored console logger
│   │   └── index.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/css/main.css   # Tailwind + custom classes
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AppSidebar.vue
    │   │   │   └── AppHeader.vue
    │   │   ├── tree/
    │   │   │   ├── TreeView.vue       # Canvas + SVG connectors
    │   │   │   └── TreeNodeCard.vue   # Individual node card
    │   │   ├── list/
    │   │   │   └── ListView.vue       # Paginated table
    │   │   ├── matrix/
    │   │   │   └── MatrixView.vue     # Grid card view
    │   │   ├── detail/
    │   │   │   ├── DetailPanel.vue    # 4-tab detail panel
    │   │   │   ├── InfoRow.vue
    │   │   │   └── DetailSection.vue
    │   │   └── modals/
    │   │       ├── NodeFormModal.vue      # Add/Edit (4-tab form)
    │   │       └── DeleteConfirmModal.vue
    │   ├── stores/
    │   │   ├── auth.store.js      # Pinia: auth state
    │   │   ├── jabatan.store.js   # Pinia: org data + CRUD
    │   │   ├── modal.store.js     # Pinia: modal state
    │   │   └── toast.store.js     # Pinia: notifications
    │   ├── router/index.js        # Vue Router + auth guard
    │   ├── utils/
    │   │   ├── api.js             # Axios + interceptors
    │   │   └── tree.js            # Tree layout engine
    │   └── views/
    │       ├── SignInView.vue
    │       ├── SignUpView.vue
    │       ├── DashboardLayout.vue
    │       ├── StrukturOrgView.vue
    │       ├── OverviewView.vue
    │       ├── NomenklaturView.vue
    │       ├── ReportsView.vue
    │       └── SettingsView.vue
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔌 API Reference

Base URL: `http://localhost:3000/api`
Auth: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Desc | Auth |
|--------|----------|------|------|
| POST | `/auth/register` | Daftar akun baru | ❌ |
| POST | `/auth/login` | Login | ❌ |
| GET | `/auth/me` | Info user login | ✅ |

### Jabatan
| Method | Endpoint | Desc | Role |
|--------|----------|------|------|
| GET | `/jabatan?search=&division=&page=&limit=` | List (paginated) | All |
| GET | `/jabatan/tree` | Tree hierarchy | All |
| GET | `/jabatan/divisions` | Daftar divisi | All |
| GET | `/jabatan/:id` | Detail jabatan | All |
| POST | `/jabatan` | Buat jabatan baru | Admin |
| PUT | `/jabatan/:id` | Update jabatan | Admin |
| DELETE | `/jabatan/:id` | Hapus jabatan | Admin |
| PATCH | `/jabatan/:id/move` | Pindah parent | Admin |

### Example Request
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pelindo.co.id","password":"admin123"}'

# Get tree
curl http://localhost:3000/api/jabatan/tree \
  -H "Authorization: Bearer <token>"

# Create jabatan
curl -X POST http://localhost:3000/api/jabatan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Manajer Operasional",
    "parent_id": 1,
    "division": "Operasional",
    "status": "active"
  }'
```

---

## 🚀 Deploy Production

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Push ke GitHub → connect ke Vercel
# Set env: VITE_API_BASE_URL=https://your-backend.com/api
```

### Backend (Railway / Render)
```bash
# Tambahkan semua env vars di platform deployment
# Pastikan NODE_ENV=production
```

---

## 🔐 Role-Based Access

| Fitur | Admin | Viewer |
|-------|-------|--------|
| Lihat tree/list/matrix | ✅ | ✅ |
| Lihat detail jabatan | ✅ | ✅ |
| Tambah jabatan | ✅ | ❌ |
| Edit jabatan | ✅ | ❌ |
| Hapus jabatan | ✅ | ❌ |
| Manage users | ✅ | ❌ |

---

## 🐛 Troubleshooting

**❌ CORS Error**
→ Pastikan `ALLOWED_ORIGINS` di backend `.env` sesuai dengan URL frontend

**❌ 401 Unauthorized**
→ Token expired → login ulang, atau cek `JWT_SECRET` di `.env`

**❌ Cannot connect to Supabase**
→ Cek `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` di `.env`

**❌ Tree kosong setelah login**
→ Cek apakah tabel `jabatan` di Supabase sudah ada data seed

---

## 📞 Next Steps

1. Integrasikan Pragmatica font (taruh di `frontend/public/fonts/`)
2. Tambahkan fitur drag & drop tree (gunakan `@vueuse/gesture` atau `vue-draggable-plus`)
3. Tambahkan export PDF (`html2pdf.js`)
4. Setup CI/CD dengan GitHub Actions
