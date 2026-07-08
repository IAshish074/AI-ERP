const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class InvoiceController {
  getAllInvoices = asyncHandler(async (req, res) => {
    const invoices = await invoiceService.getAllInvoices();
    return ApiResponse.success(res, invoices, 'Invoices fetched successfully');
  });

  getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      return ApiResponse.error(res, 'Invoice not found', 404);
    }
    return ApiResponse.success(res, invoice, 'Invoice fetched successfully');
  });

  createInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.createInvoice(req.body);
    return ApiResponse.success(res, invoice, 'Invoice created successfully', 201);
  });

  updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    return ApiResponse.success(res, invoice, 'Invoice updated successfully');
  });

  deleteInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.deleteInvoice(req.params.id);
    return ApiResponse.success(res, invoice, 'Invoice deleted successfully');
  });
}

module.exports = new InvoiceController();
