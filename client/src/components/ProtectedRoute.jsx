import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ adminOnly = false, children }) => {
  const { userInfo, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm uppercase tracking-widest">Checking permissions...</p>
      </div>

    );
  }

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !userInfo.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass dark:bg-gray-800 p-12 rounded-3xl premium-shadow border border-red-100 dark:border-red-900/30 max-w-md"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            You don't have admin privileges to access this page.
          </p>
          <Navigate to="/" replace />
        </motion.div>

      </div>
    );
  }

  return children ? children : <Outlet />;
};


export default ProtectedRoute;

