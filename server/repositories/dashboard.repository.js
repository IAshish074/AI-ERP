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
      supabase.from('sales_invoices').select('amount_due, status')
    ]);

    // Calculate invoice stats
    let totalInvoiced = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;

    if (invoicesRes.data) {
      invoicesRes.data.forEach(inv => {
        const amount = parseFloat(inv.amount_due || 0);
        totalInvoiced += amount;
        if (inv.status === 'paid') {
          paidInvoices += amount;
        } else {
          unpaidInvoices += amount;
        }
      });
    }

    // Get order status breakdown
    const orderBreakdownRes = await supabase.from('sales_orders').select('status, total_amount');
    let pendingOrdersCount = 0;
    let completedOrdersCount = 0;
    let totalOrderValue = 0;

    if (orderBreakdownRes.data) {
      orderBreakdownRes.data.forEach(ord => {
        totalOrderValue += parseFloat(ord.total_amount || 0);
        if (ord.status === 'pending') pendingOrdersCount++;
        if (ord.status === 'completed') completedOrdersCount++;
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
