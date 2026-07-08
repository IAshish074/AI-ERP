const supabase = require('../config/supabase');

const mapInvoice = (row) => {
  if (!row) return null;
  return {
    id: row.invoice_number,
    invoice_number: row.invoice_number,
    order_id: row.sales_order || null,
    invoice_date: new Date().toISOString(),
    due_date: new Date().toISOString(),
    amount_due: row.amount || 0,
    status: (row.payment_status || '').toLowerCase() === 'paid' ? 'paid' : 'unpaid',
    created_at: new Date().toISOString()
  };
};

const unmapInvoice = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.invoice_number || data.id) unmapped.invoice_number = data.invoice_number || data.id;
  if (data.order_id) unmapped.sales_order = data.order_id;
  if (data.amount_due) unmapped.amount = parseFloat(data.amount_due);
  if (data.status) unmapped.payment_status = data.status === 'paid' ? 'Paid' : 'Unpaid';
  return unmapped;
};

class InvoiceRepository {
  async getAll() {
    const [invoicesRes, ordersRes, buyersRes] = await Promise.all([
      supabase.from('sales_invoices').select('*'),
      supabase.from('sales_orders').select('order_number, buyer'),
      supabase.from('buyers').select('buyer_id, buyer_name')
    ]);

    if (invoicesRes.error) throw invoicesRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (buyersRes.error) throw buyersRes.error;

    const buyersMap = {};
    (buyersRes.data || []).forEach(b => {
      buyersMap[b.buyer_id] = b;
    });

    const ordersMap = {};
    (ordersRes.data || []).forEach(o => {
      ordersMap[o.order_number] = o;
    });

    return (invoicesRes.data || []).map(row => {
      const mapped = mapInvoice(row);
      const orderObj = ordersMap[row.sales_order];
      if (orderObj) {
        const buyerObj = buyersMap[orderObj.buyer];
        mapped.sales_orders = {
          order_number: orderObj.order_number,
          buyers: buyerObj ? { company_name: buyerObj.buyer_name } : null
        };
      } else {
        mapped.sales_orders = null;
      }
      return mapped;
    });
  }

  async getById(id) {
    const { data: invoiceRow, error: iErr } = await supabase
      .from('sales_invoices')
      .select('*')
      .eq('invoice_number', id)
      .single();

    if (iErr) throw iErr;
    if (!invoiceRow) return null;

    const mapped = mapInvoice(invoiceRow);

    if (invoiceRow.sales_order) {
      const { data: orderRow } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('order_number', invoiceRow.sales_order)
        .single();
      
      if (orderRow) {
        const orderMapped = {
          id: orderRow.order_number,
          order_number: orderRow.order_number,
          buyer_id: orderRow.buyer || null,
          order_date: orderRow.shipment_date || new Date().toISOString(),
          status: orderRow.status || 'pending',
          total_amount: (orderRow.quantity || 0) * (orderRow.unit_price || 0),
          created_at: orderRow.shipment_date || new Date().toISOString()
        };

        if (orderRow.buyer) {
          const { data: buyerRow } = await supabase
            .from('buyers')
            .select('*')
            .eq('buyer_id', orderRow.buyer)
            .single();
          
          if (buyerRow) {
            orderMapped.buyers = {
              id: buyerRow.buyer_id,
              name: buyerRow.buyer_name,
              email: buyerRow.contact || '',
              phone: '',
              company_name: buyerRow.buyer_name,
              address: buyerRow.country || '',
              created_at: new Date().toISOString()
            };
          }
        }
        mapped.sales_orders = orderMapped;
      }
    }

    return mapped;
  }

  async create(invoiceData) {
    const dbData = unmapInvoice(invoiceData);
    const { data, error } = await supabase
      .from('sales_invoices')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapInvoice(data);
  }

  async update(id, invoiceData) {
    const dbData = unmapInvoice(invoiceData);
    const { data, error } = await supabase
      .from('sales_invoices')
      .update(dbData)
      .eq('invoice_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapInvoice(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .delete()
      .eq('invoice_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapInvoice(data);
  }
}

module.exports = new InvoiceRepository();
