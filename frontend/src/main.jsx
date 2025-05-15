import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { BookProvider } from './context/BookContext'
import { ShopProvider } from './context/ShopContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <BookProvider>
        <ShopProvider>
          <App />
          <ToastContainer />
        </ShopProvider>
      </BookProvider>
    </AuthProvider>
  </BrowserRouter>
)
