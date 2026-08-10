import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import CategorySelection from './pages/CategorySelection';

import TryOnStudio from './pages/TryOnStudio';
import LegacyStudio from './pages/LegacyStudio';
import RecommendationCart from './pages/RecommendationCart';
import ProductDetailPage from './pages/ProductDetailPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'bg-white text-slate-900 border border-slate-200 shadow-xl',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0'
          }
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<CategorySelection />} />
          <Route path="/shop" element={<Marketplace />} />
          <Route path="/shop/:categoryId" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/studio" element={<TryOnStudio />} />
          <Route path="/legacy-studio" element={<LegacyStudio />} />
          <Route path="/cart" element={<RecommendationCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
