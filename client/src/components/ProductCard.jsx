import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ProductCard = ({ product }) => {
  const productImage = product.images?.[0] || product.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden premium-shadow border border-gray-100 dark:border-white/5 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative h-36 sm:h-64 overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
          <span className="glass dark:bg-black/50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 h-10 sm:h-14">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2 sm:mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[9px] sm:text-xs text-gray-400 font-bold">(4.5)</span>
        </div>

        {/* Price + Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-gray-50 dark:bg-gray-900/50 -mx-3 sm:-mx-6 -mb-3 sm:-mb-6 px-3 sm:px-6 py-3 sm:py-4 mt-auto border-t border-gray-100 dark:border-white/5 gap-2 sm:gap-4">
          <span className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400 leading-none">
            ₹{product.price}
          </span>
          <Link
            to={`/product/${product._id}`}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-sm transition-all active:scale-95"
          >
            Details
            <ArrowRight size={12} className="sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
