const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');
const ClientError = require('../exceptions/ClientError');

class ApplicationsRepository {
  async addApplication({ id, user_id, job_id, status }) {
    const query = {
      text: 'INSERT INTO applications (id, user_id, job_id, status) VALUES ($1, $2, $3, $4) RETURNING id, user_id, job_id, status',
      values: [id, user_id, job_id, status || 'pending'],
    };
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new ClientError('You have already applied to this job', 400);
      }
      if (err.code === '23503') {
        throw new NotFoundError('Job or user not found');
      }
      throw err;
    }
  }

  async getAllApplications() {
    const query = {
      text: `SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
             u.name AS user_name, u.email AS user_email,
             j.title AS job_title, j.description AS job_description,
             j.company_id, c.name AS company_name, j.location_city
             FROM applications a
             JOIN users u ON a.user_id = u.id
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             ORDER BY a.created_at DESC`,
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async getApplicationById(id) {
    const query = {
      text: `SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
             u.name AS user_name, u.email AS user_email,
             j.title AS job_title, j.description AS job_description,
             j.company_id, c.name AS company_name, j.location_city
             FROM applications a
             JOIN users u ON a.user_id = u.id
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.id = $1`,
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Application not found');
    }
    return result.rows[0];
  }

  async getApplicationsByUserId(userId) {
    const query = {
      text: `SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
             j.title AS job_title, j.description AS job_description,
             j.company_id, c.name AS company_name, j.location_city,
             j.job_type, j.experience_level, j.salary_min, j.salary_max
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC`,
      values: [userId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async getApplicationsByJobId(jobId) {
    const query = {
      text: `SELECT a.*, u.name AS user_name, u.email AS user_email
             FROM applications a
             JOIN users u ON a.user_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.created_at DESC`,
      values: [jobId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async updateApplicationStatus(id, { status }) {
    const query = {
      text: 'UPDATE applications SET status = $1, updated_at = current_timestamp WHERE id = $2 RETURNING id',
      values: [status, id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Application not found');
    }
    return result.rows[0].id;
  }

  async deleteApplication(id) {
    const query = {
      text: 'DELETE FROM applications WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Application not found');
    }
  }

  async getApplicationsByUserIdForProfile(userId) {
    return this.getApplicationsByUserId(userId);
  }
}

module.exports = ApplicationsRepository;