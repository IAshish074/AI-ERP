const buyerRepository = require('../repositories/buyer.repository');

class BuyerService {
  async getAllBuyers() {
    return await buyerRepository.getAll();
  }

  async getBuyerById(id) {
    return await buyerRepository.getById(id);
  }

  async createBuyer(buyerData) {
    return await buyerRepository.create(buyerData);
  }

  async updateBuyer(id, buyerData) {
    return await buyerRepository.update(id, buyerData);
  }

  async deleteBuyer(id) {
    return await buyerRepository.delete(id);
  }
}

module.exports = new BuyerService();
