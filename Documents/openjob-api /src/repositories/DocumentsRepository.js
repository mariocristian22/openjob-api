const pool = require('../db/pool');
const NotFoundError = require('../exceptions/NotFoundError');

class DocumentsRepository {
  async addDocument({ id, filename, original_name, size, mime_type, uploaded_by }) {
    const query = {
      text: `INSERT INTO documents (id, filename, original_name, size, mime_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, filename, original_name, size, mime_type, uploaded_by],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getAllDocuments() {
    const query = {
      text: 'SELECT * FROM documents ORDER BY created_at DESC',
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async getDocumentById(id) {
    const query = {
      text: 'SELECT * FROM documents WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Document not found');
    }
    return result.rows[0];
  }

  async deleteDocument(id) {
    const query = {
      text: 'DELETE FROM documents WHERE id = $1 RETURNING filename',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Document not found');
    }
    return result.rows[0].filename;
  }
}

module.exports = DocumentsRepository;
