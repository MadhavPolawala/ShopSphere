import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;
const modalBgClass = "backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]  rounded-2xl p-6";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-md ${modalBgClass} rounded-2xl overflow-hidden `}
        >

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                <AlertCircle size={24} />
              </div>

              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>


            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                  type === 'danger' 
                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-[0.98]"
              >
                {cancelText}
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
