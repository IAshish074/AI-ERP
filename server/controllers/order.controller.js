const orderService = require('../services/order.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class OrderController {
  getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getAllOrders();
    return ApiResponse.success(res, orders, 'Orders fetched successfully');
  });

  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }
    return ApiResponse.success(res, order, 'Order fetched successfully');
  });

  createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    return ApiResponse.success(res, order, 'Order created successfully', 201);
  });

  updateOrder = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return ApiResponse.success(res, order, 'Order updated successfully');
  });

  deleteOrder = asyncHandler(async (req, res) => {
    const order = await orderService.deleteOrder(req.params.id);
    return ApiResponse.success(res, order, 'Order deleted successfully');
  });
}

module.exports = new OrderController();
