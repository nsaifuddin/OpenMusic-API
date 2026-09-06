# OpenMusic API V2

OpenMusic API V2 adalah RESTful API untuk mengelola data musik dan playlist. Versi ini merupakan pengembangan dari V1 dengan mempertahankan fitur **Album** dan **Song**, serta menambahkan **User**, **Authentication berbasis JWT**, **Playlist**, **Collaboration**, dan **Playlist Activity**.

## Fungsional

Fitur utama yang tersedia:

- Mengelola album: tambah, lihat detail, ubah, dan hapus album.
- Mengelola lagu: tambah, lihat, ubah, dan hapus lagu.
- Mencari lagu berdasarkan `title` dan/atau `performer`.
- Menghubungkan lagu dengan album menggunakan `albumId`.
- Membuat akun pengguna dengan password yang disimpan dalam bentuk hash.
- Login dan mendapatkan `accessToken` serta `refreshToken`.
- Memperbarui access token menggunakan refresh token.
- Logout dan menghapus refresh token dari database.
- Membuat, melihat, dan menghapus playlist.
- Menambahkan dan menghapus lagu dari playlist.
- Memberikan akses playlist kepada pengguna lain melalui collaboration.
- Mencatat aktivitas penambahan dan penghapusan lagu pada playlist.
- Mengontrol akses endpoint menggunakan autentikasi dan otorisasi berbasis JWT.

## Teknologi

Project ini menggunakan:

- **Node.js** — runtime JavaScript.
- **Hapi.js** — framework REST API.
- **PostgreSQL** — database relasional.
- **pg** — koneksi dan query PostgreSQL.
- **node-pg-migrate** — database migration.
- **@hapi/jwt** — autentikasi berbasis JSON Web Token.
- **bcrypt** — hashing password.
- **Joi** — validasi payload request.
- **nanoid** — membuat ID unik.
- **dotenv** — konfigurasi environment variable.
- **Postman** — pengujian endpoint API.

## Arsitektur

Project menggunakan pemisahan layer agar kode lebih modular dan mudah dipelihara:

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

Struktur utama:

```text
OpenMusic-API-v2/
├── migrations/
├── src/
│   ├── albums/
│   ├── songs/
│   ├── users/
│   ├── authentications/
│   ├── playlists/
│   ├── collaborations/
│   ├── tokenize/
│   ├── exceptions/
│   ├── service/
│   └── utils/
├── .env.example
├── .gitignore
├── package.json
├── run-migrate.js
└── server.js
```

## Endpoint

### Albums

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/albums` | Menambahkan album |
| GET | `/albums/{id}` | Mendapatkan detail album dan lagu di dalamnya |
| PUT | `/albums/{id}` | Mengubah album |
| DELETE | `/albums/{id}` | Menghapus album |

### Songs

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/songs` | Menambahkan lagu |
| GET | `/songs` | Mendapatkan daftar lagu |
| GET | `/songs/{id}` | Mendapatkan detail lagu |
| PUT | `/songs/{id}` | Mengubah lagu |
| DELETE | `/songs/{id}` | Menghapus lagu |

Pencarian lagu menggunakan query parameter:

```text
GET /songs?title={title}
GET /songs?performer={performer}
GET /songs?title={title}&performer={performer}
```

### Users

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/users` | Membuat pengguna baru |

### Authentication

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/authentications` | Login dan membuat access/refresh token |
| PUT | `/authentications` | Memperbarui access token |
| DELETE | `/authentications` | Logout |

### Playlists

Semua endpoint playlist membutuhkan **Bearer Token**.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/playlists` | Membuat playlist |
| GET | `/playlists` | Mendapatkan playlist milik user |
| DELETE | `/playlists/{id}` | Menghapus playlist |
| POST | `/playlists/{id}/songs` | Menambahkan lagu ke playlist |
| GET | `/playlists/{id}/songs` | Mendapatkan lagu dalam playlist |
| DELETE | `/playlists/{id}/songs` | Menghapus lagu dari playlist |
| GET | `/playlists/{id}/activities` | Melihat aktivitas playlist |

### Collaborations

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/collaborations` | Menambahkan collaborator ke playlist |
| DELETE | `/collaborations` | Menghapus collaborator dari playlist |

## Authentication

API menggunakan **JWT** untuk mengamankan endpoint yang membutuhkan autentikasi.

Setelah login, gunakan access token pada header:

```http
Authorization: Bearer <accessToken>
```

Access token dikonfigurasi memiliki masa berlaku maksimal **30 menit**. Refresh token digunakan untuk mendapatkan access token baru tanpa login kembali.

## Database

V2 menggunakan delapan tabel utama:

```text
albums
songs
users
authentications
playlists
playlist_songs
collaborations
playlist_song_activities
```

Relasi utama:

```text
albums
  │
  └── songs

users
  │
  ├── playlists
  │      │
  │      └── playlist_songs ── songs
  │
  └── collaborations ─────── playlists

playlists
  │
  └── playlist_song_activities
```

## Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example` dan isi konfigurasi PostgreSQL serta secret JWT.

Contoh variabel yang diperlukan:

```env
HOST=localhost
PORT=5000

PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=mydb
PGPORT=5432

ACCESS_TOKEN_KEY=your_access_token_secret
REFRESH_TOKEN_KEY=your_refresh_token_secret
```

> Jangan commit file `.env` ke repository. File tersebut berisi password database dan secret key.

## Instalasi dan Menjalankan Project

Clone repository kemudian masuk ke folder API:

```bash
git clone https://github.com/nsaifuddin/OpenMusic-API.git
cd OpenMusic-API/OpenMusic-API
```

Install dependency:

```bash
npm install
```

Buat dan konfigurasi `.env`, kemudian jalankan migration:

```bash
npm run migrate
```

Jalankan server:

```bash
npm start
```

Secara default API berjalan pada:

```text
http://localhost:5000
```

## Testing

Project dilengkapi dengan **Postman Collection V2** untuk menguji fitur:

- Album dan Song.
- Search lagu.
- User registration.
- Login, refresh token, dan logout.
- Playlist.
- Playlist song.
- Authorization owner dan collaborator.
- Collaboration.
- Playlist activity.
- Skenario request valid dan invalid.

Import file berikut ke Postman:

```text
OpenMusic-API-Test/
├── Open Music API V2 Test.postman_collection.json
└── OpenMusic API V2 Test.postman_environment.json
```

## Error Handling

API menggunakan custom exception dan response error yang terstruktur.

Contoh response gagal:

```json
{
  "status": "fail",
  "message": "Pesan error"
}
```

Untuk kesalahan server yang tidak tertangani:

```json
{
  "status": "error",
  "message": "Terjadi kegagalan pada server kami"
}
```

## Tujuan Project

OpenMusic API V2 dibuat sebagai implementasi RESTful API untuk pengelolaan data musik dan playlist dengan pendekatan modular, database relasional, validasi request, autentikasi JWT, authorization, database migration, serta pengujian menggunakan Postman.
