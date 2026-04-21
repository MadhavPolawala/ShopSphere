import React, { useContext, useEffect, useLayoutEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import BackButton from '../components/BackButton';
import { motion } from 'framer-motion';
import { Layers, Loader2, ShoppingBag, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ProductsContext } from '../context/ProductsContext';
import API from '../api/axios';

const Products = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    currentPage,
    cachedProducts,
    totalPages,
    totalCount,
    productsLoading,
    fetchPage,
    saveScrollPosition,
    restoreScrollPosition,
  } = useContext(ProductsContext);

  // Local search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = show cached, array = show search
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await API.get(`/products?keyword=${encodeURIComponent(searchTerm)}&pageSize=50`);
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const clearSearch = () => { setSearchTerm(''); setSearchResults(null); };

  const displayProducts = searchResults !== null ? searchResults : cachedProducts;
  const isSearchMode = searchResults !== null;
  // On mount: fetch current page (from cache if available)
  useEffect(() => {
    fetchPage(currentPage);
  }, [fetchPage, currentPage]);

  // Restore scroll position if coming back (cached page)
  useLayoutEffect(() => {
    if (!productsLoading && cachedProducts.length > 0) {
      const savedY = restoreScrollPosition(pathname);
      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' });

        // Secondary restoration for insurance against dynamic content height changes
        const timer = setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' });
        }, 30);
        return () => clearTimeout(timer);
      }
    }
  }, [productsLoading, cachedProducts.length, pathname, restoreScrollPosition]);

  const changePage = useCallback((newPage) => {
    // When manually changing pages, we want to reset scroll for THIS path
    saveScrollPosition(pathname, 0);
    fetchPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPage, pathname, saveScrollPosition]);

  // Save scroll position before navigating to a product
  const handleProductClick = useCallback(() => {
    saveScrollPosition(pathname, window.scrollY);
  }, [saveScrollPosition, pathname]);

  const pageSize = 15;
  const startItem = isSearchMode ? 1 : (currentPage - 1) * pageSize + 1;
  const endItem = isSearchMode ? displayProducts.length : Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + cachedProducts.length);

  return (
    <div className="max-w-8xl mx-auto px-2 pb-12 ">
      <BackButton />
      {/* Header */}
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between ">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Layers size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Storefront</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Latest Arrivals</h2>
        </motion.div>

        {/* Search bar */}
        <div className="relative w-full md:w-72 ">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {!isSearchMode && totalPages > 1 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-6">
          Showing <span className="font-bold text-gray-700 dark:text-gray-300">{startItem}–{endItem}</span>{' '}
          {totalCount > 0 && <>of <span className="font-bold text-gray-700 dark:text-gray-300">{totalCount}</span></>} products
        </p>
      )}
      {isSearchMode && (
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-6">
          {searchLoading ? 'Searching…' : `${displayProducts.length} result${displayProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`}
        </p>
      )}

      {/* Products Grid */}
      {(productsLoading && !isSearchMode) || searchLoading ? (
        <div className="flex flex-col items-center justify-center py-40  ">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">{searchLoading ? 'Searching' : 'Loading Catalog'}</p>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="glass dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700 p-20 text-center text-gray-400 dark:text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold">No products available yet.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8"
          onClick={handleProductClick}
        >
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination — hidden in search mode */}
      {!isSearchMode && totalPages > 1 && !productsLoading && (
        <div className="mt-14 flex flex-col items-center gap-4 ">
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => changePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5
                text-gray-700 dark:text-gray-300
                hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400
                disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {/* Page Numbers */}
            {(() => {
              const maxVisible = 5;
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + maxVisible - 1);
              if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

              const buttons = [];
              if (start > 1) {
                buttons.push(
                  <button key={1} onClick={() => changePage(1)}
                    className="w-10 h-10 rounded-2xl font-bold text-sm transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600">
                    1
                  </button>
                );
                if (start > 2) buttons.push(<span key="s-el" className="text-gray-400 font-bold px-1">…</span>);
              }

              for (let i = start; i <= end; i++) {
                buttons.push(
                  <button key={i} onClick={() => changePage(i)}
                    className={`w-10 h-10 rounded-2xl font-bold text-sm transition-all ${currentPage === i
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}>
                    {i}
                  </button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1) buttons.push(<span key="e-el" className="text-gray-400 font-bold px-1">…</span>);
                buttons.push(
                  <button key={totalPages} onClick={() => changePage(totalPages)}
                    className="w-10 h-10 rounded-2xl font-bold text-sm transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600">
                    {totalPages}
                  </button>
                );
              }

              return buttons;
            })()}

            {/* Next */}
            <button
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5
                text-gray-700 dark:text-gray-300
                hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400
                disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-400 font-medium">Page {currentPage} of {totalPages}</p>
        </div>
      )}
    </div>
  );
};

export default Products;
