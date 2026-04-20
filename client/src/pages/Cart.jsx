import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../components/ConfirmationModal";
import BackButton from "../components/BackButton";

const Cart = () => {
  const { cartItems, loading: cartLoading, addToCart, removeFromCart } =
    useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    onConfirm: () => { },
    title: "",
    message: "",
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * item.product.price,
    0,
  );

  const openConfirmation = (onConfirm, title, message) => {
    setModalConfig({ isOpen: true, onConfirm, title, message });
  };

  const closeConfirmation = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleRemove = (productId, name) => {
    openConfirmation(
      async () => {
        try {
          await removeFromCart(productId);
          closeConfirmation();
          toast.success(`${name} removed from cart`);
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to remove item');
        }
      },
      "Remove Item?",
      `Are you sure you want to remove ${name} from your shopping cart?`,
    );
  };

  const handleCheckout = () => {
    if (!userInfo) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartLoading) {
    return <div className="text-center py-10">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-8xl mx-auto px-2 py-5 sm:py-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass dark:bg-gray-800/80 p-12 rounded-3xl premium-shadow border border-white/40 dark:border-white/10 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all premium-shadow"
          >
            Start Shopping
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );

  }

  return (
    <div className="max-w-8xl mx-auto px-1  ">
      <BackButton />
      <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
        Shopping Bag
      </h2>


      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={item.product._id}
                className="glass dark:bg-gray-800 p-4 rounded-3xl premium-shadow border border-white/40 dark:border-white/5 flex flex-col sm:flex-row items-center gap-6"

              >
                <div className="w-full h-40 sm:h-36 sm:w-36 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-2 uppercase tracking-wide font-semibold">
                      {item.product.category}
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                      ₹{item.product.price}
                    </p>

                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center glass dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/5">
                      <button
                        onClick={() =>
                          item.qty > 1 && addToCart(item.product, item.qty - 1).catch((error) => {
                            toast.error(error.response?.data?.message || 'Failed to update cart');
                          })
                        }
                        className="p-2 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800 dark:text-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => addToCart(item.product, item.qty + 1).catch((error) => {
                          toast.error(error.response?.data?.message || 'Failed to update cart');
                        })}
                        className="p-2 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>


                    <button
                      onClick={() =>
                        handleRemove(item.product._id, item.product.name)
                      }
                      className="w-12 h-12 flex items-center justify-center text-red-100 bg-red-500 rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="glass dark:bg-gray-800 p-8 rounded-3xl premium-shadow border border-white/40 dark:border-white/5 sticky top-32">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-white/5 pb-4">
              Order Summary
            </h3>


            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-medium">
                <span>
                  Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items)
                </span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400 font-bold uppercase text-sm tracking-wide">
                  Free
                </span>
              </div>
              <div className="h-[1px] bg-gray-100 dark:bg-gray-700 my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total Price
                </span>
                <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>

            </div>

            {/* Desktop only Proceed button */}
            <div className="hidden sm:block mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </motion.button>
            </div>

            {!userInfo && (
              <div className="mt-6 flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <ShoppingBag
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                  size={20}
                />
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  You need to log in before you can place an order.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirmation}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      {/* Mobile Sticky Proceed button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-white/5 p-4">
        <button
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Proceed to Checkout
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="h-24 sm:hidden" />
    </div>
  );
};

export default Cart;
