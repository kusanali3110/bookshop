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

const TagFilter = ({ tags, selectedTags, onTagChange }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-4">Thể loại</h3>
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedTags.length === 0
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tất cả
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedTags.includes(tag)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

const PageControls = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 4) {
        endPage = 5;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      if (startPage > 2) {
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
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

const Collection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const limit = 12;

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return '/no-image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    const cleanPath = imageUrl.replace(/^\/+|\/+$/g, '');
    const baseUrl = API_URLS.BOOK.LIST.replace(/\/+$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URLS.BOOK.LIST}tags`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách thể loại');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(API_URLS.BOOK.LIST);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (selectedTags.length > 0) {
        url.searchParams.append('tags', selectedTags.join(','));
      }

      const response = await fetch(url);
      
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
          tags: book.tags || []
        }));

      setBooks(processedBooks);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (tag) => {
    setSelectedTags(prevTags => {
      if (tag === '') {
        return [];
      }
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      }
      return [...prevTags, tag];
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, selectedTags]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Bộ Sưu Tập</h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <TagFilter
            tags={tags}
            selectedTags={selectedTags}
            onTagChange={handleTagChange}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
};

export default Collection; 