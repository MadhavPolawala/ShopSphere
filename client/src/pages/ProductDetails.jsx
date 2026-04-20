import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import BackButton from '../components/BackButton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.image);
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!userInfo) {
      toast.error('Please log in to add items to cart');
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    try {
      await addToCart(product, qty);
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const productImages = product?.images?.length ? product.images : product?.image ? [product.image] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Details</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="glass dark:bg-gray-800 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Product Not Found</h2>
          <button onClick={() => navigate('/products')} className="text-blue-600 font-bold">Return to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-  ">
      {/* Back Button */}
      <BackButton />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Left: Images */}
        <div className="space-y-6 sm:sticky  top-32">
          <div className="glass dark:bg-gray-800 rounded-[2.5rem] overflow-hidden premium-shadow border border-white/40 dark:border-white/5 bg-white">
            <img
              src={selectedImage || productImages[0]}
              alt={product.name}
              className="w-auto h-auto object-cover max-h-[600px]"
            />
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {productImages.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(image)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 m-1 sm:m-2 transition-all ${selectedImage === image ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={image} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 fill-current ${i < 4 ? '' : 'opacity-30'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-400">48 Reviews</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className={product.countInStock > 0 ? 'text-green-600 font-black' : 'text-red-600 font-black'}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
            {product.description}
          </p>

          <div className="glass dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] premium-shadow border border-white/40 dark:border-white/5 mb-6 sm:mb-8">
            <div className="flex items-center sm:items-end justify-between gap-4">
              <div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Price</p>
                <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  ₹{product.price?.toLocaleString()}
                </span>
              </div>

              {product.countInStock > 0 && (
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-200 dark:border-white/5">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >–</button>
                  <span className="w-8 text-center font-black dark:text-white">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >+</button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop only Add to Cart button */}
          <div className="hidden sm:block">
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all flex items-center justify-center gap-3 ${product.countInStock > 0
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              Add To Cart
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:mt-3">
            <div className="p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Satisfication</p>
              <p className="font-bold text-gray-900 dark:text-gray-200">Guaranteed</p>
            </div>
            <div className="p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Luxurious Items</p>
              <p className="font-bold text-gray-900 dark:text-gray-200">Premium Quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100 dark:border-white/5 p-4">
        <button
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all flex items-center justify-center gap-3 ${product.countInStock > 0
            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
          Add To Cart
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      {/* Spacer for sticky mobile button */}
      <div className="h-40 sm:hidden" />
    </div>
  );
};

export default ProductDetails;
