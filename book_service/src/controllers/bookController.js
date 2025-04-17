const Book = require('../models/Book');
const path = require('path');
const fs = require('fs').promises;

// Get all books with pagination and filtering
exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter based on query parameters
    const filter = {};
    if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };
    if (req.query.author) filter.author = { $regex: req.query.author, $options: 'i' };
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.query.minPrice) filter.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
    
    // Execute query with pagination and exclude __v field
    const books = await Book.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Book.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

// Get all unique tags
exports.getAllTags = async (req, res) => {
  try {
    // Use MongoDB's distinct operation to get all unique tags
    const tags = await Book.distinct('tags');
    
    // Sort tags alphabetically
    const sortedTags = tags.sort();
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: sortedTags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('-__v');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    // Handle image upload if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Create new book with image URL if available
    const book = new Book({
      ...req.body,
      imageUrl
    });
    
    // Save the book
    const savedBook = await book.save();
    
    // Remove __v field from response
    const bookResponse = savedBook.toObject();
    delete bookResponse.__v;
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: bookResponse
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    // Find the book first
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Handle image upload if present
    let imageUrl = book.imageUrl;
    if (req.file) {
      // Delete old image if exists
      if (book.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', book.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Update book with new data and image URL if available
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, imageUrl },
      { new: true, runValidators: true }
    ).select('-__v');
    
    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    // Find the book first
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Delete image if exists
    if (book.imageUrl) {
      const imagePath = path.join(__dirname, '../../', book.imageUrl);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    // Delete the book
    await Book.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

// Search books by text
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const books = await Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .select('-__v')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching books',
      error: error.message
    });
  }
};

// Update book quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }
    
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Book quantity updated successfully',
      data: book
    });
  } catch (error) {
    console.error('Error updating book quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book quantity',
      error: error.message
    });
  }
}; 