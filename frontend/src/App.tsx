import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CategorySelection from './pages/CategorySelection';
import ProductListing from './pages/ProductListing';
import TryOnStudio from './pages/TryOnStudio';
import LegacyStudio from './pages/LegacyStudio';
import RecommendationCart from './pages/RecommendationCart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories" element={<CategorySelection />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/studio" element={<TryOnStudio />} />
        <Route path="/legacy-studio" element={<LegacyStudio />} />
        <Route path="/cart" element={<RecommendationCart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
