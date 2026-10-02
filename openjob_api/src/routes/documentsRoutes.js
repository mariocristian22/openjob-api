const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticate = require('../middleware/auth');
const {
  postDocument, getAllDocuments, getDocumentById, deleteDocument,
} = require('../handlers/documentsHandler');

router.post('/', authenticate, upload.single('document'), postDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;
