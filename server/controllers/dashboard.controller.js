const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class DashboardController {
  getStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    return ApiResponse.success(res, stats, 'Dashboard statistics fetched successfully');
  });
}

module.exports = new DashboardController();
