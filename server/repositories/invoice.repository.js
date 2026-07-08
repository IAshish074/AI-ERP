const supabase = require('../config/supabase');

class InvoiceRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*, sales_orders(order_number, buyers(company_name))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*, sales_orders(*, buyers(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(invoiceData) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, invoiceData) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new InvoiceRepository();
