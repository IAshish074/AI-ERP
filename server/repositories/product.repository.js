const supabase = require('../config/supabase');

class ProductRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('finished_goods')
      .select('*, suppliers(company_name)')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('finished_goods')
      .select('*, suppliers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(productData) {
    const { data, error } = await supabase
      .from('finished_goods')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, productData) {
    const { data, error } = await supabase
      .from('finished_goods')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('finished_goods')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new ProductRepository();
