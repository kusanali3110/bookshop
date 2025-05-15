import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import {Link, NavLink} from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount } = useShop();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center justify-between py-4 font-medium'>
        <Link to='/'><img src={assets.logo} className='w-32 sm:w-36' alt=""/> </Link>
        <ul className='hidden sm:flex gap-8 text-sm text-gray-700'>
          <NavLink to='/' className='flex flex-col items-center gap-1 hover:text-gray-900'>
            <p>TRANG CHỦ</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden group-hover:block' />
          </NavLink>
          <NavLink to='/collection' className='flex flex-col items-center gap-1 hover:text-gray-900'>
            <p>BỘ SƯU TẬP</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden group-hover:block' />
          </NavLink>
          <NavLink to='/about' className='flex flex-col items-center gap-1 hover:text-gray-900'>
            <p>GIỚI THIỆU</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden group-hover:block' />
          </NavLink>
          <NavLink to='/contact' className='flex flex-col items-center gap-1 hover:text-gray-900'>
            <p>LIÊN HỆ</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden group-hover:block' />
          </NavLink>
        </ul>
        <div className='flex items-center gap-6'>
          <img onClick={()=>setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer hover:opacity-80' alt="" />
          <div className='group relative'>
            {isAuthenticated ? (
              <div className='flex items-center gap-6'>
                <span className='text-sm'>Xin chào, {user?.first_name || user?.username}</span>
                <Link to='/cart' className='hover:text-gray-600 transition-colors'>Giỏ hàng</Link>
                <Link to='/orders' className='hover:text-gray-600 transition-colors'>Đơn hàng</Link>
                <button 
                  onClick={logout}
                  className='hover:text-gray-600 transition-colors'
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to='/login?mode=login' className='hover:text-gray-600 transition-colors'>Đăng nhập</Link>
            )}
          </div>
          <Link to='/cart' className='relative'>
            <img src={assets.cart_icon} className='w-5 min-w-5 hover:opacity-80' alt="" />
            <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
          </Link>
          <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden hover:opacity-80' alt="" />
        </div>
        {/* Sidebar for small screens */}
        <div className={`fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex flex-col text-gray-600 h-full'>
            <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-4 cursor-pointer border-b'>
              <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
              <p>Quay lại</p>
            </div>
            <div className='flex flex-col'>
              <NavLink onClick={()=>setVisible(false)} className='py-3 px-6 border-b hover:bg-gray-50' to='/'>TRANG CHỦ</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-3 px-6 border-b hover:bg-gray-50' to='/collection'>BỘ SƯU TẬP</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-3 px-6 border-b hover:bg-gray-50' to='/about'>GIỚI THIỆU</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-3 px-6 border-b hover:bg-gray-50' to='/contact'>LIÊN HỆ</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
