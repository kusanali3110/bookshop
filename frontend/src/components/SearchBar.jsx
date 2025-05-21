import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BookContext';

const SearchBar = ({ isVisible, onClose }) => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { books } = useBooks();

    useEffect(() => {
        if (search.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = books.filter(book => 
            book.name.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase())
        );
        setSearchResults(results);
    }, [search, books]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleResultClick = (bookId) => {
        setSearch('');
        setSearchResults([]);
        navigate(`/product/${bookId}`);
    };

    return (
        <div className='relative'>
            <div className='relative'>
                <input 
                    value={search} 
                    onChange={handleSearch}
                    className='w-48 outline-none bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                    type="text" 
                    placeholder='Tìm kiếm sách...' 
                />
                <img 
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4' 
                    src={assets.search_icon} 
                    alt="" 
                />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <div className='absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto w-96'>
                    {searchResults.map((book) => (
                        <div
                            key={book._id}
                            onClick={() => handleResultClick(book._id)}
                            className='flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                        >
                            <img 
                                src={book.image} 
                                alt={book.name} 
                                className='w-12 h-16 object-cover rounded'
                            />
                            <div className='flex-1 text-left'>
                                <h3 className='font-medium text-gray-900'>{book.name}</h3>
                                <p className='text-sm text-gray-600'>Tác giả: {book.author}</p>
                                <p className='text-sm text-blue-600 font-medium'>
                                    {book.price.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar
