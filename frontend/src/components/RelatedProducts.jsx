import React from 'react'
import { useBooks } from '../context/BookContext'
import ProductItem from './ProductItem'

const RelatedProducts = () => {
  const { books } = useBooks();
  const relatedProducts = books.slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sách Liên Quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div key={product._id} className="transform hover:scale-105 transition-transform duration-200">
            <ProductItem
              id={product._id}
              name={product.name}
              price={product.price}
              image={product.image}
              author={product.author}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
