import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away
  if (userInfo) {
    navigate(location.state?.from?.pathname || '/', { replace: true });
    return null;
  }

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row bg-white dark:bg-gray-950">
      {/* Left side: Visual (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative overflow-hidden bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&w=1600&q=80"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-blue-900/30" />
        <div className="relative z-10 flex flex-col justify-end p-20 text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-6xl font-black leading-tight tracking-tighter mb-6">
            Elegance in <br /> Every Detail.
          </h2>
          <p className="text-xl text-blue-100/80 max-w-md font-medium leading-relaxed">
            Join our community of collectors and experience the finest selection of premium products curated just for you.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <div className="md:hidden flex justify-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white premium-shadow">
                <ShoppingBag size={24} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Sign In</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome back! Please enter your details.</p>
          </div>

          {from !== '/' && (
            <div className="mb-8 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl text-sm text-blue-800 dark:text-blue-400 font-bold text-center">
              Please sign in to access that page.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl pl-11 pr-4 py-4 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl pl-11 pr-12 py-4 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Or continue with</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace('/api', '');
                window.location.href = `${backendUrl}/auth/google`;
              }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] premium-shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-10 text-center text-gray-500 dark:text-gray-400 font-medium">
            New here?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-black hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>

          <div className="mt-12 flex justify-center">
            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center gap-2">
              <ArrowRight size={16} className="rotate-180" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
