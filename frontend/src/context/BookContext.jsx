import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URLS } from '../config/api';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URLS.BOOK.LIST);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Kiểm tra cấu trúc response
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid data format received from server');
      }

      // Cập nhật thông tin phân trang
      setPagination({
        count: result.count || 0,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
        currentPage: result.currentPage || 1
      });

      // Xử lý dữ liệu sách
      const processedBooks = result.data.map(book => ({
        _id: book._id || '',
        name: book.title || '',
        author: book.author || '',
        price: parseFloat(book.price) || 0,
        image: book.imageUrl ? `${API_URLS.BOOK.DETAIL(book._id)}/image` : '',
        description: book.description || '',
        isbn: book.isbn || '',
        publishedDate: book.publishedDate || '',
        tags: book.tags || [],
        quantity: parseInt(book.quantity) || 0,
        createdAt: book.createdAt || '',
        updatedAt: book.updatedAt || ''
      }));

      console.log('Processed books:', processedBooks); // Debug log
      setBooks(processedBooks);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const getLatestBooks = () => {
    if (!Array.isArray(books) || books.length === 0) return [];
    return [...books]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  };

  const getBestSellers = () => {
    if (!Array.isArray(books) || books.length === 0) return [];
    return [...books]
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 4);
  };

  const getBookById = (id) => {
    return books.find(book => book._id === id);
  };

  const value = {
    books,
    loading,
    error,
    pagination,
    getLatestBooks,
    getBestSellers,
    getBookById,
    fetchBooks
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

export default BookContext; 