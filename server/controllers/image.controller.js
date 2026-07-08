const imageService = require('../services/image.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ImageController {
  search = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'No image file uploaded', 400);
    }

    const searchResult = await imageService.searchByImage(
      req.file.buffer, 
      req.file.mimetype
    );

    return ApiResponse.success(res, searchResult, 'Image search completed successfully');
  });
}

module.exports = new ImageController();
