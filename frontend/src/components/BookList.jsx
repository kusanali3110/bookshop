import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { API_URLS } from '../config/api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URLS.BOOK.LIST}?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (data.success) {
          const processedBooks = data.data.map(book => ({
            ...book,
            image: book.imageUrl
              ? book.imageUrl.startsWith('http')
                ? book.imageUrl
                : `${API_URLS.BOOK.LIST}${book.imageUrl}`
              : ''
          }));
          setBooks(processedBooks);
          setTotalPages(data.totalPages || 1);
          setTotalBooks(data.total || 0);
        } else {
          setError(data.message || 'Không thể tải danh sách sách');
        }
      } catch (err) {
        setError('Không thể tải danh sách sách');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [page, limit]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  if (loading) return <div className="py-8 text-center">Đang tải...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Lỗi: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Tất Cả Sách</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="limit" className="text-sm">Sách mỗi trang:</label>
          <select id="limit" value={limit} onChange={handleLimitChange} className="border rounded px-2 py-1">
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
            <option value={32}>32</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <ProductItem
            key={book._id}
            id={book._id}
            name={book.title}
            price={book.price}
            image={book.image}
            author={book.author}
          />
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-2">
        <div className="text-sm text-gray-600">
          Trang {page} / {totalPages} | Tổng: {totalBooks} sách
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrev} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
          <span className="px-2">{page}</span>
          <button onClick={handleNext} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default BookList; 