# OpenJob Consumer

Program consumer independen untuk OpenJob API v2. Menerima pesan dari RabbitMQ
setiap ada lamaran (application) baru, lalu mengirim email notifikasi ke pemilik
lowongan (job owner) menggunakan Nodemailer.

Proyek ini **terpisah** dari `openjob_api` — punya `package.json` sendiri dan
hanya berkomunikasi dengan API lewat RabbitMQ (queue: `applications_queue`) serta
membaca data yang sama dari database PostgreSQL.

## Instalasi

```bash
npm install
```

## Konfigurasi

Salin `.env.example` menjadi `.env` lalu isi sesuai environment kamu:

```
PGUSER=
PGPASSWORD=
PGDATABASE=
PGHOST=
PGPORT=

RABBITMQ_HOST=
RABBITMQ_PORT=
RABBITMQ_USER=
RABBITMQ_PASSWORD=

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
```

## Menjalankan

```bash
npm start
```

Consumer akan terus berjalan mendengarkan queue `applications_queue`. Setiap ada
lamaran baru dari `openjob_api`, consumer akan query database untuk mencari
pemilik lowongan dan mengirimkan email berisi nama pelamar, email pelamar, dan
tanggal lamaran.
