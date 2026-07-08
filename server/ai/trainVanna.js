#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vanna = require('../config/vanna');
const supabase = require('../config/supabase');

// Set up detailed schema, documentation, and training SQL examples
const TABLE_DDLS = {
  suppliers: `CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  buyers: `CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  finished_goods: `CREATE TABLE finished_goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    color VARCHAR(50),
    size VARCHAR(20),
    quantity INT NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  sales_orders: `CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  sales_invoices: `CREATE TABLE sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  tech_packs: `CREATE TABLE tech_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES finished_goods(id) ON DELETE CASCADE,
    designer_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`
};

const TABLE_DOCS = {
  suppliers: "The suppliers table stores manufacturer and supplier contact information. It tracks company names, email addresses, phone numbers, and physical addresses.",
  buyers: "The buyers table stores client or purchasing company details. It contains company name, buyer contact person, email address, phone, and billing address.",
  finished_goods: "The finished_goods table tracks inventory items or products. Important columns are 'price' (in Indian Rupees), 'color', 'size', 'quantity' (stock level), and 'sku' (unique stock keeping unit). Products are linked to suppliers via supplier_id.",
  sales_orders: "The sales_orders table represents purchase orders placed by buyers. The status column can be 'pending', 'processing', 'completed', or 'cancelled'. It tracks order dates and total amount.",
  sales_invoices: "The sales_invoices table stores billing invoices linked to orders. It tracks invoice date, due date, outstanding amount_due, and payment status ('unpaid', 'partially_paid', 'paid', 'overdue').",
  tech_packs: "The tech_packs table stores technical specification packages for products designed by designers. It holds designer name, version, and details in the specifications JSONB column."
};

const SQL_EXAMPLES = [
  {
    question: "Show all black hoodies under ₹900",
    sql: "SELECT * FROM finished_goods WHERE color ILIKE 'black' AND name ILIKE '%hoodie%' AND price < 900;"
  },
  {
    question: "How many suppliers do we have in total?",
    sql: "SELECT COUNT(*) FROM suppliers;"
  },
  {
    question: "List finished goods supplied by supplier ABC Corp",
    sql: "SELECT fg.* FROM finished_goods fg JOIN suppliers s ON fg.supplier_id = s.id WHERE s.company_name ILIKE '%ABC Corp%';"
  },
  {
    question: "Show total sales volume (revenue) from completed orders",
    sql: "SELECT SUM(total_amount) as total_revenue FROM sales_orders WHERE status = 'completed';"
  },
  {
    question: "List all unpaid invoices that are past due date",
    sql: "SELECT * FROM sales_invoices WHERE status = 'unpaid' AND due_date < CURRENT_DATE;"
  },
  {
    question: "Who is the designer for SKU-1002?",
    sql: "SELECT tp.designer_name FROM tech_packs tp JOIN finished_goods fg ON tp.product_id = fg.id WHERE fg.sku = 'SKU-1002';"
  },
  {
    question: "Show orders placed by buyer John Doe",
    sql: "SELECT o.* FROM sales_orders o JOIN buyers b ON o.buyer_id = b.id WHERE b.name ILIKE '%John Doe%';"
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
