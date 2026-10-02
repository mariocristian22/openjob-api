const multer = require('multer');
const ClientError = require('../exceptions/ClientError');

function errorHandler(err, req, res, next) {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  // Semua error Multer berasal dari request upload yang tidak sesuai kriteria,
  // sehingga harus dikembalikan sebagai 400 Bad Request.
  if (err instanceof multer.MulterError) {
    let message = err.message;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'PDF file size must not exceed 5MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = "Unexpected file field. Use form-data key 'document'";
    }

    return res.status(400).json({
      status: 'failed',
      message,
    });
  }

  // Joi validation error yang mungkin lolos dari wrapper validator.
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'failed',
    message: 'Internal server error',
  });
}

module.exports = errorHandler;