const express = require('express');
const imageController = require('../controllers/image.controller');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();

router.post('/', upload.single('image'), imageController.search);

module.exports = router;
