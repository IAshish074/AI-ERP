# AI Native ERP Backend

This is the production-ready backend for the AI Native ERP system. It uses **Express.js**, **Supabase PostgreSQL**, **OpenRouter (LLM)**, and **Typesense (Vector Search)** to power both traditional ERP features and advanced AI capabilities like natural language database queries (Text-to-SQL) and semantic/visual product searches.

---

## Folder Structure

```
server/
├── config/
│   ├── openrouter.js      # OpenRouter (OpenAI SDK configuration)
│   ├── schema.sql         # SQL script to initialize Database tables & RPC functions
│   ├── supabase.js        # Supabase JS client configuration
│   ├── typesense.js       # Typesense client configuration
│   └── vanna.js           # Custom Vanna client implementing Text-to-SQL RAG
├── controllers/
│   ├── ai.controller.js
│   ├── buyer.controller.js
│   ├── dashboard.controller.js
│   ├── image.controller.js
│   ├── invoice.controller.js
│   ├── order.controller.js
│   └── product.controller.js
├── services/
│   ├── ai.service.js
│   ├── buyer.service.js
│   ├── dashboard.service.js
│   ├── image.service.js
│   ├── invoice.service.js
│   ├── order.service.js
│   └── product.service.js
├── repositories/
│   ├── buyer.repository.js
│   ├── dashboard.repository.js
│   ├── invoice.repository.js
│   ├── order.repository.js
│   ├── product.repository.js
│   ├── supplier.repository.js
│   └── techpack.repository.js
├── routes/
│   ├── ai.routes.js
│   ├── buyer.routes.js
│   ├── dashboard.routes.js
│   ├── index.js
│   ├── image.routes.js
│   ├── invoice.routes.js
│   ├── order.routes.js
│   └── product.routes.js
├── middlewares/
│   ├── error.middleware.js
│   ├── upload.middleware.js
│   └── validation.middleware.js
├── validators/
│   ├── ai.validator.js
│   └── product.validator.js
├── utils/
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   ├── constants.js
│   └── logger.js
├── prompts/
│   └── sql.prompt.js
├── ai/
│   ├── trainVanna.js       # Executable Vanna training script
│   ├── generateSQL.js      # Generates SQL query from question
│   ├── executeSQL.js       # Executes SELECT queries on Supabase
│   └── answerGenerator.js  # Formulates natural language responses from data
├── uploads/                # Local uploaded files storage
├── vanna-js/               # Local Vanna JS package link shim
├── app.js                  # Express app setup and middleware configuration
├── server.js               # Entry point listening on Port
├── .env                    # System environment variables (gitignored)
└── .env.example            # Environment variables template
```

---

## Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Supabase Account** (PostgreSQL instance)
- **OpenRouter API Key** (to access LLM models)
- **Typesense Cloud or Local instance** (for vector/text search)

### 2. Install Dependencies
Navigate to the `server/` directory and run:
```bash
npm install
```
*Note: This will also link the local `vanna` adapter library automatically.*

### 3. Database Initialization
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of [`server/config/schema.sql`](file:///Users/ashishkumarmishra/Desktop/wfx/server/config/schema.sql) and paste them into the SQL editor.
3. Click **Run**. This will create the required tables (`buyers`, `suppliers`, `finished_goods`, `sales_orders`, `sales_invoices`, `tech_packs`), add standard indexes, and define the security-restricted `exec_sql` RPC function needed for Vanna to execute generated SELECT queries.

### 4. Configuration (.env)
Create a `.env` file in the `server/` root directory based on [`.env.example`](file:///Users/ashishkumarmishra/Desktop/wfx/server//.env.example):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter Credentials
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini

# Typesense Credentials
TYPESENSE_HOST=your-typesense-host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-typesense-api-key

# JWT Secret & Upload Path
JWT_SECRET=supersecretkey
UPLOAD_PATH=server/uploads
```

---

## Run Commands

### 1. Train Vanna (AI Engine)
Before asking natural language questions, you need to train Vanna so it learns the database schema, rules, and SQL examples. Run:
```bash
npm run train
```
This runs [`server/ai/trainVanna.js`](file:///Users/ashishkumarmishra/Desktop/wfx/server/ai/trainVanna.js), which converts table DDLs, comments, and SQL examples into vector embeddings and indexes them in Typesense.

### 2. Run Local Development Server
To start the backend with automatic hot-reloads:
```bash
npm run dev
```

### 3. Run Production Server
```bash
npm start
```

---

## API Documentation

All routes are mounted under `/api`.

### Dashboard
- **`GET /api/dashboard`**: Returns summary counts of buyers, suppliers, products, and sales totals (invoice paid/unpaid values).

### Buyers
- **`GET /api/buyers`**: List all buyers.
- **`GET /api/buyers/:id`**: Get single buyer.
- **`POST /api/buyers`**: Create a buyer.
- **`PUT /api/buyers/:id`**: Update a buyer.
- **`DELETE /api/buyers/:id`**: Delete a buyer.

### Suppliers
- **`GET /api/suppliers`**: List all suppliers.
- **`GET /api/suppliers/:id`**: Get single supplier.
- **`POST /api/suppliers`**: Create a supplier.
- **`PUT /api/suppliers/:id`**: Update a supplier.
- **`DELETE /api/suppliers/:id`**: Delete a supplier.

### Products (Finished Goods)
- **`GET /api/products`**: List all products.
- **`GET /api/products/:id`**: Get single product details.
- **`POST /api/products`**: Create a product (auto-syncs to Typesense).
- **`PUT /api/products/:id`**: Update a product (auto-syncs to Typesense).
- **`DELETE /api/products/:id`**: Delete a product (removes from Typesense).
- **`POST /api/products/sync`**: Bulk re-syncs all products from Supabase to Typesense.

### Orders
- **`GET /api/orders`**: List all sales orders.
- **`GET /api/orders/:id`**: Get single order details.
- **`POST /api/orders`**: Create order.
- **`PUT /api/orders/:id`**: Update order status/info.
- **`DELETE /api/orders/:id`**: Delete order.

### Invoices
- **`GET /api/invoices`**: List all invoices.
- **`GET /api/invoices/:id`**: Get single invoice details.
- **`POST /api/invoices`**: Create invoice.
- **`PUT /api/invoices/:id`**: Update invoice details.
- **`DELETE /api/invoices/:id`**: Delete invoice.

### AI Natural Language Database Query (Text-to-SQL)
- **`POST /api/ask`**
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "question": "Show all black hoodies under ₹900"
    }
    ```
  - **Response**:
    ```json
    {
      "question": "Show all black hoodies under ₹900",
      "generatedSQL": "SELECT * FROM finished_goods WHERE color ILIKE 'black' AND name ILIKE '%hoodie%' AND price < 900;",
      "rows": [
        {
          "id": "5f8a25c7-2d1b-4f9e-bc43-23df21c810d2",
          "name": "Premium Black Hoodie",
          "sku": "SKU-BH-001",
          "description": "Comfy cotton hoodie",
          "price": 850,
          "color": "black",
          "size": "L",
          "quantity": 100,
          "supplier_id": "...",
          "created_at": "..."
        }
      ],
      "answer": "There is 1 black hoodie under ₹900: the Premium Black Hoodie (SKU-BH-001) priced at ₹850."
    }
    ```

### AI Visual Product Search
- **`POST /api/image-search`**
  - **Headers**: `Content-Type: multipart/form-data`
  - **Body (form-data)**:
    - `image`: [File Upload (Image)]
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Image search completed successfully",
      "data": {
        "detectedProduct": {
          "category": "hoodie",
          "color": "black",
          "keywords": ["black", "hoodie", "fleece"]
        },
        "searchQuery": "black hoodie black hoodie fleece",
        "results": [
          {
            "id": "...",
            "name": "Premium Black Hoodie",
            "sku": "SKU-BH-001",
            "price": 850,
            "color": "black",
            "search_score": 100
          }
        ]
      }
    }
    ```

---

## Deployment Guide

### Deploying to Production (Render/Heroku/DigitalOcean)
1. **Set Environment Variables**: In your cloud platform settings, copy all variables from `.env` (make sure `NODE_ENV=production`).
2. **Execute Database Setup**: Ensure you run the `schema.sql` inside your production Supabase database instance.
3. **Build Hook / Start Command**:
   - Start Command: `npm start`
4. **Trigger Vanna Training**: Once deployed, run `npm run train` or call `/api/products/sync` to pre-seed the training context and Typesense indices.
