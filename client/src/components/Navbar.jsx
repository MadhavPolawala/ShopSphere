import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  User, LogOut, Menu, X, Package, Sun, Moon, Home, Settings, ChevronDown,
  Speaker,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal";
import Logo from '/ShopSphere.png';

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const navLinkClass = "font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group flex items-center gap-1.5";
  const underlineClass = "absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8 py-4 ${isScrolled ? "top-2" : "top-0"}`}>
        <div className={`max-w-8xl mx-auto rounded-2xl transition-all duration-500 border ${isScrolled ? " backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-6 py-3 border-white/20" : "bg-transparent py-4 border-transparent"}`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="w-12 h-12  flex items-center justify-center hover:scale-105 ">
                <img src={Logo} alt="Logo" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-[#0d4f81] dark:text-[#468fc7]">
                Shop<span className="text-[#38710a] dark:text-[#6ab130]">Sphere</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={navLinkClass}>
                <Home size={15} /> Home
                <span className={underlineClass} />
              </Link>
              <Link to="/products" className={navLinkClass}>
                Products
                <span className={underlineClass} />
              </Link>

              <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700" />

              <div className="flex items-center space-x-5">
                {/* Theme Toggle */}
                <button onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                  aria-label="Toggle theme">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Cart */}
                <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group font-bold text-sm">
                  <ShoppingCart size={18} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-md">
                      {cartCount}
                    </motion.span>
                  )}
                </Link>

                {userInfo ? (
                  <div className="flex items-center gap-4">
                    {/* My Orders */}
                    <Link to="/orders" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-sm">
                      <Package size={18} />
                      <span>My Orders</span>
                    </Link>

                    {userInfo.isAdmin && (
                      <Link to="/admin/products"
                        className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-200 transition-colors">
                        ADMIN
                      </Link>
                    )}

                    <div className="h-7 w-[1px] bg-gray-200 dark:bg-gray-700" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm transition-all">
                          {userInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 hidden lg:block text-sm">
                          {userInfo.name.split(' ')[0]}
                        </span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isProfileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-4 w-52 backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50"
                          >
                            <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5">
                              <p className="font-black text-gray-900 dark:text-white text-sm">{userInfo.name}</p>
                              <p className="text-xs text-gray-900 dark:text-gray-400 truncate">{userInfo.email}</p>
                            </div>
                            <div className="p-2">
                              <Link to="/profile" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <User size={15} className="text-gray-900 dark:text-gray-400 " /> My Profile
                              </Link>
                              <Link to="/orders" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <Package size={15} className="text-gray-900 dark:text-gray-400 " /> My Orders
                              </Link>
                              {userInfo.isAdmin && (
                                <Link to="/admin/products" onClick={() => setIsProfileOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                  <Settings size={15} /> Admin Panel
                                </Link>
                              )}
                              <button
                                onClick={() => { setIsProfileOpen(false); setIsLogoutModalOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <LogOut size={15} /> Logout
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <Link to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-95">
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-400" aria-label="Toggle theme">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="relative p-2 text-gray-600 dark:text-gray-400" aria-label="Toggle theme">
                <Link to="/cart" className=" text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart size={18} />
                </Link>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-md">
                    {cartCount}
                  </motion.span>
                )}
              </button>
              <button className="p-2 text-gray-900 dark:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stable spacer for fixed nav */}
      <div className="h-20" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ originY: 0 }}
            //fixed blur background
            className="fixed inset-x-3 top-22 z-40 md:hidden backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]  rounded-2xl p-6">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}>
                <Home size={18} /> Home
              </Link>
              <Link to="/products" className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}>
                <Speaker size={18} />Products
              </Link>
              <Link to="/cart" className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {userInfo ? (
                <>
                  <Link to="/profile" className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/orders" className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <Package size={16} /> My Orders
                  </Link>
                  {userInfo.isAdmin && (
                    <Link to="/admin/products" className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="text-red-500 font-bold text-left flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white py-3 rounded-xl font-bold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          try {
            await logout();
            setIsLogoutModalOpen(false);
            navigate("/login");
          } catch {
            setIsLogoutModalOpen(false);
          }
        }}
        title="Logout Confirmation"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        type="danger"
      />
    </>
  );
};

export default Navbar;
