const supabase = require('../config/supabase');

const mapOrder = (row) => {
  if (!row) return null;
  return {
    id: row.order_number,
    order_number: row.order_number,
    buyer_id: row.buyer || null,
    order_date: row.shipment_date || new Date().toISOString(),
    status: row.status || 'pending',
    total_amount: (row.quantity || 0) * (row.unit_price || 0),
    created_at: row.shipment_date || new Date().toISOString()
  };
};

const unmapOrder = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.order_number || data.id) unmapped.order_number = data.order_number || data.id;
  if (data.buyer_id) unmapped.buyer = data.buyer_id;
  if (data.order_date) unmapped.shipment_date = data.order_date;
  if (data.status) unmapped.status = data.status;
  return unmapped;
};

class OrderRepository {
  async getAll() {
    const [ordersRes, buyersRes] = await Promise.all([
      supabase.from('sales_orders').select('*'),
      supabase.from('buyers').select('buyer_id, buyer_name')
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (buyersRes.error) throw buyersRes.error;

    const buyersMap = {};
    (buyersRes.data || []).forEach(b => {
      buyersMap[b.buyer_id] = b;
    });

    const orders = (ordersRes.data || []).map(row => {
      const mapped = mapOrder(row);
      const buyerObj = buyersMap[row.buyer];
      mapped.buyers = buyerObj ? { name: buyerObj.buyer_name, company_name: buyerObj.buyer_name } : null;
      return mapped;
    });

    return orders;
  }

  async getById(id) {
    const { data: orderRow, error: oErr } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('order_number', id)
      .single();

    if (oErr) throw oErr;
    if (!orderRow) return null;

    const mapped = mapOrder(orderRow);

    if (orderRow.buyer) {
      const { data: buyerRow } = await supabase
        .from('buyers')
        .select('*')
        .eq('buyer_id', orderRow.buyer)
        .single();
      
      if (buyerRow) {
        mapped.buyers = {
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

    return mapped;
  }

  async create(orderData) {
    const dbData = unmapOrder(orderData);
    const { data, error } = await supabase
      .from('sales_orders')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapOrder(data);
  }

  async update(id, orderData) {
    const dbData = unmapOrder(orderData);
    const { data, error } = await supabase
      .from('sales_orders')
      .update(dbData)
      .eq('order_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapOrder(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('sales_orders')
      .delete()
      .eq('order_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapOrder(data);
  }
}

module.exports = new OrderRepository();
