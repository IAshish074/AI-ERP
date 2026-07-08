-- Supabase PostgreSQL Database Schema for AI Native ERP

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buyers Table
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Finished Goods (Products) Table
CREATE TABLE IF NOT EXISTS finished_goods (
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
);

-- 4. Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sales Invoices Table
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tech Packs Table
CREATE TABLE IF NOT EXISTS tech_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES finished_goods(id) ON DELETE CASCADE,
    designer_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_finished_goods_sku ON finished_goods(sku);
CREATE INDEX IF NOT EXISTS idx_finished_goods_color ON finished_goods(color);
CREATE INDEX IF NOT EXISTS idx_sales_orders_buyer ON sales_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_order ON sales_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_tech_packs_product ON tech_packs(product_id);

-- Raw SQL Execution Helper Function for Vanna AI
-- This enables safe execution of generated SELECT queries via the API.
-- SECURITY DEFINER runs the function with database owner privileges.
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if the query is a SELECT query for safety
    IF LOWER(TRIM(sql_query)) NOT LIKE 'select%' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed for execution via Vanna AI.';
    END IF;

    -- Execute query and aggregate results into a JSON array
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || sql_query || ') t' INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise exception so the caller gets the SQL execution error details
        RAISE EXCEPTION 'SQL Execution Error: %', SQLERRM;
END;
$$;
