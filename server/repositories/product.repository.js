const supabase = require('../config/supabase');

const mapProduct = (row) => {
  if (!row) return null;
  return {
    id: row.style_number,
    sku: row.style_number,
    name: row.style_name,
    description: `${row.fabric || ''} ${row.gsm ? row.gsm + ' GSM' : ''} ${row.print || ''}`.trim(),
    price: row.selling_price || row.cost || 0,
    color: row.color || '',
    size: '',
    quantity: 100, // Default fallback count since table lacks quantity
    supplier_id: row.supplier || null,
    created_at: new Date().toISOString()
  };
};

const unmapProduct = (data) => {
  if (!data) return {};
  const unmapped = {};
  if (data.sku || data.id) unmapped.style_number = data.sku || data.id;
  if (data.name) unmapped.style_name = data.name;
  if (data.price) unmapped.selling_price = parseFloat(data.price);
  if (data.color) unmapped.color = data.color;
  if (data.supplier_id) unmapped.supplier = data.supplier_id;
  return unmapped;
};

class ProductRepository {
  async getAll() {
    const [fgRes, supRes] = await Promise.all([
      supabase.from('finished_goods').select('*'),
      supabase.from('suppliers').select('supplier_id, company_name')
    ]);
    
    if (fgRes.error) throw fgRes.error;
    if (supRes.error) throw supRes.error;

    const suppliersMap = {};
    (supRes.data || []).forEach(s => {
      if (s.company_name) suppliersMap[s.company_name] = s;
      if (s.supplier_id) suppliersMap[s.supplier_id] = s;
    });

    const products = (fgRes.data || []).map(row => {
      const mapped = mapProduct(row);
      const supplierObj = suppliersMap[row.supplier] || suppliersMap[row.supplier_id];
      mapped.suppliers = supplierObj ? { company_name: supplierObj.company_name } : null;
      return mapped;
    });

    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return products;
  }

  async getById(id) {
    const { data: productRow, error: fgErr } = await supabase
      .from('finished_goods')
      .select('*')
      .eq('style_number', id)
      .single();

    if (fgErr) throw fgErr;
    if (!productRow) return null;

    const mapped = mapProduct(productRow);

    if (productRow.supplier) {
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*');
      
      const supplierRow = (suppliers || []).find(s => 
        s.company_name === productRow.supplier || s.supplier_id === productRow.supplier
      );
      
      if (supplierRow) {
        mapped.suppliers = {
          id: supplierRow.supplier_id,
          name: supplierRow.company_name,
          email: supplierRow.contact || '',
          phone: '',
          company_name: supplierRow.company_name,
          address: supplierRow.country || '',
          created_at: new Date().toISOString()
        };
      }
    }

    return mapped;
  }

  async create(productData) {
    const dbData = unmapProduct(productData);
    const { data, error } = await supabase
      .from('finished_goods')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return mapProduct(data);
  }

  async update(id, productData) {
    const dbData = unmapProduct(productData);
    const { data, error } = await supabase
      .from('finished_goods')
      .update(dbData)
      .eq('style_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapProduct(data);
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('finished_goods')
      .delete()
      .eq('style_number', id)
      .select()
      .single();

    if (error) throw error;
    return mapProduct(data);
  }
}

module.exports = new ProductRepository();
