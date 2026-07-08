const express = require('express');
const dashboardRoutes = require('./dashboard.routes');
const productRoutes = require('./product.routes');
const buyerRoutes = require('./buyer.routes');
const supplierRoutes = require('./supplier.routes');
const orderRoutes = require('./order.routes');
const invoiceRoutes = require('./invoice.routes');
const aiRoutes = require('./ai.routes');
const imageRoutes = require('./image.routes');

const router = express.Router();

// Mount all modular routes
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/buyers', buyerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/ask', aiRoutes);
router.use('/image-search', imageRoutes);

module.exports = router;
