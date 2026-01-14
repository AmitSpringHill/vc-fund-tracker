const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
const uploadController = require('../controllers/uploadController');

router.post('/analyze', upload.single('file'), uploadController.analyzePDF);
router.post('/confirm', uploadController.uploadPDF);

module.exports = router;
