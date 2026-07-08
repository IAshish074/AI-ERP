const invoiceRepository = require('../repositories/invoice.repository');

class InvoiceService {
  async getAllInvoices() {
    return await invoiceRepository.getAll();
  }

  async getInvoiceById(id) {
    return await invoiceRepository.getById(id);
  }

  async createInvoice(invoiceData) {
    return await invoiceRepository.create(invoiceData);
  }

  async updateInvoice(id, invoiceData) {
    return await invoiceRepository.update(id, invoiceData);
  }

  async deleteInvoice(id) {
    return await invoiceRepository.delete(id);
  }
}

module.exports = new InvoiceService();
