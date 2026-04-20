import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { LayoutGrid, ShoppingBag, ChevronRight, Phone, MapPin, Package, Banknote, CheckCircle } from 'lucide-react';
import DetailModal from '../../components/DetailModal';


const STATUS_FLOW = [
  { key: 'pending', label: 'Pending', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  { key: 'accepted', label: 'Accepted', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { key: 'inProcess', label: 'In Process', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  { key: 'outForDelivery', label: 'Out for Delivery', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
];

const STATUS_INDEX = STATUS_FLOW.reduce((acc, s, i) => ({ ...acc, [s.key]: i }), {});

const getStatusStyle = (status) =>
  STATUS_FLOW.find((s) => s.key === status) || STATUS_FLOW[0];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (e, orderId, newStatus) => {
    e.stopPropagation();
    setUpdating((prev) => ({ ...prev, [orderId]: newStatus }));
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: data.orderStatus, isPaid: data.isPaid, isDelivered: data.isDelivered } : o)));
      toast.success(`Order marked as "${getStatusStyle(newStatus).label}"`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const markPaymentReceived = async (e, orderId) => {
    e.stopPropagation();
    setUpdating((prev) => ({ ...prev, [orderId]: 'pay' }));
    try {
      const { data } = await API.put(`/orders/${orderId}/pay`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, isPaid: data.isPaid, paidAt: data.paidAt } : o)));
      toast.success('Payment marked as received!');
    } catch {
      toast.error('Failed to mark payment');
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: null }));
    }
  };


  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'cancelled') return null;
    const idx = STATUS_INDEX[currentStatus] ?? 0;
    return idx < STATUS_FLOW.length - 2 ? STATUS_FLOW[idx + 1] : null; // -2 because cancelled is not in the linear flow
  };

  const getStats = () => ({
    all: orders.length,
    unpaid: orders.filter(o => !o.isPaid && o.orderStatus !== 'cancelled').length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    completed: orders.filter(o => o.orderStatus === 'delivered' && o.isPaid).length,
  });

  const stats = getStats();

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unpaid') return !o.isPaid && o.orderStatus !== 'cancelled';
    if (activeFilter === 'pending') return o.orderStatus === 'pending';
    if (activeFilter === 'completed') return o.orderStatus === 'delivered' && o.isPaid;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Orders</p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-1 py-0 space-y-4">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Order Management</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Track and manage all customer orders.</p>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <LayoutGrid size={16} />
          Switch to Products
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Stats / Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Orders', count: stats.all, color: 'blue' },
          { id: 'unpaid', label: 'Unpaid', count: stats.unpaid, color: 'red' },
          { id: 'pending', label: 'Pending', count: stats.pending, color: 'yellow' },
          { id: 'completed', label: 'Completed', count: stats.completed, color: 'green' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border whitespace-nowrap ${activeFilter === filter.id
              ? `bg-${filter.color}-600 border-${filter.color}-600 text-white `
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
          >
            {filter.label}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeFilter === filter.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="glass dark:bg-gray-800 rounded-3xl p-16 text-center border border-dashed border-gray-200 dark:border-gray-700">
            <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 font-bold">No {activeFilter !== 'all' ? activeFilter : ''} orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = order.orderStatus || (order.isDelivered ? 'delivered' : 'pending');
            const statusStyle = getStatusStyle(status);
            const nextStatus = getNextStatus(status);
            const isUpdating = updating[order._id];

            return (
              <div key={order._id}
                onClick={() => { setSelectedOrder(order); setIsDetailModalOpen(true); }}
                className="glass dark:bg-gray-900 rounded-3xl border border-white/40 dark:border-white/5 premium-shadow overflow-hidden cursor-pointer active:scale-[0.99] transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    {/* Product images stack */}
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900"
                          onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                        />
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-black text-gray-500">
                          +{order.orderItems.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-gray-400">#{order._id.substring(0, 12)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Payment status */}
                    {order.isPaid ? (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={10} /> Paid
                      </span>
                    ) : (
                      <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                        Unpaid — {order.paymentMethod}
                      </span>
                    )}
                    <span className={`${statusStyle.color} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider`}>
                      {statusStyle.label}
                    </span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{order.totalPrice.toFixed(2)}</span>
                    {nextStatus && status !== 'cancelled' && (
                      <button
                        onClick={(e) => updateStatus(e, order._id, nextStatus.key)}
                        disabled={!!isUpdating}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isUpdating === nextStatus.key ? 'Updating...' : `Mark as ${nextStatus.label}`}
                        <ChevronRight size={12} />
                      </button>
                    )}
                    {/* Admin cancel button — for pending/accepted */}
                    {/* {['pending', 'accepted'].includes(status) && (
                      <button
                        onClick={() => updateStatus(order._id, 'cancelled')}
                        disabled={!!isUpdating}
                        className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isUpdating === 'cancelled' ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )} */}
                    {/* Mark Payment Received — for COD delivered orders */}
                    {!nextStatus && !order.isPaid && order.paymentMethod === 'COD' && (
                      <button
                        onClick={(e) => markPaymentReceived(e, order._id)}
                        disabled={!!isUpdating}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isUpdating === 'pay' ? 'Marking...' : 'Mark Payment Received'}
                        <Banknote size={12} />
                      </button>
                    )}
                    {!nextStatus && order.isPaid && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-black uppercase tracking-widest">✓ Complete</span>
                    )}
                  </div>
                </div>


                {/* Customer & Order Info */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                  {/* Customer */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                    <p className="font-black text-gray-900 dark:text-white text-sm">{order.user?.name || order.shippingAddress?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email}</p>
                    {order.shippingAddress?.phone && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <Phone size={10} /> {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>

                  {/* Shipping */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      <MapPin size={10} className="inline mr-1" />Delivery Address
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {order.shippingAddress?.address || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      <Package size={10} className="inline mr-1" />Items ({order.orderItems.reduce((a, i) => a + i.qty, 0)})
                    </p>
                    <div className="space-y-1.5">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://placehold.co/24x24'; }} />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">{item.name}</span>
                          <span className="text-xs font-black text-gray-500 ml-auto flex-shrink-0">×{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Timeline — hidden for cancelled */}
                {status !== 'cancelled' ? (
                  <div className="flex items-center gap-0 px-5 pb-5 overflow-x-auto">
                    {STATUS_FLOW.filter(s => s.key !== 'cancelled').map((s, i) => {
                      const currentIdx = STATUS_INDEX[status] ?? 0;
                      const done = i <= currentIdx;
                      return (
                        <React.Fragment key={s.key}>
                          <div className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${done ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {i + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wide ${done ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{s.label}</span>
                          </div>
                          {i < STATUS_FLOW.filter(s => s.key !== 'cancelled').length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 ${i < currentIdx ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 pb-5 flex items-center gap-2 text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    <span className="text-sm font-black">Order Cancelled</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedOrder}
        type="order"
      />
    </div>
  );
};

export default AdminOrders;
