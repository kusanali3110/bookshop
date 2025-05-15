import React from 'react'
import IntroSection from '../components/IntroSection'
import BookList from '../components/BookList'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import { API_URLS } from '../config/api'

const Home = () => {
  return (
    <div>
      <IntroSection />
      <LatestCollection />
      <BestSeller/>
      <BookList/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
