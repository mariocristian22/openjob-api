const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const DocumentsRepository = require('../repositories/DocumentsRepository');
const ClientError = require('../exceptions/ClientError');

const documentsRepo = new DocumentsRepository();
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

async function removeFileIfExists(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

async function postDocument(req, res, next) {
  try {
    if (!req.file) {
      throw new ClientError('File is required and must be a valid PDF under 5MB', 400);
    }

    const id = `document-${uuidv4()}`;

    try {
      await documentsRepo.addDocument({
        id,
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: req.user.id,
      });
    } catch (err) {
      // Hindari file yatim ketika penyimpanan metadata ke database gagal.
      await removeFileIfExists(req.file.path);
      throw err;
    }

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        documentId: id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllDocuments(req, res, next) {
  try {
    const documents = await documentsRepo.getAllDocuments();
    return res.status(200).json({
      status: 'success',
      data: { documents },
    });
  } catch (err) {
    next(err);
  }
}

async function getDocumentById(req, res, next) {
  try {
    const { id } = req.params;
    const document = await documentsRepo.getDocumentById(id);
    const filePath = path.join(uploadsDir, document.filename);

    if (!fs.existsSync(filePath)) {
      throw new ClientError('File not found on server', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name.replace(/["\r\n]/g, '')}"`);
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const filename = await documentsRepo.deleteDocument(id);
    const filePath = path.join(uploadsDir, filename);

    await removeFileIfExists(filePath);

    return res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};
