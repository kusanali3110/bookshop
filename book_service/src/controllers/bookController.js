const Book = require('../models/Book');
const path = require('path');
const fs = require('fs').promises;

// Get all books with pagination and filtering
exports.getAllBooks = async (req, res) => {
  try {
    const {
      title,
      author,
      tags,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      isbn,
      publishedDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};

    // Text search
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (isbn) filter.isbn = { $regex: isbn, $options: 'i' };

    // Array search
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Numeric range search
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = parseInt(minQuantity);
      if (maxQuantity) filter.quantity.$lte = parseInt(maxQuantity);
    }

    // Date search
    if (publishedDate) {
      const date = new Date(publishedDate);
      if (!isNaN(date.getTime())) {
        filter.publishedDate = date;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const books = await Book.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
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

// Upload image and return URL
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Return the image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
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
    } else if (req.body.imageUrl) {
      // Use provided imageUrl if no file was uploaded
      imageUrl = req.body.imageUrl;
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
    } else if (req.body.imageUrl && req.body.imageUrl !== book.imageUrl) {
      // Use new imageUrl if provided and different from current
      imageUrl = req.body.imageUrl;
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