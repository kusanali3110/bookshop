import React from 'react'
import { useBooks } from '../context/BookContext'
import Title from './Title'
import ProductItem from './ProductItem'

const BestSeller = () => {
  const { getBestSellers, loading, error } = useBooks();
  const bestSellers = getBestSellers();

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
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
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title text1={'SÁCH'} text2={'BÁN CHẠY'} />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những cuốn sách phổ biến nhất của chúng tôi, được độc giả trên toàn thế giới yêu thích và luôn đứng đầu bảng xếp hạng.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {bestSellers.map((book) => (
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

export default BestSeller
