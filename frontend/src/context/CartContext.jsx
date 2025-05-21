import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URLS } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch(API_URLS.CART.GET, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const cartItems = Array.isArray(data.data) ? data.data : 
                          (data.data?.items || []);
          setCartItems(cartItems);
        } else {
          setCartItems([]);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setCartItems([]);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      }

      const response = await fetch(API_URLS.CART.ADD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookID: bookId,
          quantity: quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm sách vào giỏ hàng');
      }

      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (cartId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
      }

      const response = await fetch(API_URLS.CART.UPDATE(cartId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật giỏ hàng');
      }

      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xóa sách khỏi giỏ hàng');
      }

      const response = await fetch(API_URLS.CART.REMOVE(cartId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa sách khỏi giỏ hàng');
      }

      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xóa giỏ hàng');
      }

      const response = await fetch(API_URLS.CART.DELETE, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa giỏ hàng');
      }

      const data = await response.json();
      if (data.success) {
        setCartItems([]);
        return data;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((count, item) => {
      const quantity = Number(item.quantity) || 0;
      return count + quantity;
    }, 0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cartItems,
    setCartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 