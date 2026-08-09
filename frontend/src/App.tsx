import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import CategorySelection from './pages/CategorySelection';
import ProductListing from './pages/ProductListing';
import TryOnStudio from './pages/TryOnStudio';
import LegacyStudio from './pages/LegacyStudio';
import RecommendationCart from './pages/RecommendationCart';
import ProductDetailPage from './pages/ProductDetailPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import UserProfile from './pages/UserProfile';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-[#111] text-white border border-white/10 shadow-2xl',
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} 
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<CategorySelection />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/shop" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/studio" element={<TryOnStudio />} />
          <Route path="/legacy-studio" element={<LegacyStudio />} />
          <Route path="/cart" element={<RecommendationCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
