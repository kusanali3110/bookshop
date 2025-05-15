import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { API_URLS } from '../config/api';

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart } = useShop();
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchProductData = async () => {
    try {
      const response = await fetch(API_URLS.BOOK.DETAIL(productId));
      const data = await response.json();
      setProductData(data);
      setImage(data.image[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  if (!productData) {
    return <div className='opacity-0'></div>;
  }

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        <div className='flex-1 flex-col-reverse sm:flex-row flex gap-3'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img 
                key={index}
                onClick={() => setImage(item)} 
                src={item} 
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
                alt="" 
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{productData.price.toLocaleString('vi-VN')} ₫</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Số lượng:</p>
            <div className='flex items-center'>
              <button
                className='px-4 py-2 hover:bg-gray-100'
                onClick={handleDecrement}
              >
                -
              </button>
              <span className='px-4 py-2'>{quantity}</span>
              <button
                className='px-4 py-2 hover:bg-gray-100'
                onClick={handleIncrement}
              >
                +
              </button>
            </div>
          </div>
          <button 
            onClick={() => addToCart({ ...productData, quantity })} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Sách Thật.</p>
            <p>Có thể thanh toán khi nhận hàng.</p>
            <p>Dễ dàng đổi trả và hoàn tiền trong vòng 7 ngày.</p>
          </div>
        </div>
      </div>
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>Đồ Án Chuyên Ngành: Website Bán Sách</p>
        </div>
      </div>
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
}

export default Product
