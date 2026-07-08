#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vanna = require('../config/vanna');
const supabase = require('../config/supabase');

// Set up detailed schema, documentation, and training SQL examples
const TABLE_DDLS = {
  suppliers: `CREATE TABLE suppliers (
    supplier_id VARCHAR PRIMARY KEY,
    company_name VARCHAR NOT NULL,
    country VARCHAR,
    contact VARCHAR,
    lead_time_days INT,
    rating NUMERIC
  );`,
  buyers: `CREATE TABLE buyers (
    buyer_id VARCHAR PRIMARY KEY,
    company_name VARCHAR NOT NULL,
    country VARCHAR,
    buyer_category VARCHAR
  );`,
  finished_goods: `CREATE TABLE finished_goods (
    style_number VARCHAR PRIMARY KEY,
    style_name VARCHAR NOT NULL,
    category VARCHAR,
    fabric VARCHAR,
    gsm INT,
    color VARCHAR,
    print VARCHAR,
    season VARCHAR,
    brand VARCHAR,
    supplier VARCHAR REFERENCES suppliers(supplier_id),
    cost NUMERIC,
    selling_price NUMERIC,
    image_url VARCHAR
  );`,
  sales_orders: `CREATE TABLE sales_orders (
    order_number VARCHAR PRIMARY KEY,
    buyer VARCHAR REFERENCES buyers(buyer_id),
    style_number VARCHAR REFERENCES finished_goods(style_number),
    quantity INT,
    unit_price NUMERIC,
    shipment_date DATE,
    status VARCHAR
  );`,
  sales_invoices: `CREATE TABLE sales_invoices (
    invoice_number VARCHAR PRIMARY KEY,
    sales_order VARCHAR REFERENCES sales_orders(order_number),
    amount NUMERIC,
    currency VARCHAR,
    payment_status VARCHAR
  );`,
  tech_packs: `CREATE TABLE tech_packs (
    tech_pack_id VARCHAR PRIMARY KEY,
    style_number VARCHAR REFERENCES finished_goods(style_number),
    fabric_details TEXT,
    construction TEXT,
    wash_instructions TEXT
  );`
};

const TABLE_DOCS = {
  suppliers: "The suppliers table stores manufacturer and supplier contact information. It tracks company_name, contact person email, country, lead_time_days, and supplier rating.",
  buyers: "The buyers table stores client or purchasing company details. It contains company_name, country, contact email, and buyer_category.",
  finished_goods: "The finished_goods table tracks inventory items or products. Important columns are 'style_number' (unique identifier/SKU), 'style_name' (name of the product), 'selling_price' (price in Indian Rupees), 'color', 'fabric' composition, 'gsm' (fabric weight), 'cost', and 'category'. Products are linked to suppliers via the 'supplier' column.",
  sales_orders: "The sales_orders table represents purchase orders placed by buyers. It tracks order_number, buyer (points to buyer_id), style_number, quantity, unit_price, shipment_date, and status.",
  sales_invoices: "The sales_invoices table stores billing invoices linked to orders. It tracks invoice_number, sales_order (points to order_number), amount, currency, and payment_status.",
  tech_packs: "The tech_packs table stores technical specification packages for products. It holds tech_pack_id, style_number, fabric_details, construction details, and wash_instructions."
};

const SQL_EXAMPLES = [
  {
    question: "Show all black hoodies under ₹900",
    sql: "SELECT * FROM finished_goods WHERE color ILIKE 'black' AND category ILIKE '%hoodie%' AND selling_price < 900;"
  },
  {
    question: "How many suppliers do we have in total?",
    sql: "SELECT COUNT(*) FROM suppliers;"
  },
  {
    question: "List finished goods supplied by supplier ABC Corp",
    sql: "SELECT fg.* FROM finished_goods fg JOIN suppliers s ON fg.supplier = s.supplier_id WHERE s.company_name ILIKE '%ABC Corp%';"
  },
  {
    question: "Show total sales volume (revenue) from completed orders",
    sql: "SELECT SUM(quantity * unit_price) as total_revenue FROM sales_orders WHERE status ILIKE 'completed' OR status ILIKE 'delivered';"
  },
  {
    question: "List all unpaid invoices",
    sql: "SELECT * FROM sales_invoices WHERE payment_status ILIKE 'unpaid' OR payment_status ILIKE 'pending';"
  },
  {
    question: "Show orders placed by buyer John Doe",
    sql: "SELECT o.* FROM sales_orders o JOIN buyers b ON o.buyer = b.buyer_id WHERE b.company_name ILIKE '%John Doe%';"
  }
];

async function runTraining() {
  console.log('--- Starting Vanna AI Training Script ---');

  // 1. Initialize Typesense collection
  console.log('Initializing Typesense collections...');
  await vanna.initializeCollections();

  // 2. Fetch schema or verify tables in Supabase
  console.log('Verifying connection to Supabase and checking schema...');
  try {
    // Attempt to select from finished_goods
    const { error } = await supabase.from('finished_goods').select('id').limit(1);
    if (error && error.code === 'P0001') {
      console.log('Database tables might be empty or missing. Please execute config/schema.sql in your Supabase SQL editor.');
    } else if (error) {
      console.warn('Database connection warning:', error.message);
    } else {
      console.log('Database connected successfully and tables found!');
    }
  } catch (err) {
    console.error('Error connecting to database:', err.message);
  }

  // 3. Train DDL
  console.log('\nTraining DDL schemas...');
  for (const [table, ddl] of Object.entries(TABLE_DDLS)) {
    console.log(`Training DDL for: ${table}`);
    await vanna.train({
      type: 'ddl',
      content: ddl,
      metadata: { table }
    });
  }

  // 4. Train Documentation
  console.log('\nTraining documentation...');
  for (const [table, doc] of Object.entries(TABLE_DOCS)) {
    console.log(`Training doc for: ${table}`);
    await vanna.train({
      type: 'doc',
      content: doc,
      metadata: { table }
    });
  }

  // 5. Train SQL examples
  console.log('\nTraining SQL examples...');
  for (const example of SQL_EXAMPLES) {
    console.log(`Training SQL: "${example.question}"`);
    await vanna.train({
      type: 'sql',
      content: example.sql,
      metadata: { question: example.question }
    });
  }

  console.log('\n--- Vanna AI Training Completed Successfully! ---');
  process.exit(0);
}

runTraining().catch(err => {
  console.error('Training script crashed:', err);
  process.exit(1);
});
