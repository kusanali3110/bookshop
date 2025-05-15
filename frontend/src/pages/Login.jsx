import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URLS } from '../config/api'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [currentState, setCurrentState] = useState('Đăng Nhập');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
  });
  const [error, setError] = useState('');

  // Set initial state based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'register') {
      setCurrentState('Đăng Ký');
    } else {
      setCurrentState('Đăng Nhập');
    }
  }, [location]);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };
  
  const onSubmmitHandler = async (event) => {
    event.preventDefault();
    setError('');

    if (currentState === 'Đăng Ký') {
      try {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        const response = await axios.post(API_URLS.AUTH.REGISTER, payload);
        console.log('Response:', response.data);
        alert('Đăng Ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản!');
        setCurrentState('Đăng Nhập'); // Switch to login after successful registration
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        setError(error.response?.data?.detail || 'Đăng Ký thất bại!');
      }
    }
    else if (currentState === 'Đăng Nhập') {
      try {
        const payload = {
          email: formData.email, // Can be email or username
          password: formData.password,
        };

        const response = await axios.post(API_URLS.AUTH.LOGIN, payload);
        console.log('Response:', response.data);
        
        // Get user info
        const userResponse = await axios.get(API_URLS.AUTH.ME, {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          }
        });
        
        // Use AuthContext to handle login
        login(userResponse.data, response.data.access_token);
        
        alert('Đăng Nhập thành công!');
        navigate('/'); // Use navigate instead of window.location
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.status === 403) {
          setError('Email chưa được xác nhận. Vui lòng kiểm tra email của bạn!');
        } else {
          setError(error.response?.data?.detail || 'Đăng nhập thất bại!');
        }
      }
    }
  }
  
  return (
    <form onSubmit={onSubmmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      
      {error && (
        <div className='w-full p-2 text-red-600 text-sm bg-red-100 rounded'>
          {error}
        </div>
      )}

      {currentState === 'Đăng Ký' && (
        <>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='First Name'
            required
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
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
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={onChangeHandler}
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Date of Birth'
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
          <p onClick={() => setCurrentState('Đăng Ký')} className='cursor-pointer hover:text-gray-600'>Tạo Tài Khoản</p>
        ) : (
          <p onClick={() => setCurrentState('Đăng Nhập')} className='cursor-pointer hover:text-gray-600'>Đăng nhập ở đây</p>
        )}
      </div>
      <button className='bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 transition-colors'>
        {currentState === 'Đăng Nhập' ? 'Đăng Nhập' : 'Đăng Ký'}
      </button>
    </form>
  );
}

export default Login
