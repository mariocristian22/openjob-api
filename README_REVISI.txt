OPENJOB V2 - REVISI SUBMISSION

Perbaikan utama:
1. Field upload dokumen menggunakan form-data key: document.
2. GET /documents dan GET /documents/:id bersifat public.
3. File non-PDF, file terlalu besar, dan field upload yang salah menghasilkan 400 dengan status "failed".
4. File PDF valid menghasilkan 201 dan metadata disimpan ke PostgreSQL.
5. GET /documents/:id mengirim Content-Type application/pdf dan Content-Disposition.
6. Delete application menghapus cache detail, cache berdasarkan user, dan cache berdasarkan job.
7. Consumer tetap menjadi project independen dengan package.json sendiri.
8. node_modules dan file upload sementara tidak disertakan di submission.

Sebelum submit ulang:
- Pastikan PostgreSQL, Redis, dan RabbitMQ berjalan.
- Jalankan migration di openjob_api: npm run migrate
- Jalankan API: npm start
- Jalankan consumer di terminal lain: npm start
- Jalankan seluruh Postman Collection + Environment Dicoding dan pastikan Failed = 0.
