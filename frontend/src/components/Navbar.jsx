import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import {Link, NavLink, useNavigate} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { API_URLS } from '../config/api'
import { toast } from 'react-toastify'
import SearchBar from './SearchBar'

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();

  // Hàm lấy giỏ hàng từ server
  const fetchCart = async () => {
    try {
      const response = await fetch(API_URLS.CART.GET, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Lấy giỏ hàng khi component mount và khi đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]); // Reset giỏ hàng khi đăng xuất
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      setCartItems([]); // Reset giỏ hàng khi đăng xuất
      navigate('/');
      toast.success('Đăng xuất thành công!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </nav>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận đăng xuất</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between py-4 font-medium'>
        <Link to='/'><img src={assets.logo} className='w-32 sm:w-36' alt=""/> </Link>
        <ul className='hidden sm:flex gap-8 text-sm text-gray-700 absolute left-1/2 transform -translate-x-1/2'>
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
        </ul>
        <div className='flex items-center gap-6'>
          <SearchBar isVisible={true} onClose={() => {}} />
          <div className='relative group'>
            {isAuthenticated ? (
              <div className='relative'>
                <div className='flex items-center gap-2 cursor-pointer'>
                  <img src={assets.profile_icon} className='w-6 hover:opacity-80' alt="Profile" />
                  <span className='text-sm hidden sm:block'>{user?.first_name || user?.username}</span>
                </div>
                {/* Dropdown menu */}
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'>
                  <Link to='/profile' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                    Thông tin cá nhân
                  </Link>
                  <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to='/login?mode=login' className='hover:text-gray-600 transition-colors'>Đăng nhập</Link>
            )}
          </div>
          {isAuthenticated && (
            <Link to='/cart' className='relative'>
              <img src={assets.cart_icon} className='w-5 min-w-5 hover:opacity-80' alt="" />
              {Array.isArray(cartItems) && cartItems.length > 0 && (
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                  {cartItems.length}
                </p>
              )}
            </Link>
          )}
          <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden hover:opacity-80' alt="" />
        </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar;
