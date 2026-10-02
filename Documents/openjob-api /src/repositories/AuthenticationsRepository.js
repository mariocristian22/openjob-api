const pool = require('../db/pool');
const ValidationError = require('../exceptions/ValidationError');

class AuthenticationsRepository {
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    };
    await pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      // Refresh token tidak valid/tidak terdaftar -> 400, bukan 401,
      // sesuai kontrak endpoint PUT/DELETE /authentications.
      throw new ValidationError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await pool.query(query);
  }
}

module.exports = AuthenticationsRepository;
