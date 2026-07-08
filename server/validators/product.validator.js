const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).trim().min(1, 'Name cannot be empty'),
  sku: z.string({ required_error: 'Product SKU is required' }).trim().min(1, 'SKU cannot be empty'),
  description: z.string().optional(),
  price: z.number({ required_error: 'Product price is required' }).positive('Price must be greater than zero'),
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
  supplier_id: z.string().optional()
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema
};
