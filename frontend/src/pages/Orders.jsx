import React from 'react'
import { useShop } from '../context/ShopContext'
import Title from '../components/Title'
import { API_URLS } from '../config/api'

const Orders = () => {
  const { orders } = useShop();

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <Title text1={'YOUR'} text2={'ORDERS'} />
      {orders.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-xl text-gray-600'>You have no orders yet</p>
        </div>
      ) : (
        <div className='grid gap-6'>
          {orders.map((order, index) => (
            <div key={index} className='border rounded-lg p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium'>Order #{order._id}</h3>
                <p className='text-gray-600'>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className='grid gap-4'>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className='flex items-center gap-4'>
                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover' />
                    <div>
                      <p className='font-medium'>{item.name}</p>
                      <p className='text-gray-600'>Quantity: {item.quantity}</p>
                      <p className='text-gray-600'>Price: {item.price.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 pt-4 border-t'>
                <p className='text-right font-medium'>Total: {order.total.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
