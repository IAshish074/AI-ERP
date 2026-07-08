const supabase = require('../config/supabase');

const mapSupplier = (row) => {
  if (!row) return null;
  return {
    id: row.supplier_id,
    name: row.company_name,
    email: row.contact || '',
    phone: '',
    company_name: row.company_name,
    address: row.country || '',
    created_at: new Date().toISOString()
  };
};

const unmapSupplier = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.id) unmapped.supplier_id = data.id;
  if (data.name || data.company_name) unmapped.company_name = data.name || data.company_name;
  if (data.address) unmapped.country = data.address;
  if (data.email) unmapped.contact = data.email;
  return unmapped;
};

class SupplierRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapSupplier);
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', id)
      .single();

    if (error) throw error;
    return mapSupplier(data);
  }

  async create(supplierData) {
    const dbData = unmapSupplier(supplierData);
    const { data, error } = await supabase
      .from('suppliers')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapSupplier(data);
  }

  async update(id, supplierData) {
    const dbData = unmapSupplier(supplierData);
    const { data, error } = await supabase
      .from('suppliers')
      .update(dbData)
      .eq('supplier_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupplier(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .delete()
      .eq('supplier_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupplier(data);
  }
}

module.exports = new SupplierRepository();
