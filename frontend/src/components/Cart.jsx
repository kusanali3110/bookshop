import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URLS } from '../config/api';

// Components
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setLoading(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={item.image || '/no-image.png'}
          alt={item.name}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          <Link to={`/product/${item.id}`} className="hover:text-blue-600 transition-colors">
            {item.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">{item.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={loading || quantity <= 1}
              className="p-1 rounded-l border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              disabled={loading}
              className="w-12 text-center border-t border-b focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={loading || quantity >= 99}
              className="p-1 rounded-r border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-900">
              {(item.price * quantity).toLocaleString('vi-VN')} ₫
            </span>
            <button
              onClick={() => onRemove(item.id)}
              disabled={loading}
              className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ items, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 30000 : 0; // 30,000 VND shipping fee
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng đơn hàng</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính</span>
          <span className="text-gray-900">{subtotal.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span className="text-gray-900">{shipping.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
            <span className="text-lg font-medium text-gray-900">{total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Thanh toán
      </button>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_URLS.CART.GET, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      if (data.success) {
        setCartItems(data.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_URLS.CART.UPDATE}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URLS.CART.REMOVE}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Lỗi: {error}</p>
          <button
            onClick={fetchCartItems}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Giỏ hàng</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/books"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
          <div>
            <CartSummary items={cartItems} onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  );
};

 