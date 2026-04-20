import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  if (userInfo) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome aboard.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-blue-900/30" />
        <div className="relative z-10 flex flex-col justify-end p-20 text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-6xl font-black leading-tight tracking-tighter mb-6">
            Join the <br /> Collectors.
          </h2>
          <p className="text-xl text-blue-100/80 max-w-md font-medium leading-relaxed">
            Create an account today and get exclusive access to new arrivals, special offers, and early drops.
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
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Please enter your details to sign up.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl pl-11 pr-4 py-4 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="register-email"
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
                  id="register-password"
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

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-2xl pl-11 pr-4 py-4 font-medium focus:ring-4 outline-none transition-all ${confirmPassword && password !== confirmPassword
                    ? 'border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 focus:ring-red-400/10'
                    : 'border-gray-100 dark:border-white/5 text-gray-900 dark:text-white focus:ring-blue-500/10 focus:border-blue-600'
                    }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 font-bold mt-1 ml-1 text-center">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-black hover:underline underline-offset-4">
              Sign in
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

export default Register;
