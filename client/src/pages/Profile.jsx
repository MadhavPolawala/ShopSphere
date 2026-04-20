import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Home, MapPin, Save, Package, Loader2, ChevronRight } from 'lucide-react';
import DetailModal from '../components/DetailModal';

const STATUS_STYLES = {
  pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Pending' },
  accepted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Accepted' },
  inProcess: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'In Process' },
  outForDelivery: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Out for Delivery' },
  delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Delivered' },
};

const inputClass = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all";
const labelClass = "text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 block ml-1";

const Profile = () => {
  const { userInfo, updateProfile } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: userInfo?.name || '',
    phone: userInfo?.phone || '',
    address: userInfo?.address || '',
    city: userInfo?.city || '',
    postalCode: userInfo?.postalCode || '',
    state: userInfo?.state || '',
    country: userInfo?.country || 'India',
  });

  useEffect(() => {
    if (userInfo) {
      setForm({
        name: userInfo.name || '',
        phone: userInfo.phone || '',
        address: userInfo.address || '',
        city: userInfo.city || '',
        postalCode: userInfo.postalCode || '',
        state: userInfo.state || '',
        country: userInfo.country || 'India',
      });
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(data.slice(0, 5));
      } catch {
        // silent
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4  space-y-3">
      <BackButton />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your account details and delivery address.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Avatar Card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="glass dark:bg-gray-800 rounded-[2rem] p-8 border border-white/40 dark:border-white/5 premium-shadow flex flex-col items-center gap-4 text-center lg:col-span-1">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20">
            {userInfo?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{userInfo?.name}</p>
            <p className="text-sm text-gray-400 font-medium mt-1">{userInfo?.email}</p>
            {userInfo?.isAdmin && (
              <span className="mt-2 inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>
          <div className="w-full pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{userInfo?.email}</span>
            </div>
            {userInfo?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Phone size={14} className="flex-shrink-0" />
                <span>{userInfo.phone}</span>
              </div>
            )}
            {userInfo?.city && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={14} className="flex-shrink-0" />
                <span>{userInfo.city}{userInfo.country ? `, ${userInfo.country}` : ''}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Edit Form */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="glass dark:bg-gray-800 rounded-[2rem] p-8 border border-white/40 dark:border-white/5 premium-shadow lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Account Details</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} className={`${inputClass} pl-11`} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Street Address</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input name="address" value={form.address} onChange={handleChange} placeholder="House no., Street, Area" className={`${inputClass} pl-11`} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pin Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="6-digit pin" maxLength={6} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" className={inputClass} />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-50 ">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass dark:bg-gray-800 rounded-[2rem] border border-white/40  dark:border-white/5 premium-shadow overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
              <Package size={18} />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white">Recent Orders</h3>
          </div>
          <Link to="/orders" className="flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline underline-offset-4">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 font-bold text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {orders.map((order) => {
              const status = order.orderStatus || (order.isDelivered ? 'delivered' : 'pending');
              const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
              return (
                <div key={order._id}
                  onClick={() => { setSelectedOrder(order); setIsDetailModalOpen(true); }}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer active:scale-[0.99]"
                >
                  {/* Product thumbnails */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {order.orderItems.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-400">#{order._id.substring(0, 12)}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      ₹{order.totalPrice.toFixed(2)} · {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`${style.bg} ${style.text} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide flex-shrink-0`}>
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedOrder}
        type="order"
      />
    </div>
  );
};

export default Profile;
