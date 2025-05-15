import React from 'react'
import { useShop } from '../context/ShopContext'
import CartItems from '../components/CartItems'
import CartTotal from '../components/CartTotal'
import { API_URLS } from '../config/api'

const Cart = () => {
  const { cartItems } = useShop();

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-xl text-gray-600'>Your cart is empty</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <CartItems />
          </div>
          <div>
            <CartTotal />
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
