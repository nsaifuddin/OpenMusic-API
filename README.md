# OpenMusic API V3

OpenMusic API V3 adalah RESTful API untuk mengelola **album, song, user, playlist, collaboration, dan playlist activity**. V3 mempertahankan seluruh fitur V2 dan menambahkan **upload cover album, album like dengan Redis cache, serta export playlist secara asynchronous menggunakan RabbitMQ dan email consumer**.

## Fitur

### Album & Song
- CRUD album.
- CRUD song.
- Relasi song dengan album melalui `albumId`.
- Pencarian song berdasarkan `title` dan/atau `performer`.
- Menampilkan detail album beserta daftar song.
- Upload cover album dengan validasi tipe dan ukuran file.
- Like, unlike, dan melihat jumlah like album.

### User & Authentication
- Registrasi user.
- Password hashing menggunakan `bcrypt`.
- Login menggunakan JWT.
- Access token dan refresh token.
- Refresh access token dan logout.
- Authorization untuk endpoint yang membutuhkan autentikasi.

### Playlist & Collaboration
- Membuat, melihat, dan menghapus playlist.
- Menambahkan dan menghapus song dari playlist.
- Akses playlist untuk owner dan collaborator.
- Menambahkan dan menghapus collaborator.
- Mencatat aktivitas penambahan dan penghapusan song.

### Fitur Baru V3
- Upload cover album.
- Like dan unlike album.
- Redis cache untuk data album dan jumlah like.
- Export playlist ke email secara asynchronous.
- RabbitMQ sebagai message broker.
- `openmusic-consumer` untuk memproses export playlist dan mengirim email.
- File `playlist.json` dikirim sebagai attachment email.

## Teknologi

### API
- Node.js
- Hapi.js
- PostgreSQL dan `pg`
- `node-pg-migrate`
- `@hapi/jwt`
- `bcrypt`
- `Joi`
- `nanoid`
- Redis
- RabbitMQ dan `amqplib`
- `@hapi/inert`

### Consumer
- Node.js
- RabbitMQ dan `amqplib`
- PostgreSQL dan `pg`
- Nodemailer
- dotenv

### Testing
- Postman

## Arsitektur

```text
Client
  │
  ▼
OpenMusic API
  │
  ├── Routes → Handler → Validator → Service
  │                         │
  │                         ├── PostgreSQL
  │                         └── Redis
  │
  └── Export Playlist
          │
          ▼
       RabbitMQ
          │
          ▼
   OpenMusic Consumer
          │
          ├── PostgreSQL
          └── Nodemailer
                  │
                  ▼
                Email
```

## Struktur Repository

```text
OpenMusic-API/
├── OpenMusic-API/
│   ├── migrations/
│   ├── src/
│   │   ├── albums/
│   │   ├── songs/
│   │   ├── users/
│   │   ├── authentications/
│   │   ├── playlists/
│   │   ├── collaborations/
│   │   ├── exports/
│   │   ├── tokenize/
│   │   ├── exceptions/
│   │   ├── service/
│   │   └── validator/
│   ├── server.js
│   ├── run-migrate.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── openmusic-consumer/
│   ├── consumer.js
│   ├── MailSender.js
│   ├── utils/
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── OpenMusic-API-Test/
│   ├── Open Music API V3 Test.postman_collection.json
│   └── Open Music API Test.postman_environment.json
│
└── README.md
```

## API Endpoints

### Albums

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/albums` | Menambahkan album |
| GET | `/albums/{id}` | Detail album dan song |
| PUT | `/albums/{id}` | Mengubah album |
| DELETE | `/albums/{id}` | Menghapus album |
| POST | `/albums/{id}/covers` | Upload cover album |
| POST | `/albums/{id}/likes` | Like album *(JWT)* |
| DELETE | `/albums/{id}/likes` | Unlike album *(JWT)* |
| GET | `/albums/{id}/likes` | Melihat jumlah like album |

### Songs

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/songs` | Menambahkan song |
| GET | `/songs` | Menampilkan daftar song |
| GET | `/songs/{id}` | Menampilkan detail song |
| PUT | `/songs/{id}` | Mengubah song |
| DELETE | `/songs/{id}` | Menghapus song |

Pencarian song:

```text
GET /songs?title={title}
GET /songs?performer={performer}
GET /songs?title={title}&performer={performer}
```

### Users & Authentication

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/users` | Registrasi user |
| POST | `/authentications` | Login |
| PUT | `/authentications` | Refresh access token |
| DELETE | `/authentications` | Logout |

### Playlists

Semua endpoint playlist membutuhkan **Bearer Token**.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/playlists` | Membuat playlist |
| GET | `/playlists` | Menampilkan playlist milik user |
| DELETE | `/playlists/{id}` | Menghapus playlist |
| POST | `/playlists/{id}/songs` | Menambahkan song ke playlist |
| GET | `/playlists/{id}/songs` | Menampilkan song dalam playlist |
| DELETE | `/playlists/{id}/songs` | Menghapus song dari playlist |
| GET | `/playlists/{id}/activities` | Menampilkan aktivitas playlist |

### Collaborations

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/collaborations` | Menambahkan collaborator |
| DELETE | `/collaborations` | Menghapus collaborator |

### Export Playlist

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/export/playlists/{playlistId}` | Export playlist ke email *(JWT + owner)* |

Payload:

```json
{
  "targetEmail": "user@example.com"
}
```

API mengirim message ke queue RabbitMQ:

```text
export:playlists
```

## Authentication

Endpoint yang membutuhkan autentikasi menggunakan access token dengan format:

```http
Authorization: Bearer <accessToken>
```

Access token memiliki masa berlaku **1800 detik (30 menit)**. Refresh token digunakan untuk mendapatkan access token baru.

## Database

V3 menggunakan tabel:

```text
albums
songs
users
authentications
playlists
playlist_songs
collaborations
playlist_song_activities
user_album_likes
```

Relasi utama:

```text
albums ───────── songs

users ────────── playlists ───── playlist_songs ───── songs
  │                   │
  │                   └────────── playlist_song_activities
  │
  ├── collaborations ─────────── playlists
  └── user_album_likes ───────── albums
```

Tabel `albums` juga memiliki kolom:

```text
cover_url
```

## Redis Cache

Redis digunakan untuk melakukan caching pada data album dan jumlah like album.

Contoh cache key:

```text
album:{id}
album-likes:{albumId}
```

TTL default:

```text
1800 detik (30 menit)
```

Ketika jumlah like diambil dari cache, response dapat menyertakan:

```http
X-Data-Source: cache
```

## RabbitMQ & OpenMusic Consumer

Queue yang digunakan:

```text
export:playlists
```

Message dari API:

```json
{
  "playlistId": "playlist-...",
  "targetEmail": "user@example.com"
}
```

`openmusic-consumer` menerima message dari RabbitMQ, mengambil data playlist dari PostgreSQL, membuat file `playlist.json`, kemudian mengirim file tersebut sebagai attachment email menggunakan Nodemailer.

## Upload Cover Album

Endpoint:

```text
POST /albums/{id}/covers
```

Gunakan:

```text
Content-Type: multipart/form-data
Field: cover
```

Format file yang didukung:

```text
image/apng
image/avif
image/gif
image/jpeg
image/png
image/webp
```

Ukuran maksimum payload:

```text
512 KB
```

File disimpan pada storage lokal dan dapat diakses melalui:

```text
GET /upload/{param*}
```

## Konfigurasi Environment

API dan `openmusic-consumer` menggunakan environment variable untuk menyimpan konfigurasi aplikasi dan koneksi service.

### API

Konfigurasi utama meliputi:

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

REDIS_SERVER=localhost
RABBITMQ_SERVER=localhost
```

Variabel tersebut digunakan untuk konfigurasi server API, PostgreSQL, JWT, Redis, dan RabbitMQ.

### Consumer

Konfigurasi `openmusic-consumer` meliputi:

```env
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=mydb
PGPORT=5432

RABBITMQ_SERVER=localhost

SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

Variabel tersebut digunakan untuk koneksi PostgreSQL, RabbitMQ, dan SMTP sebagai layanan pengiriman email.

> Nilai environment dapat disesuaikan dengan infrastruktur yang digunakan oleh project.

## Komponen Project

### OpenMusic API

Komponen utama yang menyediakan RESTful API dan menangani:

- Manajemen album dan song.
- Manajemen user dan authentication.
- Manajemen playlist dan collaboration.
- Playlist activity.
- Album like.
- Upload cover album.
- Pengiriman permintaan export playlist ke RabbitMQ.

### OpenMusic Consumer

`openmusic-consumer` merupakan service terpisah yang bertanggung jawab memproses message export playlist dari RabbitMQ. Consumer mengambil data playlist, membentuk `playlist.json`, dan mengirimkannya melalui email sebagai attachment.

### Redis

Redis digunakan sebagai cache untuk meningkatkan efisiensi akses data album dan jumlah like album. Cache menggunakan key seperti `album:{id}` dan `album-likes:{albumId}` dengan TTL default 1800 detik.

### RabbitMQ

RabbitMQ berfungsi sebagai message broker antara OpenMusic API dan `openmusic-consumer`. Queue `export:playlists` digunakan untuk proses export playlist secara asynchronous.

## Database Migration

Database dikelola menggunakan `node-pg-migrate`. Struktur V3 mempertahankan database dari versi sebelumnya dan menambahkan:

```text
user_album_likes
cover_url pada albums
```

Migration mencakup tabel utama untuk album, song, user, authentication, playlist, collaboration, playlist activity, serta relasi user dengan album melalui fitur like.

## Testing

Project menyediakan Postman Collection V3 untuk pengujian fungsional dan integrasi API, meliputi:

- Album dan Song CRUD.
- Pencarian Song.
- User dan Authentication.
- Playlist dan Collaboration.
- Playlist Activity.
- Export Playlist.
- Upload Cover Album.
- Album Like dan Unlike.
- Authorization dan invalid request.
- Redis cache.

Collection dan environment Postman tersedia pada:

```text
OpenMusic-API-Test/Open Music API Test.postman_collection.json
OpenMusic-API-Test/Open Music API Test.postman_environment.json
```

## Tujuan Project

OpenMusic API V3 merupakan implementasi RESTful API modular yang menggabungkan **PostgreSQL, JWT authentication, authorization, Redis caching, RabbitMQ message queue, asynchronous playlist export, file upload, dan email delivery** dalam satu project.
