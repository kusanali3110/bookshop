import React from 'react'
import { useBooks } from '../context/BookContext'
import Title from './Title'
import ProductItem from './ProductItem'

const LatestCollection = () => {
  const { getLatestBooks, loading, error } = useBooks();
  const latestBooks = getLatestBooks();

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi Tải Sách</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title text1={'BỘ SƯU TẬP'} text2={'MỚI NHẤT'} />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những cuốn sách mới nhất được thêm vào bộ sưu tập của chúng tôi, với những tựa sách mới phát hành và đang thịnh hành.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {latestBooks.map((book) => (
            <ProductItem 
              key={book._id}
              id={book._id}
              name={book.name}
              price={book.price}
              image={book.image}
              author={book.author}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LatestCollection
