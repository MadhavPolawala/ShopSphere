import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { userInfo, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('cartItems');
  }, []);

  const fetchCart = useCallback(async () => {
    if (!userInfo) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      setCartItems(data.cartItems || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    fetchCart();
  }, [authLoading, fetchCart]);

  const addToCart = async (product, qty) => {
    if (!userInfo) {
      const error = new Error('AUTH_REQUIRED');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }

    const { data } = await API.post('/cart', {
      productId: product._id,
      qty,
    });

    setCartItems(data.cartItems || []);
  };

  const removeFromCart = async (productId) => {
    const { data } = await API.delete(`/cart/${productId}`);
    setCartItems(data.cartItems || []);
  };

  const clearCart = async () => {
    await API.delete('/cart/clear');
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
