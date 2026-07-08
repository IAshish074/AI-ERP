const dashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
  async getDashboardStats() {
    return await dashboardRepository.getStats();
  }
}

module.exports = new DashboardService();
