const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// 1. Create uploads folder if it doesn't exist
const uploadDirName = process.env.UPLOAD_PATH || 'server/uploads';
const uploadPath = path.resolve(process.cwd(), uploadDirName);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  logger.info(`Upload directory created at: ${uploadPath}`);
}

// 2. Global Security and Utility Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiter to prevent brute force and DOS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// 3. Static files hosting for uploaded files
app.use('/uploads', express.static(uploadPath));

// 4. API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 5. Mount API Routes
app.use('/api', routes);

// 6. 404 Route handler for invalid requests
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// 7. Global Error Handler Middleware
app.use(errorMiddleware);

module.exports = app;
