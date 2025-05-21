import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { BookProvider } from './context/BookContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Cart from './pages/Cart'
import About from './pages/About'
import Contact from './pages/Contact'
import PlaceOrder from './pages/PlaceOrder'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile'
import 'react-toastify/dist/ReactToastify.css';

// Layout cho các trang thông thường
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

// Layout cho trang đăng nhập/đăng ký
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      } />
      <Route path="/register" element={
        <AuthLayout>
          <Register />
        </AuthLayout>
      } />
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      <Route path="/collection" element={
        <MainLayout>
          <Collection />
        </MainLayout>
      } />
      <Route path="/product/:id" element={
        <MainLayout>
          <Product />
        </MainLayout>
      } />
      <Route path="/about" element={
        <MainLayout>
          <About />
        </MainLayout>
      } />
      <Route path="/contact" element={
        <MainLayout>
          <Contact />
        </MainLayout>
      } />

      {/* Protected routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute>
          <MainLayout>
            <Cart />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/place-order" element={
        <ProtectedRoute>
          <MainLayout>
            <PlaceOrder />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BookProvider>
          <AppRoutes />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BookProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App
