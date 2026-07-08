const supabase = require('../config/supabase');

class BuyerRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(buyerData) {
    const { data, error } = await supabase
      .from('buyers')
      .insert([buyerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, buyerData) {
    const { data, error } = await supabase
      .from('buyers')
      .update(buyerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('buyers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new BuyerRepository();
