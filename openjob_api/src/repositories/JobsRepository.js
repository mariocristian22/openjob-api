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
    let queryText;

    if (companyName) {
      queryText = `
        SELECT j.id, j.company_id, j.category_id, j.title, c.name AS company_name, j.description, j.job_type,
               j.experience_level, j.location_type, j.location_city, j.salary_min,
               j.salary_max, j.is_salary_visible, j.status
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        JOIN categories cat ON j.category_id = cat.id
        WHERE 1=1
      `;
    } else {
      queryText = `
        SELECT j.id, j.company_id, j.category_id, j.title, j.description, j.job_type,
               j.experience_level, j.location_type, j.location_city, j.salary_min,
               j.salary_max, j.is_salary_visible, j.status
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        JOIN categories cat ON j.category_id = cat.id
        WHERE 1=1
      `;
    }

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
      text: `SELECT j.id, j.company_id, j.category_id, j.title, c.name AS company_name, j.description, j.job_type,
             j.experience_level, j.location_type, j.location_city, j.salary_min,
             j.salary_max, j.is_salary_visible, j.status
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
      text: `SELECT j.id, j.company_id, j.category_id, j.title, c.name AS company_name, j.description, j.job_type,
             j.experience_level, j.location_type, j.location_city, j.salary_min,
             j.salary_max, j.is_salary_visible, j.status
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
      text: `SELECT j.id, j.company_id, j.category_id, j.title, c.name AS company_name, j.description, j.job_type,
             j.experience_level, j.location_type, j.location_city, j.salary_min,
             j.salary_max, j.is_salary_visible, j.status
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

  async updateJob(id, data) {
    // Update parsial: hanya kolom yang dikirim di request body yang diubah.
    const allowedColumns = [
      'company_id', 'category_id', 'title', 'description', 'job_type',
      'experience_level', 'location_type', 'location_city',
      'salary_min', 'salary_max', 'is_salary_visible', 'status',
    ];

    const sets = [];
    const values = [];

    allowedColumns.forEach((column) => {
      if (data[column] !== undefined) {
        values.push(data[column] === '' ? null : data[column]);
        sets.push(`${column} = $${values.length}`);
      }
    });

    sets.push('updated_at = current_timestamp');
    values.push(id);

    const query = {
      text: `UPDATE jobs SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING id`,
      values,
    };

    let result;
    try {
      result = await pool.query(query);
    } catch (err) {
      // company_id atau category_id yang dikirim tidak ada di tabel terkait.
      if (err.code === '23503') {
        throw new NotFoundError('Company or category not found');
      }
      throw err;
    }

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