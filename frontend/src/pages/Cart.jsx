import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { API_URLS } from '../config/api';
import axios from 'axios';

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateCartItem, getCartTotal, getCartItemCount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Vui lòng đăng nhập để xem giỏ hàng');
    }
  }, [isAuthenticated, navigate]);

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-book.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    const cleanPath = imageUrl.replace(/^\/+|\/+$/g, '');
    return `${API_URLS.BOOK.LIST}${cleanPath}`;
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(cartId, newQuantity);
      toast.success('Cập nhật số lượng thành công');
    } catch (error) {
      toast.error(error.message || 'Cập nhật số lượng thất bại');
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await removeFromCart(cartId);
      toast.success('Xóa sản phẩm khỏi giỏ hàng thành công');
    } catch (error) {
      toast.error(error.message || 'Xóa sản phẩm thất bại');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Xóa giỏ hàng thành công');
    } catch (error) {
      toast.error(error.message || 'Xóa giỏ hàng thất bại');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h2>
        <span className="text-gray-600">Tổng số sản phẩm: {getCartItemCount()}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <span className="text-sm font-medium text-gray-500">Sản phẩm</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium text-gray-500">Đơn giá</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium text-gray-500">Số lượng</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium text-gray-500">Thành tiền</span>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <div key={`cart-item-${index}`} className="p-6">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Thông tin sản phẩm */}
                    <div className="col-span-6 flex items-center">
                      <img
                        src={processImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{item.author}</p>
                      </div>
                    </div>

                    {/* Đơn giá */}
                    <div className="col-span-2 text-center">
                      <span className="text-base text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.price || 0)}
                      </span>
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-base text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Thành tiền và nút xóa */}
                    <div className="col-span-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format((item.price || 0) * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tổng tiền và thanh toán */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tổng đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(getCartTotal())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-gray-900">Miễn phí</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
                  <span className="text-lg font-medium text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(getCartTotal())}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                toast.info('Chức năng thanh toán sẽ sớm được cập nhật!');
              }}
              className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Tiến hành thanh toán
            </button>
            <button
              onClick={() => navigate('/collection')}
              className="mt-3 w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
            <button
              onClick={handleClearCart}
              className="mt-3 w-full border border-red-300 text-red-600 px-6 py-3 rounded-md hover:bg-red-50 transition-colors"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
