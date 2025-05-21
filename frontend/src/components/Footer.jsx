import React from 'react'
import {assets} from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='bg-gray-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Logo and Description */}
          <div className='space-y-4'>
            <Link to='/'><img src={assets.logo} className='w-32 sm:w-36' alt=""/></Link>
            <p className='text-sm text-gray-600 max-w-xs'>
              Khám phá thế giới tri thức với bộ sưu tập sách được tuyển chọn của chúng tôi. Từ sách bán chạy đến những cuốn sách quý hiếm, chúng tôi mang những câu chuyện đến với cuộc sống.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Liên Kết Nhanh</h3>
            <ul className='space-y-2'>
              <li><Link to='/' className='text-gray-600 hover:text-gray-900 transition-colors'>Trang Chủ</Link></li>
              <li><Link to='/collection' className='text-gray-600 hover:text-gray-900 transition-colors'>Bộ Sưu Tập</Link></li>
              <li><Link to='/about' className='text-gray-600 hover:text-gray-900 transition-colors'>Giới Thiệu</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Liên Hệ</h3>
            <ul className='space-y-2 text-gray-600'>
              <li className='flex items-center gap-2'>
                <img src={assets.location_icon} className='w-5' alt=""/>
                <span>123 Đường Sách, Thành phố Đọc</span>
              </li>
              <li className='flex items-center gap-2'>
                <img src={assets.phone_icon} className='w-5' alt=""/>
                <span>+84 123 456 789</span>
              </li>
              <li className='flex items-center gap-2'>
                <img src={assets.email_icon} className='w-5' alt=""/>
                <span>lienhe@bookstore.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Bản Tin</h3>
            <p className='text-sm text-gray-600'>Đăng ký nhận bản tin để cập nhật thông tin và ưu đãi đặc biệt.</p>
            <div className='flex gap-2'>
              <input 
                type="email" 
                placeholder='Nhập email của bạn'
                className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-500'
              />
              <button className='bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors'>
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 pt-8 border-t border-gray-200'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-sm text-gray-600'>
              © 2024 BookStore. Bảo lưu mọi quyền.
            </p>
            <div className='flex gap-6'>
              <a href="#" className='text-gray-600 hover:text-gray-900 transition-colors'>
                <img src={assets.facebook_icon} className='w-5' alt=""/>
              </a>
              <a href="#" className='text-gray-600 hover:text-gray-900 transition-colors'>
                <img src={assets.twitter_icon} className='w-5' alt=""/>
              </a>
              <a href="#" className='text-gray-600 hover:text-gray-900 transition-colors'>
                <img src={assets.instagram_icon} className='w-5' alt=""/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
