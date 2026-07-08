const supplierService = require('../services/supplier.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class SupplierController {
  getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await supplierService.getAllSuppliers();
    return ApiResponse.success(res, suppliers, 'Suppliers fetched successfully');
  });

  getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await supplierService.getSupplierById(req.params.id);
    if (!supplier) {
      return ApiResponse.error(res, 'Supplier not found', 404);
    }
    return ApiResponse.success(res, supplier, 'Supplier fetched successfully');
  });

  createSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.createSupplier(req.body);
    return ApiResponse.success(res, supplier, 'Supplier created successfully', 201);
  });

  updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    return ApiResponse.success(res, supplier, 'Supplier updated successfully');
  });

  deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.deleteSupplier(req.params.id);
    return ApiResponse.success(res, supplier, 'Supplier deleted successfully');
  });
}

module.exports = new SupplierController();
