import React from 'react';
import dacnLogo from '../assets/dacn_logo.png';

const IntroSection = () => (
  <section className="bg-gradient-to-r from-blue-50 to-white py-10 mb-8 font-vi">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-4">Chào mừng bạn đến với BookShop!</h1>
        <p className="text-gray-700 text-lg mb-4 max-w-xl">
          BookShop là nơi bạn dễ dàng khám phá, tìm kiếm và mua sắm hàng ngàn đầu sách đa dạng. Chúng tôi cam kết mang đến trải nghiệm mua sách trực tuyến hiện đại, tiện lợi và giá tốt nhất cho bạn.
        </p>
        <ul className="text-gray-600 text-base mb-4 list-disc list-inside">
          <li>Kho sách phong phú: Văn học, thiếu nhi, kỹ năng sống, ngoại ngữ...</li>
          <li>Giao diện thân thiện, dễ sử dụng trên mọi thiết bị</li>
          <li>Đăng nhập, quản lý đơn hàng, giỏ hàng tiện lợi</li>
        </ul>
        <p className="text-blue-700 font-semibold">Khám phá bộ sưu tập mới nhất bên dưới!</p>
      </div>
      <div className="flex-1 flex justify-center">
        <img 
          src={dacnLogo} 
          alt="DACN BookShop Logo" 
          className="w-72 h-72 object-contain rounded-xl shadow-lg hidden md:block hover:scale-105 transition-transform duration-300" 
        />
      </div>
    </div>
  </section>
);

export default IntroSection; 