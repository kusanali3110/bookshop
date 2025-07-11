import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { API_URLS } from '../config/api';

// Components
const LoadingSpinner = () => (
  <div className="py-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="py-8 text-center text-red-600">
    Lỗi: {message}
  </div>
);

const PageControls = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pages.push(1);
      
      // Tính toán các trang ở giữa
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      // Điều chỉnh để luôn hiển thị 7 trang
      if (currentPage <= 4) {
        endPage = 5;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      // Thêm dấu ... nếu cần
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Thêm dấu ... nếu cần
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Luôn hiển thị trang cuối cùng
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="mt-8 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Trang trước"
      >
        &lsaquo;
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-50'
            } transition-colors`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Trang tiếp"
      >
        &rsaquo;
      </button>
    </div>
  );
};

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const limit = 12; // Cố định 12 sách mỗi trang

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return '/no-image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    const cleanPath = imageUrl.replace(/^\/+|\/+$/g, '');
    const baseUrl = API_URLS.BOOK.LIST.replace(/\/+$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URLS.BOOK.LIST}?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Lỗi ${response.status}: Không thể tải danh sách sách`);
      }
      
      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Không thể tải danh sách sách');
      }

      const processedBooks = data.data
        .filter(book => book._id)
        .map(book => ({
          id: book._id,
          title: book.title || '',
          author: book.author || '',
          price: book.price || 0,
          image: processImageUrl(book.imageUrl),
          description: book.description || '',
          category: book.category || '',
          subCategory: book.subCategory || ''
        }));

      setBooks(processedBooks);
      setTotalPages(data.totalPages || 1);
      setTotalBooks(data.total || 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tất Cả Sách</h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <ProductItem
            key={book.id}
            id={book.id}
            name={book.title}
            price={book.price}
            image={book.image}
            author={book.author}
          />
        ))}
      </div>

      <PageControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default BookList; 