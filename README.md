# OpenMusic API

OpenMusic API adalah RESTful API sederhana untuk mengelola data musik berupa **album** dan **lagu (song)**. API ini menyediakan fitur CRUD, pencarian lagu, serta relasi antara lagu dan album.

## Fungsional

Beberapa fungsi utama yang tersedia:

- Menambahkan, melihat, mengubah, dan menghapus **album**.
- Menambahkan, melihat, mengubah, dan menghapus **lagu**.
- Menampilkan daftar lagu berdasarkan **title** dan/atau **performer**.
- Menghubungkan lagu dengan album menggunakan `albumId`.
- Menampilkan detail album beserta daftar lagu di dalamnya.
- Melakukan validasi data request dan memberikan response error yang terstruktur.

## Teknologi

Project ini dibangun menggunakan:

- **Node.js** sebagai runtime.
- **Hapi.js** sebagai framework REST API.
- **PostgreSQL** sebagai database.
- **node-pg** untuk koneksi dan query database.
- **node-pg-migrate** untuk database migration.
- **nanoid** untuk menghasilkan ID unik.
- **dotenv** untuk konfigurasi environment variable.
- **Postman** untuk pengujian API.

## Arsitektur

Project menggunakan pemisahan beberapa layer agar kode lebih terstruktur:

```text
Client
  ↓
Routes
  ↓
Handler
  ↓
Validator
  ↓
Service
  ↓
PostgreSQL
```

Struktur utama project:

```text
OpenMusic-API/
├── migrations/
├── src/
│   ├── albums/
│   ├── songs/
│   ├── service/
│   ├── exceptions/
│   └── utils/
├── .env.example
├── package.json
└── server.js
```

## Endpoint Utama

### Albums

```text
POST   /albums
GET    /albums/{id}
PUT    /albums/{id}
DELETE /albums/{id}
```

### Songs

```text
POST   /songs
GET    /songs
GET    /songs/{id}
PUT    /songs/{id}
DELETE /songs/{id}
```

### Pencarian Lagu

Pencarian lagu dapat dilakukan menggunakan query parameter:

```text
GET /songs?title={title}
GET /songs?performer={performer}
GET /songs?title={title}&performer={performer}
```

## Database

Project menggunakan dua tabel utama:

```text
albums
├── id
├── name
└── year

songs
├── id
├── title
├── year
├── genre
├── performer
├── duration
└── album_id
```

Relasi:

```text
albums 1 ──────── N songs
```

## Menjalankan Project

Install dependency:

```bash
npm install
```

Buat file `.env` berdasarkan `.env.example`, kemudian sesuaikan konfigurasi PostgreSQL.

Jalankan migration:

```bash
npm run migrate
```

Jalankan server:

```bash
npm start
```

API secara default berjalan pada:

```text
http://localhost:5000
```

## Testing

Project dilengkapi dengan **Postman Collection** untuk menguji berbagai skenario API, termasuk:

- Request valid.
- Request dengan payload tidak valid.
- ID yang tidak ditemukan.
- CRUD album.
- CRUD song.
- Relasi song dan album.
- Pencarian lagu berdasarkan title dan performer.

## Tujuan Project

Project ini dibuat sebagai implementasi RESTful API untuk sistem pengelolaan data musik dengan menerapkan struktur kode yang modular, validasi request, database migration, serta integrasi PostgreSQL.
>>>>>>> 4daa1b7 (Initial commit OpenMusic API-v1)
