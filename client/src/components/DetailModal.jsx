import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Package, MapPin, Phone, User, Calendar, CreditCard, ShoppingBag, Info, IndianRupee } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, data, type = 'order' }) => {
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setActiveImage(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const images = type === 'order'
        ? data.orderItems.map(item => item.image)
        : (Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image]);

    const nextImage = (e) => {
        e.stopPropagation();
        setActiveImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    };

    const modalBgClass = "backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]  rounded-2xl p-6";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar scroll-smooth ${modalBgClass}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 p-2 rounded-xl bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 transition-colors border border-white/20 dark:border-white/10"
                    >
                        <X size={20} className="text-gray-900 dark:text-gray-100" />
                    </button>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-white/20 dark:border-white/5 shadow-inner">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={images[activeImage]}
                                    alt="Detail view"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x400'; }}
                                />

                                {images.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black transition-all shadow-lg active:scale-95">
                                            <ChevronLeft size={20} className="text-gray-900 dark:text-gray-100" />
                                        </button>
                                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black transition-all shadow-lg active:scale-95">
                                            <ChevronRight size={20} className="text-gray-900 dark:text-gray-100" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i
                                                    ? 'border-blue-600 scale-105 shadow-lg'
                                                    : 'border-transparent hover:border-blue-300 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Content Details */}
                        <div className="flex flex-col h-full py-2">
                            {type === 'order' ? (
                                <>
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                            <ShoppingBag size={14} /> Order ID
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono truncate">#{data._id}</h2>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400 font-bold">
                                            <Calendar size={14} />
                                            {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Status Sections */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-white/20 dark:border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                                                    <Info size={10} /> Status
                                                </p>
                                                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase">
                                                    {data.orderStatus || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-white/20 dark:border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                                                    <CreditCard size={10} /> Payment
                                                </p>
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${data.isPaid ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                    {data.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Customer Info (Shipping Address) */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                <MapPin size={12} /> Delivery Details
                                            </div>
                                            <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-white/20 dark:border-white/5">
                                                <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" /> {data.user?.name || data.shippingAddress?.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                                    {data.shippingAddress?.address}, {data.shippingAddress?.city}<br />
                                                    {data.shippingAddress?.state} - {data.shippingAddress?.postalCode}
                                                </p>
                                                {data.shippingAddress?.phone && (
                                                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
                                                        <Phone size={12} /> {data.shippingAddress.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Item List */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                <Package size={12} /> Items
                                            </div>
                                            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                                                {data.orderItems.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                            <div>
                                                                <p className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold">Qty: {item.qty} × ₹{item.price}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-black text-gray-900 dark:text-white">₹{item.qty * item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="pt-4 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Amount</span>
                                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center">
                                                <IndianRupee size={20} strokeWidth={3} /> {data.totalPrice?.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">{data.brand || 'Product'}</p>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{data.name}</h2>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">₹{data.price}</span>
                                            {data.countInStock <= 0 ? (
                                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Out of Stock</span>
                                            ) : (
                                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{data.countInStock} In Stock</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5">Category</h4>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-900/40 px-4 py-2 rounded-xl inline-block border border-white/20 dark:border-white/5">{data.category}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 font-sans flex items-center gap-2">
                                                <Info size={12} /> Description
                                            </h4>
                                            <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-5 border border-white/20 dark:border-white/5">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                    {data.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8">
                                        <button
                                            onClick={onClose}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                                        >
                                            Close View
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DetailModal;
