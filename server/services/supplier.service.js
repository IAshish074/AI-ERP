const supplierRepository = require('../repositories/supplier.repository');

class SupplierService {
  async getAllSuppliers() {
    return await supplierRepository.getAll();
  }

  async getSupplierById(id) {
    return await supplierRepository.getById(id);
  }

  async createSupplier(supplierData) {
    return await supplierRepository.create(supplierData);
  }

  async updateSupplier(id, supplierData) {
    return await supplierRepository.update(id, supplierData);
  }

  async deleteSupplier(id) {
    return await supplierRepository.delete(id);
  }
}

module.exports = new SupplierService();
