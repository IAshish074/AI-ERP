const supabase = require('../config/supabase');

const mapBuyer = (row) => {
  if (!row) return null;
  return {
    id: row.buyer_id,
    name: row.buyer_name,
    email: row.contact || '',
    phone: '',
    company_name: row.buyer_name,
    address: row.country || '',
    created_at: new Date().toISOString()
  };
};

const unmapBuyer = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.id) unmapped.buyer_id = data.id;
  if (data.name || data.company_name) unmapped.buyer_name = data.name || data.company_name;
  if (data.address) unmapped.country = data.address;
  if (data.email) unmapped.contact = data.email;
  return unmapped;
};

class BuyerRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('buyer_name', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapBuyer);
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('buyer_id', id)
      .single();

    if (error) throw error;
    return mapBuyer(data);
  }

  async create(buyerData) {
    const dbData = unmapBuyer(buyerData);
    const { data, error } = await supabase
      .from('buyers')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapBuyer(data);
  }

  async update(id, buyerData) {
    const dbData = unmapBuyer(buyerData);
    const { data, error } = await supabase
      .from('buyers')
      .update(dbData)
      .eq('buyer_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBuyer(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('buyers')
      .delete()
      .eq('buyer_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBuyer(data);
  }
}

module.exports = new BuyerRepository();
