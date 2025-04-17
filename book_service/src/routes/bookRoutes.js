const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bookController = require('../controllers/bookController');
const Joi = require('joi');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Validation schemas
const bookSchema = Joi.object({
  title: Joi.string().required().max(100),
  author: Joi.string().required().max(100),
  tags: Joi.array().items(Joi.string()).max(10),
  price: Joi.number().required().min(0),
  quantity: Joi.number().integer().min(0),
  description: Joi.string().max(1000),
  isbn: Joi.string().allow('', null),
  publishedDate: Joi.date().allow('', null)
});

// Middleware for validation
const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

// Routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/tags', bookController.getAllTags);
router.post('/', upload.single('image'), validateBook, bookController.createBook);
router.patch('/:id/quantity', bookController.updateQuantity);
router.get('/:id', bookController.getBookById);
router.put('/:id', upload.single('image'), validateBook, bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router; 