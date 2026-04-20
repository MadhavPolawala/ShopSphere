import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { ProductsProvider } from './context/ProductsContext';

import { motion, AnimatePresence } from 'framer-motion';


import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';


// Pages only accessible when NOT logged in (login, register)
const GuestRoute = ({ children }) => {
  const { userInfo, loading } = useContext(AuthContext);
  if (loading) return null;
  return userInfo ? <Navigate to="/" replace /> : children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/checkout" element={<ProtectedRoute><PageWrapper><Checkout /></PageWrapper></ProtectedRoute>} />

        {/* Guest-only routes — redirect to home if already logged in */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <PageWrapper><Login /></PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <PageWrapper><Register /></PageWrapper>
            </GuestRoute>
          }
        />

        {/* Protected — requires login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        </Route>


        {/* Protected — requires admin */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin/products" element={<PageWrapper><AdminProducts /></PageWrapper>} />
          <Route path="/admin/orders" element={<PageWrapper><AdminOrders /></PageWrapper>} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Reads theme from context to style toasts correctly in dark/light mode
const SmartToaster = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '16px',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(20px)',
          fontWeight: '600',
          fontSize: '14px',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f3f4f6' : '#111827',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: isDarkMode ? '#1f2937' : '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: isDarkMode ? '#1f2937' : '#fff' },
        },
      }}
    />
  );
};

function App() {

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ProductsProvider>
              <ScrollToTop />
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Navbar />
                <main className="container mx-auto px-4 pt-4 pb-20">
                  <AnimatedRoutes />
                </main>
                <SmartToaster />
              </div>
            </ProductsProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}


export default App;
