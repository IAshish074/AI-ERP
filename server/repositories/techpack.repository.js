const supabase = require('../config/supabase');

const mapTechPack = (row) => {
  if (!row) return null;
  return {
    id: row.tech_pack_id,
    product_id: row.style_number || null,
    designer_name: 'Sophia Miller',
    version: '1.0',
    specifications: {
      fabric: row.fabric_details || 'Cotton Fleece',
      construction: row.construction || '',
      care: row.wash_instructions || 'Machine wash cold'
    },
    created_at: new Date().toISOString()
  };
};

const unmapTechPack = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.id) unmapped.tech_pack_id = data.id;
  if (data.product_id) unmapped.style_number = data.product_id;
  if (data.specifications) {
    unmapped.fabric_details = data.specifications.fabric;
    unmapped.construction = data.specifications.construction;
    unmapped.wash_instructions = data.specifications.care;
  }
  return unmapped;
};

class TechPackRepository {
  async getAll() {
    const [tpRes, fgRes] = await Promise.all([
      supabase.from('tech_packs').select('*'),
      supabase.from('finished_goods').select('style_number, style_name')
    ]);

    if (tpRes.error) throw tpRes.error;
    if (fgRes.error) throw fgRes.error;

    const fgMap = {};
    (fgRes.data || []).forEach(fg => {
      fgMap[fg.style_number] = fg;
    });

    return (tpRes.data || []).map(row => {
      const mapped = mapTechPack(row);
      const fgObj = fgMap[row.style_number];
      mapped.finished_goods = fgObj ? { name: fgObj.style_name, sku: fgObj.style_number } : null;
      return mapped;
    });
  }

  async getById(id) {
    const { data: tpRow, error: tpErr } = await supabase
      .from('tech_packs')
      .select('*')
      .eq('tech_pack_id', id)
      .single();

    if (tpErr) throw tpErr;
    if (!tpRow) return null;

    const mapped = mapTechPack(tpRow);

    if (tpRow.style_number) {
      const { data: fgRow } = await supabase
        .from('finished_goods')
        .select('*')
        .eq('style_number', tpRow.style_number)
        .single();
      
      if (fgRow) {
        mapped.finished_goods = {
          id: fgRow.style_number,
          sku: fgRow.style_number,
          name: fgRow.style_name,
          description: `${fgRow.fabric || ''} ${fgRow.gsm ? fgRow.gsm + ' GSM' : ''} ${fgRow.print || ''}`.trim(),
          price: fgRow.selling_price || fgRow.cost || 0,
          color: fgRow.color || '',
          size: '',
          quantity: 100,
          supplier_id: fgRow.supplier || null,
          created_at: new Date().toISOString()
        };
      }
    }

    return mapped;
  }

  async getByProductId(productId) {
    const { data, error } = await supabase
      .from('tech_packs')
      .select('*')
      .eq('style_number', productId);

    if (error) throw error;
    return (data || []).map(mapTechPack);
  }

  async create(techPackData) {
    const dbData = unmapTechPack(techPackData);
    const { data, error } = await supabase
      .from('tech_packs')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapTechPack(data);
  }

  async update(id, techPackData) {
    const dbData = unmapTechPack(techPackData);
    const { data, error } = await supabase
      .from('tech_packs')
      .update(dbData)
      .eq('tech_pack_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTechPack(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('tech_packs')
      .delete()
      .eq('tech_pack_id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTechPack(data);
  }
}

module.exports = new TechPackRepository();
