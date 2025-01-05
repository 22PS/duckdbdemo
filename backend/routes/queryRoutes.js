const express = require('express');
const fileUpload = require('express-fileupload');
const {
  uploadFile,
  generateSQL,
  executeQuery,
  getData,
} = require('../controller/queryController');
const router = express.Router();

router.use(fileUpload());

router.post('/upload', uploadFile);
router.post('/get-data', getData);
router.post('/generate-sql', generateSQL);
router.post('/execute-query', executeQuery);

module.exports = router;
