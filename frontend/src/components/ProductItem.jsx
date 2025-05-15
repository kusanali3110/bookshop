import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URLS } from '../config/api'

const ProductItem = ({ id, image, name, price, author }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="w-full overflow-hidden rounded-lg bg-gray-200 border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-200">
        <div className="aspect-[3/4] relative">
          <img
            src={!imageError && image ? image : '/no-image.png'}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
            onError={handleImageError}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <h3 className="text-sm text-gray-700 line-clamp-2">{name}</h3>
        <p className="mt-1 text-sm text-gray-500">{author}</p>
        <p className="mt-1 text-lg font-medium text-gray-900">
          {price.toLocaleString('vi-VN')} ₫
        </p>
      </div>
    </Link>
  )
}

export default ProductItem
