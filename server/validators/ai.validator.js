const { z } = require('zod');

const askQuestionSchema = z.object({
  question: z.string({
    required_error: 'Question is required'
  }).trim().min(1, 'Question cannot be empty')
});

module.exports = {
  askQuestionSchema
};
