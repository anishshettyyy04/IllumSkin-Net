import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import CategorySelection from './pages/CategorySelection';
import ProductListing from './pages/ProductListing';
import TryOnStudio from './pages/TryOnStudio';
import LegacyStudio from './pages/LegacyStudio';
import RecommendationCart from './pages/RecommendationCart';
import ProductDetailPage from './pages/ProductDetailPage';

function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
