import React from 'react'
import { useCart } from '../context/CartContext'
import { assets } from '../assets/assets'

const CartItems = () => {
  const { cartItems, updateCartItem, removeFromCart } = useCart();

  return (
    <div className='flex flex-col gap-4 bg-white rounded-lg shadow-md p-6'>
      {cartItems.map((item) => (
        <div key={item._id} className='flex items-center gap-4 border-b border-gray-100 pb-4 hover:bg-gray-50 transition-colors duration-200 p-2 rounded-md'>
          <img 
            src={item.image} 
            alt={item.name} 
            className='w-24 h-24 object-cover rounded-md shadow-sm'
          />
          <div className='flex-1'>
            <h3 className='font-medium text-gray-800'>{item.name}</h3>
            <p className='text-blue-600 font-medium'>{item.price.toLocaleString('vi-VN')} ₫</p>
            <div className='flex items-center gap-4 mt-2'>
              <input
                type='number'
                min='1'
                value={item.quantity}
                onChange={(e) => updateCartItem(item._id, parseInt(e.target.value))}
                className='w-16 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              />
              <button
                onClick={() => removeFromCart(item._id)}
                className='text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors duration-200'
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CartItems 