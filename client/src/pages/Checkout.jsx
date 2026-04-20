import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

import { toast } from "react-hot-toast";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  User,
  Home,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Banknote,
  CreditCard,
  Smartphone,
  ShoppingBag,
  Loader2,
  Package,
} from "lucide-react";
import BackButton from "../components/BackButton";

const STEPS = ["Shipping", "Payment", "Review"];

const inputClass =
  "w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all";
const labelClass =
  "text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 block ml-1";

const PAYMENT_OPTIONS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    icon: Banknote,
    desc: "Pay when your order arrives.",
    available: true,
  },
  {
    id: "UPI",
    label: "UPI Payment",
    icon: Smartphone,
    desc: "Pay via any UPI app.",
    available: false,
  },
  {
    id: "Card",
    label: "Debit / Credit Card",
    icon: CreditCard,
    desc: "Pay securely with card.",
    available: false,
  },
];

const CITIES = [
  "Agartala", "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Akola", "Alappuzha", "Aligarh",
  "Allahabad", "Alwar", "Ambattur", "Amravati", "Amritsar", "Anand", "Ankleshwar",
  "Asansol", "Aurangabad", "Avadi", "Bareilly", "Bangalore", "Belgaum", "Bhagalpur",
  "Bharuch", "Bhavnagar", "Bhilai", "Bhiwandi", "Bhopal", "Bhubaneswar", "Bikaner",
  "Bilaspur", "Bokaro", "Chandigarh", "Chennai", "Coimbatore", "Cuttack", "Dehradun",
  "Delhi", "Dhanbad", "Bhilwara", "Durgapur", "Erode", "Faridabad", "Firozabad",
  "Gandhinagar", "Gaya", "Ghaziabad", "Gopalpur", "Gorakhpur", "Gulbarga", "Guntur",
  "Guwahati", "Gwalior", "Howrah", "Hubli-Dharwad", "Hyderabad", "Ichalkaranji",
  "Imphal", "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon",
  "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Junagadh", "Kakinada",
  "Kalyan-Dombivli", "Kanpur", "Karnal", "Kochi", "Kolhapur", "Kolkata", "Kollam",
  "Korba", "Kota", "Kottayam", "Kozhikode", "Kurnool", "Latur", "Lucknow", "Ludhiana",
  "Madurai", "Malappuram", "Mathura", "Mangalore", "Meerut", "Mira-Bhayandar",
  "Moradabad", "Mumbai", "Muzaffarnagar", "Mysore", "Nagpur", "Nanded", "Nashik",
  "Navi Mumbai", "Navsari", "Nellore", "Noida", "Panaji", "Panchkula", "Patiala",
  "Patna", "Pimpri-Chinchwad", "Puducherry", "Pune", "Raipur", "Rajahmundry",
  "Rajkot", "Ranchi", "Rourkela", "Sagar", "Salem", "Sangli", "Satara", "Shimla",
  "Siliguri", "Solapur", "Srinagar", "Surat", "Thane", "Thiruvananthapuram",
  "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tirupati", "Udaipur",
  "Ujjain", "Ulhasnagar", "Vadodara", "Valsad", "Vapi", "Varanasi", "Vasai-Virar",
  "Vellore", "Vijayawada", "Visakhapatnam", "Warangal"
].sort();

const Checkout = () => {
  const { cartItems, clearCart, loading: cartLoading } = useContext(CartContext);
  const { userInfo, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [citySearch, setCitySearch] = useState(userInfo?.city || "");
  const [showCityList, setShowCityList] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: userInfo?.name || "",
    phone: userInfo?.phone || "",
    address: userInfo?.address || "",
    city: userInfo?.city || "",
    state: userInfo?.state || "",
    postalCode: userInfo?.postalCode || "",
    country: userInfo?.country || "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.product.price, 0);

  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setShipping((prev) => ({ ...prev, city: value }));
    setShowCityList(true);
  };

  const handleCitySelect = (city) => {
    setShipping((s) => ({ ...s, city }));
    setCitySearch(city);
    setShowCityList(false);
  };

  const handleShippingChange = (e) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateShipping = () => {
    if (!shipping.fullName.trim()) { toast.error("Full name is required"); return false; }
    if (!shipping.phone.trim() || !/^\d{10}$/.test(shipping.phone.trim())) { toast.error("Enter a valid 10-digit phone number"); return false; }
    if (!shipping.address.trim()) { toast.error("Address is required"); return false; }
    if (!shipping.city.trim()) { toast.error("City is required"); return false; }
    if (!shipping.postalCode.trim() || !/^\d{6}$/.test(shipping.postalCode.trim())) { toast.error("Enter a valid 6-digit pincode"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateShipping()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) { setStep(0); return; }
    setSubmitting(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.product.name,
          qty: item.qty,
          image: item.product.image,
          price: item.product.price,
          product: item.product._id,
        })),
        shippingAddress: shipping,
        paymentMethod,
        totalPrice,
      };

      await API.post("/orders", orderData);
      toast.success("Order placed successfully! 🎉");
      navigate("/orders", { replace: true });

      Promise.all([
        clearCart(),
        updateProfile({
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          state: shipping.state,
          country: shipping.country,
        }).catch(() => { })
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!cartLoading && !submitting && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, cartLoading, submitting, navigate]);

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  if (!userInfo) return null;

  if (cartLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-bold">Initializing Secure Checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 py-1 space-y-3 overflow-x-hidden">
      <BackButton />
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Checkout
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
          Securely complete your purchase.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass dark:bg-gray-800/50 rounded-[2rem] p-4 sm:p-6 border border-white/40 dark:border-white/5 premium-shadow">
        <div className="flex items-center justify-between">
          {STEPS.map((name, i) => (
            <React.Fragment key={name}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-500 ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white scale-110" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                >
                  {i < step ? <CheckCircle size={20} /> : i + 1}
                </div>
                <span className={`hidden sm:block text-[10px] font-black uppercase tracking-widest ${i === step ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                  {name}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2 sm:mx-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full bg-green-500 transition-all duration-700 ${i < step ? "w-full" : "w-0"}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 ">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="glass dark:bg-gray-800 rounded-[2rem] p-6 sm:p-10 border border-white/40 dark:border-white/5 premium-shadow"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Shipping</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Customer Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input name="fullName" value={shipping.fullName} onChange={handleShippingChange} placeholder="Full Name" className={`${inputClass} pl-12`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Contact Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input name="phone" type="tel" value={shipping.phone} onChange={handleShippingChange} placeholder="10-digit number" maxLength={10} className={`${inputClass} pl-12`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Dispatch Address</label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="address" value={shipping.address} onChange={handleShippingChange} placeholder="Street, Building, Area" className={`${inputClass} pl-12`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="relative">
                      <label className={labelClass}>City</label>
                      <input type="text" className={inputClass} value={shipping.city} onChange={handleCityInputChange} onFocus={() => setShowCityList(true)} onBlur={() => setTimeout(() => setShowCityList(false), 200)} placeholder="Search City" />
                      <AnimatePresence>
                        {showCityList && filteredCities.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCities.map((city) => (
                                <button key={city} type="button" onClick={() => handleCitySelect(city)} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300">
                                  {city}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input name="postalCode" value={shipping.postalCode} onChange={handleShippingChange} placeholder="6-digits" maxLength={6} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input name="country" value={shipping.country} onChange={handleShippingChange} className={inputClass} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="glass dark:bg-gray-800 rounded-[2rem] p-6 sm:p-10 border border-white/40 dark:border-white/5 premium-shadow"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <Banknote size={22} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Payment Method</h2>
                </div>

                <div className="grid gap-4">
                  {PAYMENT_OPTIONS.map(({ id, label, icon: Icon, desc, available }) => {
                    const isSelected = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!available}
                        onClick={() => setPaymentMethod(id)}
                        className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left ${isSelected ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent bg-gray-50 dark:bg-gray-900/50"
                          } ${!available ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200"}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-400 font-bold">{desc}</p>
                        </div>
                        {isSelected && <CheckCircle className="text-blue-600" size={20} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="glass dark:bg-gray-800 rounded-[2rem] p-6 sm:p-10 border border-white/40 dark:border-white/5 premium-shadow"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <Package size={22} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Review Order</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                    <p className={labelClass}>Shipping To</p>
                    <p className="font-black text-gray-900 dark:text-white">{shipping.fullName}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{shipping.address}, {shipping.city}, {shipping.postalCode}</p>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                    <p className={labelClass}>Payment Method</p>
                    <p className="font-black text-gray-900 dark:text-white">{paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                    <p className="text-xs text-gray-400 mt-1 font-bold">Standard secure processing.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Navigation Actions */}
          <div className="hidden sm:flex flex-col-reverse sm:flex-row gap-4 pt-4">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="w-full sm:flex-1 py-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={step < STEPS.length - 1 ? handleNext : handlePlaceOrder}
              disabled={submitting}
              className={`w-full sm:flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${step === 2 ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                }`}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : step === 2 ? "Place Order" : "Continue"}
              {step < 2 && !submitting && <ArrowRight size={18} />}
            </button>
          </div>
        </div>

        {/* Receipt Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 premium-shadow lg:sticky lg:top-8">
            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="max-h-[250px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <img src={item.product.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">₹{item.product.price} × {item.qty}</p>
                    </div>
                    <p className="text-xs font-black text-gray-900 dark:text-white">₹{(item.product.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-white/10 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-gray-900 dark:text-white">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black uppercase text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Navigation Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-white/5 p-4">
        <div className="flex flex-col-reverse gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-full py-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={step < STEPS.length - 1 ? handleNext : handlePlaceOrder}
            disabled={submitting}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${step === 2 ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
              }`}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : step === 2 ? "Place Order" : "Continue"}
            {step < 2 && !submitting && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
      {/* Spacer for sticky mobile button */}
      <div className="h-44 sm:hidden" />
    </div >
  );
};

export default Checkout;