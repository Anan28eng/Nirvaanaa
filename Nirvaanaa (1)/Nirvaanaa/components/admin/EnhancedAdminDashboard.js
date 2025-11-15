'use client';

import React, { useEffect, useState } from 'react';
import KPIChart from './KPIChart';
import KPISection from './KPISection';
import { useSession } from 'next-auth/react';
import { useAdminStore } from '@/lib/stores';
import { useSocket } from '@/lib/useSocket';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TagDiscountManager from './TagDiscountManager';
import InvoiceTemplatesSection from './InvoiceTemplatesSection';
    import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';
import toast from 'react-hot-toast';
import { BannerProvider, useBanner } from './BannerContext';
import ImageUpload from '@/components/ui/ImageUpload';
import EnhancedBannerManager from './EnhancedBannerManager';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

// API functions
const fetchProducts = async () => {
  const res = await fetch('/api/products?limit=100');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

const fetchOrders = async () => {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

const fetchCustomers = async () => {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

const fetchKPIs = async () => {
  const res = await fetch('/api/kpis');
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
};

const fetchAnalytics = async (dateRange = 'month') => {
  const res = await fetch(`/api/analytics?range=${dateRange}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

export default function EnhancedAdminDashboard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { emitProductUpdate, emitKpiUpdate } = useSocket();
  
  // Admin store
  const {
    products,
    orders,
    customers,
    kpis,
    analytics,
    setProducts,
    setOrders,
    setCustomers,
    setKpis,
    setAnalytics,
    addProduct,
    updateProduct,
    removeProduct,
    addOrder,
    updateOrder,
    removeOrder,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addKpi,
    updateKpi,
    removeKpi,
  } = useAdminStore();

  // State
  const [dateRange, setDateRange] = useState('month');
  const [selectedChart, setSelectedChart] = useState('bar');
  const [isLoading, setIsLoading] = useState(false);

  // Queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    refetchInterval: 30000,
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
    refetchInterval: 30000,
  });

  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: fetchKPIs,
    refetchInterval: 10000, // Refetch every 10 seconds for KPIs
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => fetchAnalytics(dateRange),
    refetchInterval: 60000, // Refetch every minute
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    onSuccess: (newProduct) => {
      addProduct(newProduct);
      emitProductUpdate('created', newProduct);
      queryClient.invalidateQueries(['products']);
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Create product error:', error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, productData }) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update product');
      }
      return res.json();
    },
    onSuccess: (updatedProduct) => {
      updateProduct(updatedProduct._id, updatedProduct);
      emitProductUpdate('updated', updatedProduct);
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      setEditProductData({});
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product');
      console.error('Update product error:', error);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: (_, productId) => {
      removeProduct(productId);
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    },
  });

  const createKpiMutation = useMutation({
    mutationFn: async (kpiData) => {
      const res = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiData),
      });
      if (!res.ok) throw new Error('Failed to create KPI');
      return res.json();
    },
    onSuccess: (newKpi) => {
      addKpi(newKpi.kpi);
      emitKpiUpdate('created', newKpi.kpi);
      queryClient.invalidateQueries(['kpis']);
      toast.success('KPI created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create KPI');
      console.error('Create KPI error:', error);
    },
  });

  const deleteKpiMutation = useMutation({
    mutationFn: async (kpiId) => {
      const res = await fetch(`/api/kpis?id=${kpiId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete KPI');
      return res.json();
    },
    onSuccess: (_, kpiId) => {
      removeKpi(kpiId);
      toast.success('KPI deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete KPI');
      console.error('Delete KPI error:', error);
    },
  });

  // Update store when data changes
  useEffect(() => {
    if (productsData?.products) {
      setProducts(productsData.products);
    }
  }, [productsData, setProducts]);

  useEffect(() => {
    if (ordersData?.orders) {
      setOrders(ordersData.orders);
    }
  }, [ordersData, setOrders]);

  useEffect(() => {
    if (customersData?.users) {
      setCustomers(customersData.users);
    }
  }, [customersData, setCustomers]);

  useEffect(() => {
    if (kpisData?.kpis) {
      setKpis(kpisData.kpis);
    }
  }, [kpisData, setKpis]);

  useEffect(() => {
    if (analyticsData) {
      setAnalytics(analyticsData);
    }
  }, [analyticsData, setAnalytics]);

  // Product form state
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    mainImage: '',
    stock: 10,
    tags: [],
    colorVariants: [],
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    weight: {
      value: '',
      unit: 'g'
    },
    comparePrice: '',
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({});

  // KPI form state
  const [newKpi, setNewKpi] = useState({
    label: '',
    value: '',
  });

  // Shipping form state
  const [newShipping, setNewShipping] = useState({
    name: '',
    description: '',
    cost: '',
    estimatedDays: {
      min: '',
      max: ''
    },
    freeShippingThreshold: '',
    isActive: true,
    isDefault: false,
    gstPercent: 18,
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newProduct.title || !newProduct.title.trim()) {
      toast.error('Product title is required');
      return;
    }
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!newProduct.category) {
      toast.error('Category is required');
      return;
    }
    if (!newProduct.description || !newProduct.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
      toast.error('Valid stock quantity is required');
      return;
    }
    if (!newProduct.mainImage || !newProduct.mainImage.trim()) {
      toast.error('Main product image is required');
      return;
    }
    
    // Validate color variants if provided
    if (newProduct.colorVariants && newProduct.colorVariants.length > 0) {
      const invalidVariants = newProduct.colorVariants.filter(v => 
        !v.name || !v.name.trim() || !v.hex || !/^#[0-9A-Fa-f]{6}$/i.test(v.hex)
      );
      if (invalidVariants.length > 0) {
        toast.error('Please ensure all color variants have a valid name and hex color code');
        return;
      }
    }

    try {
      // Merge tags from array and any pending comma-separated input
      const inputTags = (newProduct.tagsInput || '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      const mergedTags = Array.from(new Set([...(newProduct.tags || []).map(t => String(t).trim().toLowerCase()), ...inputTags]));

      // Compute effective discount: max(entered discount, active tag discounts)
      let enteredDiscount = parseFloat(newProduct.discount) || 0;
      let tagMax = 0;
      try {
        const tdRes = await fetch('/api/tag-discounts');
        if (tdRes.ok) {
          const tdData = await tdRes.json();
          const actives = (tdData.discounts || []).filter(d => d.active);
          const map = new Map(actives.map(d => [String(d.tag).toLowerCase(), Number(d.percent) || 0]));
          for (const t of mergedTags) {
            const pct = map.get(t);
            if (typeof pct === 'number') tagMax = Math.max(tagMax, pct);
          }
        }
      } catch (err) {
        // non-fatal for creation UI
      }
      const appliedDiscount = Math.max(enteredDiscount, tagMax);

      // Clean color variants - remove empty entries and ensure proper structure
      const cleanColorVariants = (newProduct.colorVariants || [])
        .filter(v => v.name && v.hex)
        .map(v => ({
          name: v.name.trim(),
          hex: v.hex.trim(),
          images: (v.images || []).filter(img => img && img.trim()).map(img => typeof img === 'string' ? img : img?.url || img)
        }));

      createProductMutation.mutate({
        ...newProduct,
        tags: mergedTags,
        colorVariants: cleanColorVariants.length > 0 ? cleanColorVariants : undefined,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        comparePrice: newProduct.comparePrice ? parseFloat(newProduct.comparePrice) : undefined,
        discount: appliedDiscount,
        dimensions: {
          length: newProduct.dimensions.length ? parseFloat(newProduct.dimensions.length) : undefined,
          width: newProduct.dimensions.width ? parseFloat(newProduct.dimensions.width) : undefined,
          height: newProduct.dimensions.height ? parseFloat(newProduct.dimensions.height) : undefined,
          unit: newProduct.dimensions.unit
        },
        weight: {
          value: newProduct.weight.value ? parseFloat(newProduct.weight.value) : undefined,
          unit: newProduct.weight.unit
        },
        published: true,
      });
    } catch (err) {
      console.error('Prepare product error:', err);
      toast.error('Failed to prepare product data');
      return;
    }

    setNewProduct({
      title: '',
      description: '',
      price: '',
      category: '',
      mainImage: '',
      stock: 10,
      tags: [],
      tagsInput: '',
      colorVariants: [],
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      },
      weight: {
        value: '',
        unit: 'g'
      },
      comparePrice: '',
    });
  };

  const handleCreateKpi = (e) => {
    e.preventDefault();
    if (!newKpi.label || !newKpi.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    createKpiMutation.mutate({
      ...newKpi,
      createdBy: session?.user?.id,
    });

    setNewKpi({
      label: '',
      value: '',
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product._id);
    // Pre-fill edit form with product data
    setEditProductData({
      title: product.title || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      discount: product.discount || 0,
      category: product.category || '',
      stock: product.stock || 0,
      sku: product.sku || '',
      tags: product.tags || [],
      tagsInput: '',
      mainImage: product.images?.[0]?.url || '',
      images: product.images || [],
      colorVariants: product.colorVariants || [],
      dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
      weight: product.weight || { value: '', unit: 'g' },
      materials: product.materials || [],
      subcategory: product.subcategory || '',
      careInstructions: product.careInstructions || '',
      madeIn: product.madeIn || 'India',
      isHandmade: product.isHandmade !== undefined ? product.isHandmade : true,
      published: product.published !== undefined ? product.published : true,
      featured: product.featured || false,
      seo: product.seo || { metaTitle: '', metaDescription: '', keywords: [] },
    });
    // Scroll to edit form
    setTimeout(() => {
      document.getElementById('edit-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    // Validate required fields
    if (!editProductData.title || !editProductData.title.trim()) {
      toast.error('Product title is required');
      return;
    }
    if (!editProductData.price || parseFloat(editProductData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!editProductData.category) {
      toast.error('Category is required');
      return;
    }
    if (!editProductData.description || !editProductData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!editProductData.stock || parseInt(editProductData.stock) < 0) {
      toast.error('Valid stock quantity is required');
      return;
    }

    try {
      // Merge tags
      const inputTags = (editProductData.tagsInput || '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      const mergedTags = Array.from(new Set([...(editProductData.tags || []).map(t => String(t).trim().toLowerCase()), ...inputTags]));

      // Clean color variants
      const cleanColorVariants = (editProductData.colorVariants || [])
        .filter(v => v.name && v.hex)
        .map(v => ({
          name: v.name.trim(),
          hex: v.hex.trim(),
          images: (v.images || []).filter(img => img && img.trim()).map(img => typeof img === 'string' ? img : img?.url || img)
        }));

      // Prepare images array
      const images = editProductData.mainImage ? [{
        url: editProductData.mainImage,
        alt: editProductData.title,
        publicId: `nirvaanaa/${editingProduct}-${Date.now()}`
      }] : (editProductData.images || []);

      updateProductMutation.mutate({
        productId: editingProduct,
        productData: {
          ...editProductData,
          tags: mergedTags,
          colorVariants: cleanColorVariants.length > 0 ? cleanColorVariants : undefined,
          images: images,
          price: parseFloat(editProductData.price),
          stock: parseInt(editProductData.stock),
          comparePrice: editProductData.comparePrice ? parseFloat(editProductData.comparePrice) : undefined,
          discount: parseFloat(editProductData.discount) || 0,
          dimensions: {
            length: editProductData.dimensions.length ? parseFloat(editProductData.dimensions.length) : undefined,
            width: editProductData.dimensions.width ? parseFloat(editProductData.dimensions.width) : undefined,
            height: editProductData.dimensions.height ? parseFloat(editProductData.dimensions.height) : undefined,
            unit: editProductData.dimensions.unit || 'cm'
          },
          weight: {
            value: editProductData.weight.value ? parseFloat(editProductData.weight.value) : undefined,
            unit: editProductData.weight.unit || 'g'
          },
        }
      });
    } catch (err) {
      console.error('Prepare update error:', err);
      toast.error('Failed to prepare product update');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProductData({});
  };

  const handleDeleteProduct = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Chart data
  const numericKpiValues = (kpis || []).map(k => {
    const n = Number(String(k.value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(n) ? n : 0;
  });

  const chartData = {
    bar: {
      labels: analytics?.revenue?.map(r => r.date) || [],
      datasets: [
        {
          label: 'Revenue',
          data: analytics?.revenue?.map(r => r.value) || [],
          backgroundColor: '#bfae9e',
        },
        {
          label: 'Orders',
          data: analytics?.orders?.map(o => o.value) || [],
          backgroundColor: '#7c6a58',
        },
        // Plot stored KPIs as a separate series (index-based)
        ...(numericKpiValues.length ? [{
          label: 'KPIs',
          data: numericKpiValues,
          backgroundColor: '#e3e0d9',
        }] : []),
      ],
    },
    line: {
      labels: analytics?.revenue?.map(r => r.date) || [],
      datasets: [
        {
          label: 'Revenue Trend',
          data: analytics?.revenue?.map(r => r.value) || [],
          borderColor: '#bfae9e',
          backgroundColor: 'rgba(191, 174, 158, 0.1)',
          tension: 0.4,
        },
        ...(numericKpiValues.length ? [{
          label: 'KPIs',
          data: numericKpiValues,
          borderColor: '#e3e0d9',
          backgroundColor: 'rgba(227, 224, 217, 0.25)',
          tension: 0.4,
        }] : []),
      ],
    },
    doughnut: {
      labels: ['Revenue', 'Orders', 'Customers'],
      datasets: [
        {
          data: [
            analytics?.revenue?.reduce((sum, r) => sum + r.value, 0) || 0,
            analytics?.orders?.reduce((sum, o) => sum + o.value, 0) || 0,
            analytics?.customers?.reduce((sum, c) => sum + c.value, 0) || 0,
          ],
          backgroundColor: ['#bfae9e', '#7c6a58', '#e3e0d9'],
        },
      ],
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Analytics' },
    },
  };
  
  // Chart selection renderer
  const renderChart = () => {
    const cd = chartData[selectedChart] || chartData.line;
    return <KPIChart type={selectedChart} data={cd} options={chartOptions} />;
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
           Admin Dashboard
        </h1>

        {/* Real-time Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">Real-time Updates Active</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm">Live</span>
            </div>
          </div>
        </motion.div>

        {/* CSS for form inputs */}
        <style jsx>{`
          .input {
            @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent transition-all duration-200;
          }
          .glassmorphism {
            @apply bg-white bg-opacity-80 backdrop-blur-sm border border-white border-opacity-20;
          }
        `}</style>

        {/* KPIs - realtime section (delegated to KPISection component) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 w-full max-w-5xl"
        >
          <KPISection />
        </motion.div>

        {/* Create KPI Form */}
        

        {/* Banner Management */}
        <BannerProvider>
          <BannerManagementSection />
        </BannerProvider>

        {/* Shipping Management */}
        <ShippingManagementSection />

        {/* Analytics Charts */}
        <TagDiscountManager />  

        {/* Invoice Management */}
        <InvoiceTemplatesSection />

            {/* Products Management */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glassmorphism p-6 rounded-xl shadow-lg mb-8"
        >
          <h2 className={`${playfair.className} text-xl mb-4`}>Products Management</h2>
          
          {/* Create Product Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-6">
              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      placeholder="Enter product title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newProduct.comparePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, comparePrice: e.target.value })}
                      className="input"
                    />
                  </div>
                
                
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Discount (%) </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newProduct.discount}
                      onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                      className="input"
                    />
                  </div>
                
            </div>




                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="bangle-box">Bangle box</option>
                      <option value="clutch">Clutch</option>
                      <option value="gift-hampers">Gift Hampers</option>
                      <option value="goggle-cover">Goggle Cover</option>
                      <option value="kitty-bag">Kitty Bag</option>
                      <option value="long-tote-bag">Long Tote Bag</option>
                      <option value="picnic-bag">Picnic Bag</option>
                      <option value="potli-purse">Potli Purse</option>
                      <option value="sling-bags">Sling Bags</option>
                      <option value="velvet-clutch-with-flaps">Velvet Clutch with Flaps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      placeholder="Product SKU"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section (only description and tags) */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Product Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                    <textarea
                      placeholder="Detailed product description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="input"
                      rows="4"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tags (comma separated)
  </label>
  <input
    type="text"
    placeholder="featured, new, handmade, bangle-box, clutch, gift-hampers..."
    value={newProduct.tagsInput || ''}
    onChange={(e) =>
      setNewProduct({
        ...newProduct,
        tagsInput: e.target.value,
      })
    }
    onKeyDown={(e) => {
      if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        const newTags = newProduct.tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag && !newProduct.tags.includes(tag));
        if (newTags.length > 0) {
          setNewProduct({
            ...newProduct,
            tags: [...newProduct.tags, ...newTags],
            tagsInput: '',
          });
        }
      }
    }}
    className="input"
  />
  {newProduct.tags && newProduct.tags.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-2 items-center">
      <span className="text-xs text-gray-600 font-medium">Selected tags:</span>
      {newProduct.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-[#bfae9e] text-white text-xs rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => {
              setNewProduct({
                ...newProduct,
                tags: newProduct.tags.filter(t => t !== tag),
              });
            }}
            className="ml-1 hover:text-red-200"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )}
  <div className="mt-2 flex flex-wrap gap-2 items-center">
    <span className="text-xs text-gray-500">Suggested tags (click to add):</span>
    {['bangle-box', 'clutch', 'gift-hampers', 'goggle-cover', 'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse', 'sling-bags', 'velvet-clutch-with-flaps', 'featured', 'new', 'handmade'].map((tag) => (
      <button
        key={tag}
        type="button"
        onClick={() => {
          if (!newProduct.tags.includes(tag)) {
            setNewProduct({
              ...newProduct,
              tags: [...newProduct.tags, tag],
            });
          }
        }}
        disabled={newProduct.tags.includes(tag)}
        className={`px-2 py-1 text-xs rounded-full transition-colors ${
          newProduct.tags.includes(tag)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-brand-gold text-white hover:bg-[#7c6a58] cursor-pointer'
        }`}
      >
        {tag}
      </button>
    ))}
  </div>
</div>

                </div>
              </div>

              {/* Physical Properties Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Physical Properties</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Length"
                        value={newProduct.dimensions.length}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { ...newProduct.dimensions, length: e.target.value }
                        })}
                        className="input"
                      />
                      <input
                        type="number"
                        placeholder="Width"
                        value={newProduct.dimensions.width}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { ...newProduct.dimensions, width: e.target.value }
                        })}
                        className="input"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={newProduct.dimensions.height}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { ...newProduct.dimensions, height: e.target.value }
                        })}
                        className="input"
                      />
                      <select
                        value={newProduct.dimensions.unit}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          dimensions: { ...newProduct.dimensions, unit: e.target.value }
                        })}
                        className="input"
                      >
                        <option value="cm">cm</option>
                        <option value="inches">inches</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Weight"
                        value={newProduct.weight.value}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          weight: { ...newProduct.weight, value: e.target.value }
                        })}
                        className="input"
                      />
                      <select
                        value={newProduct.weight.unit}
                        onChange={(e) => setNewProduct({ 
                          ...newProduct, 
                          weight: { ...newProduct.weight, unit: e.target.value }
                        })}
                        className="input"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Color Variants</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Add color variants with associated images. Each color can have multiple images that will be displayed when the color is selected.
                </p>
                
                {newProduct.colorVariants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Color Variant {variantIndex + 1}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newProduct.colorVariants.filter((_, i) => i !== variantIndex);
                          setNewProduct({ ...newProduct, colorVariants: updated });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Red, Blue, Black"
                          value={variant.name || ''}
                          onChange={(e) => {
                            const updated = [...newProduct.colorVariants];
                            updated[variantIndex] = { ...variant, name: e.target.value };
                            setNewProduct({ ...newProduct, colorVariants: updated });
                          }}
                          className="input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color Hex Code *</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={variant.hex || '#000000'}
                            onChange={(e) => {
                              const updated = [...newProduct.colorVariants];
                              updated[variantIndex] = { ...variant, hex: e.target.value };
                              setNewProduct({ ...newProduct, colorVariants: updated });
                            }}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder="#000000"
                            value={variant.hex || ''}
                            onChange={(e) => {
                              const updated = [...newProduct.colorVariants];
                              updated[variantIndex] = { ...variant, hex: e.target.value };
                              setNewProduct({ ...newProduct, colorVariants: updated });
                            }}
                            className="input flex-1"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images for this Color ({variant.images?.length || 0} images)
                      </label>
                      <div className="space-y-2">
                        {variant.images?.map((img, imgIndex) => (
                          <div key={imgIndex} className="flex gap-2 items-center">
                            <ImageUpload
                              value={typeof img === 'string' ? img : img?.url || ''}
                              onChange={(url) => {
                                const updated = [...newProduct.colorVariants];
                                const variantImages = [...(variant.images || [])];
                                variantImages[imgIndex] = url;
                                updated[variantIndex] = { ...variant, images: variantImages };
                                setNewProduct({ ...newProduct, colorVariants: updated });
                              }}
                              placeholder={`Image ${imgIndex + 1} for ${variant.name || 'color'}`}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...newProduct.colorVariants];
                                const variantImages = variant.images.filter((_, i) => i !== imgIndex);
                                updated[variantIndex] = { ...variant, images: variantImages };
                                setNewProduct({ ...newProduct, colorVariants: updated });
                              }}
                              className="px-3 py-2 text-red-500 hover:text-red-700 text-sm border border-red-300 rounded hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...newProduct.colorVariants];
                            const variantImages = [...(variant.images || []), ''];
                            updated[variantIndex] = { ...variant, images: variantImages };
                            setNewProduct({ ...newProduct, colorVariants: updated });
                          }}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-colors"
                        >
                          + Add Image
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setNewProduct({
                      ...newProduct,
                      colorVariants: [...newProduct.colorVariants, { name: '', hex: '#000000', images: [] }]
                    });
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-colors"
                >
                  + Add Color Variant
                </button>
              </div>

              {/* Image Upload Section */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-4">Product Images (Default)</h4>
                <p className="text-xs text-gray-500 mb-4">
                  These images will be used if no color variants are specified or as fallback images.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image</label>
                  <ImageUpload
                    value={newProduct.mainImage}
                    onChange={(url) => setNewProduct({ ...newProduct, mainImage: url })}
                    placeholder="Upload main product image"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-8 py-3 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {createProductMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Product...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Edit Product Form */}
          {editingProduct && (
            <div id="edit-product-form" className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-[#bfae9e]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Product</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                {/* Basic Information - Same structure as create form */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={editProductData.title || ''}
                        onChange={(e) => setEditProductData({ ...editProductData, title: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={editProductData.price || ''}
                        onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (₹)</label>
                      <input
                        type="number"
                        value={editProductData.comparePrice || ''}
                        onChange={(e) => setEditProductData({ ...editProductData, comparePrice: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={editProductData.discount || 0}
                        onChange={(e) => setEditProductData({ ...editProductData, discount: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={editProductData.category || ''}
                        onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="bangle-box">Bangle box</option>
                        <option value="clutch">Clutch</option>
                        <option value="gift-hampers">Gift Hampers</option>
                        <option value="goggle-cover">Goggle Cover</option>
                        <option value="kitty-bag">Kitty Bag</option>
                        <option value="long-tote-bag">Long Tote Bag</option>
                        <option value="picnic-bag">Picnic Bag</option>
                        <option value="potli-purse">Potli Purse</option>
                        <option value="sling-bags">Sling Bags</option>
                        <option value="velvet-clutch-with-flaps">Velvet Clutch with Flaps</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        value={editProductData.stock || 0}
                        onChange={(e) => setEditProductData({ ...editProductData, stock: parseInt(e.target.value) || 0 })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={editProductData.sku || ''}
                        onChange={(e) => setEditProductData({ ...editProductData, sku: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Product Details</h4>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                    <textarea
                      value={editProductData.description || ''}
                      onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                      className="input"
                      rows="4"
                      required
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Product Image</h4>
                  <ImageUpload
                    value={editProductData.mainImage || ''}
                    onChange={(url) => setEditProductData({ ...editProductData, mainImage: url })}
                    placeholder="Upload main product image"
                    className="w-full"
                  />
                </div>

                {/* Publishing Options */}
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editProductData.published || false}
                      onChange={(e) => setEditProductData({ ...editProductData, published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editProductData.featured || false}
                      onChange={(e) => setEditProductData({ ...editProductData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updateProductMutation.isPending}
                    className="px-8 py-3 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                  >
                    {updateProductMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating Product...
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 p-4 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              ))
            ) : (
              products?.map((product) => (
                <motion.div
                  key={product._id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{product.title}</h3>
                      <p className="text-sm text-gray-600">₹{product.price?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category?.replace(/-/g, ' ')}</p>
                      <p className="text-xs text-gray-500 mt-1">Stock: {product.stock || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditProduct(product)}
                      disabled={editingProduct === product._id}
                      className="flex-1 px-3 py-2 bg-[#bfae9e] text-white text-sm rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50"
                    >
                      {editingProduct === product._id ? 'Editing...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deleteProductMutation.isPending}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Orders and Customers Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glassmorphism p-6 rounded-xl shadow-lg"
          >
            <h2 className={`${playfair.className} text-xl mb-4`}>Recent Orders</h2>
            <div className="space-y-2">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))
              ) : (
                orders?.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex justify-between items-center bg-[#f7f4ed] p-3 rounded-lg">
                    <span className={`${inter.className}`}>{order.orderNumber}</span>
                    <span className="text-xs text-[#7c6a58]">₹{order.total}</span>
                    <span className="text-xs text-[#7c6a58]">{order.status}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glassmorphism p-6 rounded-xl shadow-lg"
          >
            <h2 className={`${playfair.className} text-xl mb-4`}>Recent Customers</h2>
            <div className="space-y-2">
              {customersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))
              ) : (
                customers?.slice(0, 5).map((customer) => (
                  <div key={customer._id} className="flex justify-between items-center bg-[#f7f4ed] p-3 rounded-lg">
                    <span className={`${inter.className}`}>{customer.name}</span>
                    <span className="text-xs text-[#7c6a58]">{customer.email}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}

// Banner Management Section Component
function BannerManagementSection() {
  const { adBanner, announcementBanner, toggleBanner, loading } = useBanner();
  const [adTextInput, setAdTextInput] = useState('');
  const [annImageInput, setAnnImageInput] = useState('');

  useEffect(() => { 
    setAdTextInput(adBanner?.text || ''); 
  }, [adBanner?.text]);
  
  useEffect(() => { 
    setAnnImageInput(announcementBanner?.image || ''); 
  }, [announcementBanner?.image]);

  const handleToggleAd = async () => {
    if (!adBanner?._id) return toast.error('No ad banner');
    await toggleBanner({ 
      id: adBanner._id, 
      type: 'ad', 
      visible: !adBanner.isAdBannerActive, 
      content: adTextInput 
    });
  };

  const handleToggleAnnouncement = async () => {
    if (!announcementBanner?._id) return toast.error('No announcement banner');
    await toggleBanner({ 
      id: announcementBanner._id, 
      type: 'announcement', 
      visible: !announcementBanner.isAnnouncementActive, 
      content: annImageInput 
    });
  };

  const handleSaveAdText = async () => {
    if (!adBanner?._id) return toast.error('No ad banner');
    await toggleBanner({ 
      id: adBanner._id, 
      type: 'ad', 
      visible: Boolean(adBanner.isAdBannerActive), 
      content: adTextInput 
    });
  };

  const handleSaveAnnImage = async () => {
    if (!announcementBanner?._id) return toast.error('No announcement banner');
    await toggleBanner({ 
      id: announcementBanner._id, 
      type: 'announcement', 
      visible: Boolean(announcementBanner.isAnnouncementActive), 
      content: annImageInput 
    });
  };

  return <EnhancedBannerManager />;
}

// Shipping Management Section Component
function ShippingManagementSection() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newShipping, setNewShipping] = useState({
    name: '',
    description: '',
    cost: '',
    estimatedDays: {
      min: '',
      max: '',
      gstPercent: '',
    },
    freeShippingThreshold: '',
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping');
      const data = await response.json();
      if (response.ok) {
        setShippingMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      toast.error('Failed to fetch shipping methods');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipping = async (e) => {
    e.preventDefault();
    if (!newShipping.name || !newShipping.cost || !newShipping.estimatedDays.min || !newShipping.estimatedDays.max) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipping),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Shipping method created successfully');
        setNewShipping({
          name: '',
          description: '',
          cost: '',
          estimatedDays: { min: '', max: '' },
          freeShippingThreshold: '',
          isActive: true,
          isDefault: false,
          gstPercent: '',
        });
        fetchShippingMethods();
      } else {
        toast.error(data.error || 'Failed to create shipping method');
      }
    } catch (error) {
      console.error('Error creating shipping method:', error);
      toast.error('Failed to create shipping method');
    }
  };

  const handleDeleteShipping = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Shipping method deleted successfully');
        fetchShippingMethods();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete shipping method');
      }
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast.error('Failed to delete shipping method');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="glassmorphism p-6 rounded-xl shadow-lg mb-8"
    >
      <h2 className={`${playfair.className} text-xl mb-4`}>Shipping Management</h2>
      
      {/* Create Shipping Method Form */}
      <form onSubmit={handleCreateShipping} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Shipping Method Name"
            value={newShipping.name}
            onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })}
            className="input"
            required
          />
          <input
            type="number"
            placeholder="Cost (₹)"
            value={newShipping.cost}
            onChange={(e) => setNewShipping({ ...newShipping, cost: parseFloat(e.target.value) || 0 })}
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <input
            type="number"
            placeholder="Min Days"
            value={newShipping.estimatedDays.min}
            onChange={(e) => setNewShipping({ 
              ...newShipping, 
              estimatedDays: { ...newShipping.estimatedDays, min: parseInt(e.target.value) || 0 }
            })}
            className="input"
            required
          />
          <input
            type="number"
            placeholder="Max Days"
            value={newShipping.estimatedDays.max}
            onChange={(e) => setNewShipping({ 
              ...newShipping, 
              estimatedDays: { ...newShipping.estimatedDays, max: parseInt(e.target.value) || 0 }
            })}
            className="input"
            required
          />
        </div>

        <input
          type="number"
          placeholder="Free Shipping Threshold (₹) - Optional"
          value={newShipping.freeShippingThreshold}
          onChange={(e) => setNewShipping({ ...newShipping, freeShippingThreshold: parseFloat(e.target.value) || '' })}
          className="input"
        />

        <input
          type="number"
          placeholder="GST % (e.g., 18)"
          value={newShipping.gstPercent}
          onChange={(e) => setNewShipping({ ...newShipping, gstPercent: parseFloat(e.target.value) || 0 })}
          className="input"
        />

        <textarea
          placeholder="Description"
          value={newShipping.description}
          onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })}
          className="input ml-10"
          rows="2"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newShipping.isActive}
              onChange={(e) => setNewShipping({ ...newShipping, isActive: e.target.checked })}
              className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newShipping.isDefault}
              onChange={(e) => setNewShipping({ ...newShipping, isDefault: e.target.checked })}
              className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <span className="text-sm text-gray-700">Default</span>
          </label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors"
        >
          Create Shipping Method
        </button>
      </form>

      {/* Shipping Methods List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Current Shipping Methods</h3>
        {loading ? (
          <div className="text-center py-4">Loading shipping methods...</div>
        ) : shippingMethods.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No shipping methods configured</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingMethods.map((method) => (
              <div key={method._id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{method.name}</h4>
                    <p className="text-sm text-gray-600">₹{method.cost}</p>
                    <p className="text-xs text-gray-500">
                      {method.estimatedDays.min}-{method.estimatedDays.max} days
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                    {method.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                {method.description && (
                  <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                )}
                {method.freeShippingThreshold && (
                  <p className="text-xs text-gray-500">
                    Free shipping over ₹{method.freeShippingThreshold}
                  </p>
                )}
                <button
                  onClick={() => handleDeleteShipping(method._id)}
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
