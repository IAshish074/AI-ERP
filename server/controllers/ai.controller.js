const aiService = require('../services/ai.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AiController {
  ask = asyncHandler(async (req, res) => {
    const { question } = req.body;
    const result = await aiService.askQuestion(question);
    
    // The user requested a specific output structure:
    // {
    //   "question": "",
    //   "generatedSQL": "",
    //   "rows": [],
    //   "answer": ""
    // }
    return res.status(200).json(result);
  });
}

module.exports = new AiController();
