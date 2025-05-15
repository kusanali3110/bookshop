import React from 'react'
import { useShop } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import Title from './Title';

const CartTotal = () => {
  const { getTotalCartAmount } = useShop();
  const navigate = useNavigate();

  return (
    <div className='w-full bg-white rounded-lg shadow-md p-6'> 
      <div className='text-2xl mb-6'>
        <Title text1={'GIỎ'} text2={'HÀNG'}/>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-4 border-b border-gray-200 pb-4'>
          <p className='flex justify-between text-base text-gray-700'>
            <span>Tạm tính</span>
            <span className='font-medium'>{getTotalCartAmount().toLocaleString('vi-VN')} ₫</span>
          </p>
          <p className='flex justify-between text-base text-gray-700'>
            <span>Phí vận chuyển</span>
            <span className='text-green-600 font-medium'>Miễn phí</span>
          </p>
          <p className='flex justify-between text-base font-semibold text-gray-900'>
            <span>Tổng cộng</span>
            <span className='text-blue-600'>{getTotalCartAmount().toLocaleString('vi-VN')} ₫</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/placeorder')} 
          className='bg-blue-600 text-white py-3 px-4 text-base font-medium hover:bg-blue-700 transition-colors duration-200 rounded-md shadow-sm'
        >
          TIẾN HÀNH THANH TOÁN
        </button>
      </div>
    </div>
  )
}

export default CartTotal
