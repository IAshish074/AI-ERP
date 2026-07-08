const orderRepository = require('../repositories/order.repository');

class OrderService {
  async getAllOrders() {
    return await orderRepository.getAll();
  }

  async getOrderById(id) {
    return await orderRepository.getById(id);
  }

  async createOrder(orderData) {
    return await orderRepository.create(orderData);
  }

  async updateOrder(id, orderData) {
    return await orderRepository.update(id, orderData);
  }

  async deleteOrder(id) {
    return await orderRepository.delete(id);
  }
}

module.exports = new OrderService();
