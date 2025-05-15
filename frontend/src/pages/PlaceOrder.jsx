import React, { useState } from 'react'
import { useShop } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { API_URLS } from '../config/api'

const PlaceOrder = () => {
  const { cartItems, getTotalCartAmount, clearCart } = useShop();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URLS.ORDER.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          total: getTotalCartAmount(),
          shippingInfo: formData
        }),
      });

      if (response.ok) {
        clearCart();
        navigate('/orders');
      } else {
        console.error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <Title text1={'PLACE'} text2={'ORDER'} />
      <form onSubmit={handleSubmit} className='max-w-2xl mx-auto mt-8'>
        <div className='grid gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Full Name</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Phone</label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              required
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Address</label>
            <input
              type='text'
              name='address'
              value={formData.address}
              onChange={handleChange}
              required
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>City</label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>ZIP Code</label>
              <input
                type='text'
                name='zipCode'
                value={formData.zipCode}
                onChange={handleChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black'
              />
            </div>
          </div>
        </div>
        <div className='mt-8'>
          <h3 className='text-lg font-medium mb-4'>Order Summary</h3>
          <div className='border-t pt-4'>
            <div className='flex justify-between mb-2'>
              <span>Subtotal</span>
              <span>{getTotalCartAmount().toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className='flex justify-between font-medium text-lg border-t pt-4 mt-4'>
              <span>Total</span>
              <span>{getTotalCartAmount().toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>
        <button
          type='submit'
          className='mt-8 w-full bg-black text-white py-3 px-4 text-base font-medium hover:bg-gray-800'
        >
          PLACE ORDER
        </button>
      </form>
    </div>
  )
}

export default PlaceOrder
