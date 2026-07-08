const supabase = require('../config/supabase');

class OrderRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*, buyers(name, company_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*, buyers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(orderData) {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, orderData) {
    const { data, error } = await supabase
      .from('sales_orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('sales_orders')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new OrderRepository();
