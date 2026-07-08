const express = require('express');
const buyerController = require('../controllers/buyer.controller');
const router = express.Router();

router.get('/', buyerController.getAllBuyers);
router.get('/:id', buyerController.getBuyerById);
router.post('/', buyerController.createBuyer);
router.put('/:id', buyerController.updateBuyer);
router.delete('/:id', buyerController.deleteBuyer);

module.exports = router;
