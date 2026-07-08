const supabase = require('../config/supabase');

class SupplierRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new SupplierRepository();
