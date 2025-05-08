import React, { useState } from 'react'
import axios from 'axios'

const Login = () => {

  const [currentState, setCurrentState] = useState('Đăng Ký');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmmitHandler = async (event) => {
    event.preventDefault();
    if (currentState === 'Đăng Ký') {
      try {
        const url = 'http://2hbookshopproject.site/api/auth/register';
        const payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        const response = await axios.post(url, payload);
        console.log('Response:', response.data);
        alert('Đăng Ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản!');
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        alert('Đăng Ký thất bại!');
      }
    }
    else if (currentState === 'Đăng Nhập') {
      try {
        const url = 'http://2hbookshopproject.site/api/auth/login';
        const payload = {
          username_or_email: formData.username || formData.email,
          password: formData.password,
        };

        const response = await axios.post(url, payload);
        console.log('Response:', response.data);
        alert('Đăng Nhập thành công!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/';
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        alert('Đăng nhập thất bại!');
      }
    }
  }
  
  return (
    <form onSubmit={onSubmmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {currentState === 'Đăng Ký' && (
        <>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='First Name'
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Last Name'
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            required
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Username'
            required
          />
        </>
      )}
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChangeHandler}
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={onChangeHandler}
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Password'
        required
      />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        {currentState === 'Đăng Nhập' ? (
          <p onClick={() => setCurrentState('Đăng Ký')} className='cursor-pointer'>Tạo Tài Khoản</p>
        ) : (
          <p onClick={() => setCurrentState('Đăng Nhập')} className='cursor-pointer'>Đăng nhập ở đây</p>
        )}
      </div>
      <button className='bg-black text-white font-light px-8 py-2 mt-4'>
        {currentState === 'Đăng Nhập' ? 'Đăng Nhập' : 'Đăng Ký'}
      </button>
    </form>
  );
}

export default Login
