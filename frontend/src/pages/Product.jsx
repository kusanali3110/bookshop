import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URLS } from '../config/api';
import { toast } from 'react-toastify';

// Components
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi</h2>
      <p className="text-gray-600">{message}</p>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  </div>
);

const NotFoundMessage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h2>
      <p className="text-gray-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
    </div>
  </div>
);

const ProductImage = ({ image, name }) => (
  <div className="w-full md:w-1/2">
    <div className="aspect-[3/4] relative rounded-lg overflow-hidden border border-gray-200">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/no-image.png';
        }}
      />
    </div>
  </div>
);

const ProductInfo = ({ product, quantity, onIncrement, onDecrement, onAddToCart }) => (
  <div className="w-full md:w-1/2">
    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
    <p className="text-gray-600 mb-4">Tác giả: {product.author}</p>
    <p className="text-2xl font-bold text-blue-600 mb-4">
      {product.price.toLocaleString('vi-VN')} ₫
    </p>
    <p className="text-gray-700 mb-6">Mô tả: {product.description}</p>

    <div className="mb-6">
      <p className="text-sm font-medium mb-2">Số lượng:</p>
      <div className="flex items-center">
        <button
          className="px-4 py-2 border border-gray-300 rounded-l hover:bg-gray-100 transition-colors"
          onClick={onDecrement}
        >
          -
        </button>
        <span className="px-4 py-2 border-t border-b border-gray-300">
          {quantity}
        </span>
        <button
          className="px-4 py-2 border border-gray-300 rounded-r hover:bg-gray-100 transition-colors"
          onClick={onIncrement}
        >
          +
        </button>
      </div>
    </div>

    <button
      onClick={() => onAddToCart({ ...product, quantity })}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Thêm vào giỏ hàng
    </button>
  </div>
);

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [productData, setProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return '/no-image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    const cleanPath = imageUrl.replace(/^\/+|\/+$/g, '');
    const baseUrl = API_URLS.BOOK.LIST.replace(/\/+$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const fetchProductData = async () => {
    if (!id) {
      setError('Không tìm thấy ID sản phẩm');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URLS.BOOK.DETAIL(id));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Lỗi ${response.status}: Không thể tải thông tin sản phẩm`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Không thể tải thông tin sản phẩm');
      }

      const processedData = {
        id: data.data._id,
        name: data.data.title,
        price: data.data.price,
        description: data.data.description,
        image: processImageUrl(data.data.imageUrl),
        category: data.data.category,
        subCategory: data.data.subCategory,
        author: data.data.author
      };

      setProductData(processedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      await addToCart(id, quantity);
      toast.success('Đã thêm sách vào giỏ hàng');
    } catch (error) {
      toast.error(error.message || 'Thêm vào giỏ hàng thất bại');
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProductData} />;
  if (!productData) return <NotFoundMessage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <ProductImage image={productData.image} name={productData.name} />
        <ProductInfo
          product={productData}
          quantity={quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}

export default Product
