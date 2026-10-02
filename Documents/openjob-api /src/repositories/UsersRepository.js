const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');
const ClientError = require('../exceptions/ClientError');

class UsersRepository {
  async addUser({ id, name, email, password, role }) {
    const query = {
      text: 'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, email, password, role],
    };
    try {
      const result = await pool.query(query);
      return result.rows[0].id;
    } catch (err) {
      if (err.code === '23505') {
        throw new ClientError('Email already registered', 400);
      }
      throw err;
    }
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('User not found');
    }
    return result.rows[0];
  }

  async getUserByEmail(email) {
    const query = {
      text: 'SELECT id, name, email, password, role FROM users WHERE email = $1',
      values: [email],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('User not found');
    }
    return result.rows[0];
  }
}

module.exports = UsersRepository;
