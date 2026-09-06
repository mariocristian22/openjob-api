const ClientError = require('../exceptions/ClientError');

function errorHandler(err, req, res, next) {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  // Joi validation error that might slip through
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

module.exports = errorHandler;
