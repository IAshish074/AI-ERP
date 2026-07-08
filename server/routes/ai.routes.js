const express = require('express');
const aiController = require('../controllers/ai.controller');
const validate = require('../middlewares/validation.middleware');
const { askQuestionSchema } = require('../validators/ai.validator');
const router = express.Router();

router.post('/', validate(askQuestionSchema), aiController.ask);

module.exports = router;
