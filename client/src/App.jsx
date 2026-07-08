import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import { MainLayout } from './layouts/MainLayout';

// Pages import
import Dashboard from './pages/Dashboard';
import NaturalLanguageSQL from './pages/NaturalLanguageSQL';
import ProductSearch from './pages/ProductSearch';
import ImageSearch from './pages/ImageSearch';
import FinishedGoods from './pages/FinishedGoods';
import Settings from './pages/Settings';

function App() {
  return (
    <SettingsProvider>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs',
          duration: 4000,
          style: {
            background: '#18181B',
            color: '#FFFFFF',
            border: '1px solid #27272A',
            borderRadius: '0.75rem',
            fontSize: '0.825rem',
          },
        }}
      />
      
      {/* Routing Configuration */}
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sql" element={<NaturalLanguageSQL />} />
            <Route path="/search" element={<ProductSearch />} />
            <Route path="/image-search" element={<ImageSearch />} />
            <Route path="/products" element={<FinishedGoods />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </Router>
    </SettingsProvider>
  );
}

export default App;
