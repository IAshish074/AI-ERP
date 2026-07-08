const productService = require('../services/product.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ProductController {
  getAllProducts = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts();
    return ApiResponse.success(res, products, 'Products fetched successfully');
  });

  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }
    return ApiResponse.success(res, product, 'Product fetched successfully');
  });

  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    return ApiResponse.success(res, product, 'Product created successfully', 201);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, product, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const product = await productService.deleteProduct(req.params.id);
    return ApiResponse.success(res, product, 'Product deleted successfully');
  });

  syncAllProducts = asyncHandler(async (req, res) => {
    await productService.syncAllToTypesense();
    return ApiResponse.success(res, null, 'All products synced to Typesense successfully');
  });
}

module.exports = new ProductController();
