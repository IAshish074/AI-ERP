const express = require('express');
const productController = require('../controllers/product.controller');
const validate = require('../middlewares/validation.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validate(createProductSchema), productController.createProduct);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Utility route to bulk sync products to Typesense manually
router.post('/sync', productController.syncAllProducts);

module.exports = router;
