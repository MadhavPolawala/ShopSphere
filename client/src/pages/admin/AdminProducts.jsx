import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Edit, Plus, Trash2, X, Upload, Link, ShoppingBag, ChevronRight, Search, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from '../../components/ConfirmationModal';
import DetailModal from '../../components/DetailModal';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: '',
  countInStock: '',
  imagesText: '',
};

const getProductImages = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
};

const inputClass = "w-full rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-3.5 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all";
const labelClass = "block text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]";

const AdminProducts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const [uploadedPreviews, setUploadedPreviews] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, onConfirm: () => { }, title: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortMode, setSortMode] = useState('recent'); // 'recent' | 'random'
  const [sortToggling, setSortToggling] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Load current global sort mode
    API.get('/settings/sort').then(({ data }) => setSortMode(data.sortMode)).catch(() => { });
  }, []);

  const isEditing = useMemo(() => Boolean(editingProductId), [editingProductId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products?all=true');
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProductId(null);
    setShowForm(false);
    setUploadedPreviews([]);
    setUploadMode('url');
  };

  const openCreateForm = () => {
    setFormData(emptyForm);
    setEditingProductId(null);
    setUploadedPreviews([]);
    setUploadMode('url');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const productImages = getProductImages(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price ?? '',
      countInStock: product.countInStock ?? '',
      imagesText: productImages.join('\n'),
    });
    setEditingProductId(product._id);
    setUploadedPreviews([]);
    setUploadMode('url');
    setShowForm(true);
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const toggleSortMode = async () => {
    const next = sortMode === 'recent' ? 'random' : 'recent';
    setSortToggling(true);
    try {
      const { data } = await API.put('/settings/sort', { sortMode: next });
      setSortMode(data.sortMode);
      toast.success(
        data.sortMode === 'random'
          ? '🔀 Shuffle Suggestions ON — users see a random order'
          : '📅 Showing newest products first'
      );
    } catch {
      toast.error('Failed to update sort mode');
    } finally {
      setSortToggling(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 5) { toast.error('Max 5 images allowed'); return; }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach((file) => formDataUpload.append('images', file));

      const { data } = await API.post('/products/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedPreviews(data.urls);
      setFormData((prev) => ({
        ...prev,
        imagesText: [...prev.imagesText.split('\n').filter(Boolean), ...data.urls].join('\n'),
      }));
      toast.success(`${data.urls.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const images = formData.imagesText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (images.length === 0) { toast.error('Add at least one image'); return; }

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
      image: images[0],
      images,
    };

    try {
      setSaving(true);
      if (isEditing) {
        await API.put(`/products/${editingProductId}`, payload);
        toast.success('Product updated');
      } else {
        await API.post('/products', payload);
        toast.success('Product created');
      }
      await fetchProducts();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteHandler = (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: 'Delete Product?',
      message: 'This action cannot be undone.',
      onConfirm: async () => {
        try {
          await API.delete(`/products/${id}`);
          await fetchProducts();
          toast.success('Product deleted');
        } catch {
          toast.error('Failed to delete product');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Inventory</p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-1 py-0 space-y-4">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Product Inventory</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Manage your catalog, stock, and media.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleSortMode}
            disabled={sortToggling}
            title={sortMode === 'random' ? 'Random mode ON — click to switch back to newest first' : 'Click to shuffle product suggestions for users'}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all active:scale-95 disabled:opacity-50 ${sortMode === 'random'
                ? 'bg-blue-600 border-blue-600 text-white  hover:bg-blue-700'
                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Shuffle size={16} />
            {sortMode === 'random' ? 'Shuffle: ON' : 'Shuffle: OFF'}
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center bg-blue-600 border-blue-600 hover:bg-blue-700 text-white text-sm font-bold gap-2 px-5 py-3 rounded-2xl border   transition-all"
          >
            <ShoppingBag size={16} />
            Switch to Orders
            <ChevronRight size={14} />
          </button>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            New Product
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:bg-gray-800 rounded-[2.5rem] premium-shadow border border-white/40 dark:border-white/5 p-8"
        >
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{isEditing ? 'Edit Product' : 'Create Product'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload images or paste URLs.</p>
            </div>
            <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelClass}>Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Ex: Luxury Gold Watch" />
            </div>

            <div>
              <label className={labelClass}>Brand</label>
              <input name="brand" value={formData.brand} onChange={handleChange} required className={inputClass} placeholder="Ex: Rolex" />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <input name="category" value={formData.category} onChange={handleChange} required className={inputClass} placeholder="Ex: Accessories" />
            </div>

            <div>
              <label className={labelClass}>Price (INR)</label>
              <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required className={inputClass} placeholder="0.00" />
            </div>

            <div>
              <label className={labelClass}>Stock Quantity</label>
              <input name="countInStock" type="number" min="0" step="1" value={formData.countInStock} onChange={handleChange} required className={inputClass} placeholder="Quantity" />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className={inputClass} placeholder="Detailed product information..." />
            </div>

            {/* Image Upload Section */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClass}>Product Images</label>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${uploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  <Link size={14} /> Paste URLs
                </button>
                <button type="button" onClick={() => setUploadMode('file')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  <Upload size={14} /> Upload Files
                </button>
              </div>

              {uploadMode === 'url' ? (
                <textarea
                  name="imagesText"
                  value={formData.imagesText}
                  onChange={handleChange}
                  rows="3"
                  placeholder={'https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg'}
                  className={`${inputClass} font-mono text-sm`}
                />
              ) : (
                <div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-blue-400 transition-all disabled:opacity-50">
                    <Upload size={28} className="text-gray-400" />
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Click to select images'}</p>
                    <p className="text-xs text-gray-400">Max 5 files, 5MB each. JPG, PNG, WEBP</p>
                  </button>

                  {uploadedPreviews.length > 0 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                      {uploadedPreviews.map((url, i) => (
                        <img key={i} src={url} alt={`Preview ${i + 1}`} className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-white/10 flex-shrink-0" />
                      ))}
                    </div>
                  )}

                  {formData.imagesText && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-2">
                      ✓ {formData.imagesText.split('\n').filter(Boolean).length} image(s) ready
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-4 pt-2">
              <button type="button" onClick={resetForm}
                className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Discard
              </button>
              <button type="submit" disabled={saving}
                className="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white font-black   active:scale-[0.98] transition-all disabled:opacity-70">
                {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search bar */}
      <div className="relative w-full md:max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, brand, category…"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Product Table */}
      <div className="glass dark:bg-gray-800 rounded-[2.5rem] overflow-hidden premium-shadow border border-white/40 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-white/5 font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6 text-left">Product & Brand</th>
                <th className="px-8 py-6 text-left">Category</th>
                <th className="px-8 py-6 text-left">Price</th>
                <th className="px-8 py-6 text-left">Stock</th>
                <th className="px-8 py-6 text-left">Images</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">
                    No products match &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const productImages = getProductImages(product);
                return (
                  <tr key={product._id}
                    onClick={() => openDetailModal(product)}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer group/row"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={productImages[0]} alt={product.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-gray-200 dark:border-white/5"
                          onError={(e) => { e.target.src = 'https://placehold.co/56x56'; }} />
                        <div>
                          <p className="font-black text-gray-900 dark:text-white text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-600 dark:text-gray-400">{product.category}</td>
                    <td className="px-8 py-5 text-sm font-black text-blue-600 dark:text-blue-400">₹{product.price}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${product.countInStock > 10
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : product.countInStock > 0
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        {product.countInStock} In Stock
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500">{productImages.length} Files</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={(e) => { e.stopPropagation(); openEditForm(product); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                          <Edit size={17} />
                        </button>
                        <button onClick={(e) => deleteHandler(e, product._id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedProduct}
        type="product"
      />
    </div>
  );
};

export default AdminProducts;
