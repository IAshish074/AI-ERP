const supabase = require('../config/supabase');

class DashboardRepository {
  async getStats() {
    // Perform head count queries on all tables in parallel
    const [
      buyersRes,
      suppliersRes,
      productsRes,
      ordersRes,
      invoicesRes
    ] = await Promise.all([
      supabase.from('buyers').select('*', { count: 'exact', head: true }),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }),
      supabase.from('finished_goods').select('*', { count: 'exact', head: true }),
      supabase.from('sales_orders').select('*', { count: 'exact', head: true }),
      supabase.from('sales_invoices').select('amount, payment_status')
    ]);

    // Calculate invoice stats
    let totalInvoiced = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;

    if (invoicesRes.data) {
      invoicesRes.data.forEach(inv => {
        const amount = parseFloat(inv.amount || 0);
        totalInvoiced += amount;
        if ((inv.payment_status || '').toLowerCase() === 'paid') {
          paidInvoices += amount;
        } else {
          unpaidInvoices += amount;
        }
      });
    }

    // Get order status breakdown
    const orderBreakdownRes = await supabase.from('sales_orders').select('status, quantity, unit_price');
    let pendingOrdersCount = 0;
    let completedOrdersCount = 0;
    let totalOrderValue = 0;

    if (orderBreakdownRes.data) {
      orderBreakdownRes.data.forEach(ord => {
        const total_amount = (ord.quantity || 0) * (ord.unit_price || 0);
        totalOrderValue += total_amount;
        const status = (ord.status || '').toLowerCase();
        if (status === 'pending') pendingOrdersCount++;
        if (status === 'completed' || status === 'delivered') completedOrdersCount++;
      });
    }

    return {
      counts: {
        buyers: buyersRes.count || 0,
        suppliers: suppliersRes.count || 0,
        products: productsRes.count || 0,
        orders: ordersRes.count || 0
      },
      invoices: {
        totalAmount: totalInvoiced,
        paidAmount: paidInvoices,
        unpaidAmount: unpaidInvoices
      },
      orders: {
        totalValue: totalOrderValue,
        pendingCount: pendingOrdersCount,
        completedCount: completedOrdersCount
      }
    };
  }
}

module.exports = new DashboardRepository();
