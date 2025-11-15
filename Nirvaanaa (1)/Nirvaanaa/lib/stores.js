import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/lib/indexeddbStorage';

// Cart Store
export const useCartStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // Actions
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const productId = product.id || product._id;
        const existingItem = items.find(item => item.id === productId);
        
        // Check if product is in stock
        if (product.stock !== undefined && product.stock < quantity) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }
        
        if (existingItem) {
          // Check if adding more would exceed stock
          const newQuantity = existingItem.quantity + quantity;
          if (product.stock !== undefined && product.stock < newQuantity) {
            throw new Error(`Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} available`);
          }
          
          // Update color variant if provided and different
          const updatedItem = { ...existingItem, quantity: newQuantity };
          if (product.colorVariant) {
            updatedItem.colorVariant = product.colorVariant;
            updatedItem.image = product.image || product.mainImage || existingItem.image;
          }
          
          set({
            items: items.map(item =>
              item.id === productId ? updatedItem : item
            )
          });
        } else {
          set({
            items: [...items, {
              id: productId,
              productId: productId,
              name: product.name || product.title,
              price: product.price,
              discount: product.discount || 0,
              image: product.image || product.mainImage,
              quantity,
              slug: product.slug,
              colorVariant: product.colorVariant || null,
            }]
          });
        }
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter(item => item.id !== productId) });
        } else {
          set({
            items: items.map(item =>
              item.id === productId
                ? { ...item, quantity }
                : item
            )
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Computed values
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getItem: (productId) => {
        const { items } = get();
        return items.find(item => item.id === productId);
      },
    })),
    {
      name: 'nirvaanaa-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Wishlist Store
export const useWishlistStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // Actions
      addItem: (product) => {
        const { items } = get();
        const productId = product.id || product._id;
        const exists = items.find(item => item.id === productId);
        
        if (!exists) {
          set({
            items: [...items, {
              id: productId,
              productId: productId,
              name: product.name || product.title,
              price: product.price,
              discount: product.discount || 0,
              image: product.image || product.mainImage,
              slug: product.slug,
              addedAt: new Date().toISOString(),
            }]
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== productId) });
      },

      clearWishlist: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Computed values
      getCount: () => {
        const { items } = get();
        return items.length;
      },

      hasItem: (productId) => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },
    })),
    {
      name: 'nirvaanaa-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Admin Store with persistence
export const useAdminStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
    products: [],
    orders: [],
    customers: [],
    kpis: [],
    analytics: {
      revenue: [],
      orders: [],
      customers: [],
    },
    isLoading: false,
    error: null,

    // Actions
    setProducts: (products) => set({ products }),
    setOrders: (orders) => set({ orders }),
    setCustomers: (customers) => set({ customers }),
    setKpis: (kpis) => set({ kpis }),
    setAnalytics: (analytics) => set({ analytics }),

    addProduct: (product) => {
      const { products } = get();
      set({ products: [product, ...products] });
    },

    updateProduct: (productId, updates) => {
      const { products } = get();
      set({
        products: products.map(product => {
          if (product._id === productId || product.id === productId) {
            const updatedProduct = { ...product, ...updates };
            // Ensure stock is never negative
            if (updatedProduct.stock !== undefined && updatedProduct.stock < 0) {
              updatedProduct.stock = 0;
            }
            // Ensure salesCount is never negative
            if (updatedProduct.salesCount !== undefined && updatedProduct.salesCount < 0) {
              updatedProduct.salesCount = 0;
            }
            return updatedProduct;
          }
          return product;
        })
      });
    },

    removeProduct: (productId) => {
      const { products } = get();
      set({ products: products.filter(product => product._id !== productId) });
    },

    addOrder: (order) => {
      const { orders } = get();
      set({ orders: [order, ...orders] });
    },

    updateOrder: (orderId, updates) => {
      const { orders } = get();
      set({
        orders: orders.map(order =>
          order._id === orderId ? { ...order, ...updates } : order
        )
      });
    },

    removeOrder: (orderId) => {
      const { orders } = get();
      set({ orders: orders.filter(order => order._id !== orderId) });
    },

    addCustomer: (customer) => {
      const { customers } = get();
      set({ customers: [customer, ...customers] });
    },

    updateCustomer: (customerId, updates) => {
      const { customers } = get();
      set({
        customers: customers.map(customer =>
          customer._id === customerId ? { ...customer, ...updates } : customer
        )
      });
    },

    removeCustomer: (customerId) => {
      const { customers } = get();
      set({ customers: customers.filter(customer => customer._id !== customerId) });
    },

    addKpi: (kpi) => {
      const { kpis } = get();
      set({ kpis: [kpi, ...kpis] });
    },

    updateKpi: (kpiId, updates) => {
      const { kpis } = get();
      set({
        kpis: kpis.map(kpi =>
          kpi._id === kpiId ? { ...kpi, ...updates } : kpi
        )
      });
    },

    removeKpi: (kpiId) => {
      const { kpis } = get();
      set({ kpis: kpis.filter(kpi => kpi._id !== kpiId) });
    },

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Computed values
    getProductCount: () => {
      const { products } = get();
      return products.length;
    },

    getOrderCount: () => {
      const { orders } = get();
      return orders.length;
    },

    getCustomerCount: () => {
      const { customers } = get();
      return customers.length;
    },

    getTotalRevenue: () => {
      const { orders } = get();
      return orders.reduce((total, order) => total + (order.total || 0), 0);
    },

    // Helper to get a specific product by ID
    getProduct: (productId) => {
      const { products } = get();
      return products.find(product => product._id === productId || product.id === productId);
    },
  })),
  {
    name: 'nirvaanaa-admin-store',
    partialize: (state) => ({ 
      products: state.products.map(product => ({
        _id: product._id,
        id: product.id,
        title: product.title,
        name: product.name,
        price: product.price,
        stock: product.stock,
        salesCount: product.salesCount,
        ratings: product.ratings,
        category: product.category,
        slug: product.slug,
        mainImage: product.mainImage,
        discount: product.discount,
        featured: product.featured,
        inStock: product.inStock
      }))
    }),
    storage: indexedDbStorage,
  }))



// Real-time Store for WebSocket connections
export const useRealtimeStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
  setReconnectAttempts: (attempts) => set({ reconnectAttempts: attempts }),

  connect: () => {
    const { socket } = get();
    if (socket) {
      socket.connect();
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
  },
}));
