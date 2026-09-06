const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');

class CompaniesRepository {
  async addCompany({ id, name, location, description, owner_id }) {
    const query = {
      text: 'INSERT INTO companies (id, name, location, description, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, location, description || null, owner_id || null],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getAllCompanies() {
    const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    return result.rows;
  }

  async getCompanyById(id) {
    const query = {
      text: 'SELECT * FROM companies WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Company not found');
    }
    return result.rows[0];
  }

  async updateCompany(id, { name, location, description }) {
    const query = {
      text: `UPDATE companies SET name = $1, location = $2, description = $3, updated_at = current_timestamp
             WHERE id = $4 RETURNING id`,
      values: [name, location, description || null, id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Company not found');
    }
    return result.rows[0].id;
  }

  async deleteCompany(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Company not found');
    }
  }
}

module.exports = CompaniesRepository;
