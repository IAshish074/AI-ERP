const supabase = require('../config/supabase');

class TechPackRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('tech_packs')
      .select('*, finished_goods(name, sku)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('tech_packs')
      .select('*, finished_goods(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getByProductId(productId) {
    const { data, error } = await supabase
      .from('tech_packs')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  async create(techPackData) {
    const { data, error } = await supabase
      .from('tech_packs')
      .insert([techPackData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, techPackData) {
    const { data, error } = await supabase
      .from('tech_packs')
      .update(techPackData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('tech_packs')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new TechPackRepository();
