const Typesense = require('typesense');
require('dotenv').config();

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108', 10),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http'
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 5
});

module.exports = client;
