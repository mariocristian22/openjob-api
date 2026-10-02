const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ClientError = require('../exceptions/ClientError');

// Gunakan path absolut agar penyimpanan file tetap konsisten walaupun aplikasi
// dijalankan dari working directory yang berbeda.
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Nama file di server dibuat unik dan tidak menggunakan nama asli pengguna.
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${extension}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }

  // Jadikan kesalahan tipe file sebagai client error (400), bukan 500.
  cb(new ClientError('File is required and must be a valid PDF under 5MB', 400), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimal 5 MB
  },
});

module.exports = upload;