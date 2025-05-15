import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookProvider } from './context/BookContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import About from './pages/About'
import Contact from './pages/Contact'
import PlaceOrder from './pages/PlaceOrder'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <BookProvider>
        <div className="min-h-screen bg-white">
          <ToastContainer />
          <Navbar />
          <SearchBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/place-order" element={<PlaceOrder />} />
          </Routes>
          <Footer />
        </div>
      </BookProvider>
    </AuthProvider>
  )
}

export default App
