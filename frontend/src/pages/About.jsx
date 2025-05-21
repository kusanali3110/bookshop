import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { API_URLS } from '../config/api'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
      <Title text1={'GIỚI '} text2={'THIỆU'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>

          <p>Đồ Án Chuyên Ngành: Ứng dụng GitOps trong việc triển khai ứng dụng web dưới dạng microservices trên nền tảng Kubernetes </p>
          <p>22520501: Dương Quốc Hưng & 22520438: Nguyễn Đăng Minh Hiếu</p>
          <p>Giảng viên hướng dẫn: ThS. Lê Anh Tuấn</p>
          <p>Trang web được làm ra với mục đích học tập, dữ liệu sách chỉ là dữ liệu mô phỏng. Không sử dụng với mục đích thương mại.</p>
        </div>
      </div>
    </div>
  )
}

export default About
