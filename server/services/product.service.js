const productRepository = require('../repositories/product.repository');
const typesense = require('../config/typesense');

class ProductService {
  constructor() {
    this.collectionName = 'finished_goods';
  }

  /**
   * Initializes the Typesense collection for finished_goods if it doesn't exist
   */
  async ensureTypesenseCollection() {
    try {
      const collections = await typesense.collections().retrieve();
      const exists = collections.some(col => col.name === this.collectionName);

      if (!exists) {
        const schema = {
          name: this.collectionName,
          fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'sku', type: 'string', facet: true },
            { name: 'description', type: 'string', optional: true },
            { name: 'price', type: 'float' },
            { name: 'color', type: 'string', facet: true, optional: true },
            { name: 'size', type: 'string', facet: true, optional: true },
            { name: 'quantity', type: 'int32' },
            { name: 'image_vector', type: 'float[]', num_dim: 384, optional: true }
          ]
        };
        await typesense.collections().create(schema);
        console.log(`Typesense collection ${this.collectionName} created.`);
      }
    } catch (error) {
      console.error('Typesense finished_goods collection initialization failed:', error.message);
    }
  }

  /**
   * Syncs a product record to Typesense
   */
  async syncToTypesense(product) {
    try {
      await this.ensureTypesenseCollection();
      
      // Construct a mock 384-dimension vector for testing image search
      // In production, this would be generated using a CLIP or MobileNet model.
      const image_vector = Array(384).fill(0);
      const seedText = `${product.name} ${product.color || ''} ${product.description || ''}`;
      for (let i = 0; i < seedText.length && i < 384; i++) {
        image_vector[i] = seedText.charCodeAt(i) / 255.0;
      }

      const typesenseDoc = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: parseFloat(product.price),
        color: product.color || '',
        size: product.size || '',
        quantity: parseInt(product.quantity, 10),
        image_vector
      };

      await typesense.collections(this.collectionName).documents().upsert(typesenseDoc);
      console.log(`Synced product ${product.sku} to Typesense.`);
    } catch (error) {
      console.error(`Failed to sync product ${product.sku} to Typesense:`, error.message);
    }
  }

  /**
   * Removes a product from Typesense index
   */
  async removeFromTypesense(id) {
    try {
      await typesense.collections(this.collectionName).documents(id).delete();
      console.log(`Deleted product ${id} from Typesense.`);
    } catch (error) {
      console.error(`Failed to delete product ${id} from Typesense:`, error.message);
    }
  }

  async getAllProducts() {
    return await productRepository.getAll();
  }

  async getProductById(id) {
    return await productRepository.getById(id);
  }

  async createProduct(productData) {
    const product = await productRepository.create(productData);
    await this.syncToTypesense(product);
    return product;
  }

  async updateProduct(id, productData) {
    const product = await productRepository.update(id, productData);
    await this.syncToTypesense(product);
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (product && product.id) {
      await this.removeFromTypesense(product.id);
    }
    return product;
  }

  /**
   * Bulk syncs all current finished_goods from Supabase into Typesense
   */
  async syncAllToTypesense() {
    try {
      const products = await productRepository.getAll();
      console.log(`Bulk syncing ${products.length} products to Typesense...`);
      for (const p of products) {
        await this.syncToTypesense(p);
      }
      console.log('Bulk sync completed.');
    } catch (error) {
      console.error('Failed bulk sync:', error.message);
    }
  }
}

module.exports = new ProductService();
