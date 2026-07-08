const buyerService = require('../services/buyer.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class BuyerController {
  getAllBuyers = asyncHandler(async (req, res) => {
    const buyers = await buyerService.getAllBuyers();
    return ApiResponse.success(res, buyers, 'Buyers fetched successfully');
  });

  getBuyerById = asyncHandler(async (req, res) => {
    const buyer = await buyerService.getBuyerById(req.params.id);
    if (!buyer) {
      return ApiResponse.error(res, 'Buyer not found', 404);
    }
    return ApiResponse.success(res, buyer, 'Buyer fetched successfully');
  });

  createBuyer = asyncHandler(async (req, res) => {
    const buyer = await buyerService.createBuyer(req.body);
    return ApiResponse.success(res, buyer, 'Buyer created successfully', 201);
  });

  updateBuyer = asyncHandler(async (req, res) => {
    const buyer = await buyerService.updateBuyer(req.params.id, req.body);
    return ApiResponse.success(res, buyer, 'Buyer updated successfully');
  });

  deleteBuyer = asyncHandler(async (req, res) => {
    const buyer = await buyerService.deleteBuyer(req.params.id);
    return ApiResponse.success(res, buyer, 'Buyer deleted successfully');
  });
}

module.exports = new BuyerController();
