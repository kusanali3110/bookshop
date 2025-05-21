import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { API_URLS } from '../config/api';

const CollectionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Collection />
    </div>
  );
};

export default CollectionPage;
