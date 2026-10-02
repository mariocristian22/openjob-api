const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');

class JobsRepository {
  async addJob({ id, company_id, category_id, title, description, job_type, experience_level, location_type, location_city, salary_min, salary_max, is_salary_visible, status }) {
    const query = {
      text: `INSERT INTO jobs (id, company_id, category_id, title, description, job_type, experience_level,
             location_type, location_city, salary_min, salary_max, is_salary_visible, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      values: [id, company_id, category_id, title, description || null, job_type || null,
               experience_level || null, location_type || null, location_city || null,
               salary_min || null, salary_max || null,
               is_salary_visible !== undefined ? is_salary_visible : true, status || 'open'],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getAllJobs({ title, companyName } = {}) {
    let queryText = `
      SELECT j.*, c.name AS company_name, c.location AS company_location,
             cat.name AS category_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN categories cat ON j.category_id = cat.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (title) {
      queryText += ` AND j.title ILIKE $${paramCount}`;
      values.push(`%${title}%`);
      paramCount++;
    }

    if (companyName) {
      queryText += ` AND c.name ILIKE $${paramCount}`;
      values.push(`%${companyName}%`);
      paramCount++;
    }

    queryText += ' ORDER BY j.created_at DESC';

    const result = await pool.query({ text: queryText, values });
    return result.rows;
  }

  async getJobById(id) {
    const query = {
      text: `SELECT j.*, c.name AS company_name, c.location AS company_location,
             cat.name AS category_name
             FROM jobs j
             JOIN companies c ON j.company_id = c.id
             JOIN categories cat ON j.category_id = cat.id
             WHERE j.id = $1`,
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Job not found');
    }
    return result.rows[0];
  }

  async getJobsByCompanyId(companyId) {
    const query = {
      text: `SELECT j.*, c.name AS company_name, cat.name AS category_name
             FROM jobs j
             JOIN companies c ON j.company_id = c.id
             JOIN categories cat ON j.category_id = cat.id
             WHERE j.company_id = $1
             ORDER BY j.created_at DESC`,
      values: [companyId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async getJobsByCategoryId(categoryId) {
    const query = {
      text: `SELECT j.*, c.name AS company_name, cat.name AS category_name
             FROM jobs j
             JOIN companies c ON j.company_id = c.id
             JOIN categories cat ON j.category_id = cat.id
             WHERE j.category_id = $1
             ORDER BY j.created_at DESC`,
      values: [categoryId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async updateJob(id, { company_id, category_id, title, description, job_type, experience_level, location_type, location_city, salary_min, salary_max, is_salary_visible, status }) {
    const query = {
      text: `UPDATE jobs SET company_id=$1, category_id=$2, title=$3, description=$4, job_type=$5,
             experience_level=$6, location_type=$7, location_city=$8, salary_min=$9, salary_max=$10,
             is_salary_visible=$11, status=$12, updated_at=current_timestamp
             WHERE id=$13 RETURNING id`,
      values: [company_id, category_id, title, description || null, job_type || null,
               experience_level || null, location_type || null, location_city || null,
               salary_min || null, salary_max || null,
               is_salary_visible !== undefined ? is_salary_visible : true, status || 'open', id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Job not found');
    }
    return result.rows[0].id;
  }

  async deleteJob(id) {
    const query = {
      text: 'DELETE FROM jobs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Job not found');
    }
  }
}

module.exports = JobsRepository;
