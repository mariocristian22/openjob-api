const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');
const ClientError = require('../exceptions/ClientError');

class ApplicationsRepository {
  async addApplication({ id, user_id, job_id, status }) {
    const query = {
      text: 'INSERT INTO applications (id, user_id, job_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, user_id, job_id, status || 'pending'],
    };
    try {
      const result = await pool.query(query);
      return result.rows[0].id;
    } catch (err) {
      if (err.code === '23505') {
        throw new ClientError('You have already applied to this job', 409);
      }
      throw err;
    }
  }

  async getAllApplications() {
    const query = {
      text: `SELECT a.*, u.name AS user_name, u.email AS user_email,
             j.title AS job_title
             FROM applications a
             JOIN users u ON a.user_id = u.id
             JOIN jobs j ON a.job_id = j.id
             ORDER BY a.created_at DESC`,
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async getApplicationById(id) {
    const query = {
      text: `SELECT a.*, u.name AS user_name, u.email AS user_email,
             j.title AS job_title
             FROM applications a
             JOIN users u ON a.user_id = u.id
             JOIN jobs j ON a.job_id = j.id
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
      text: `SELECT a.*, j.title AS job_title
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
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