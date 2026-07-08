import axios from 'axios';
import toast from 'react-hot-toast';

// Dynamic default API URL detector based on window location hostname
const getDefaultApiUrl = () => {
  const custom = localStorage.getItem('custom_api_url');
  if (custom) return custom;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'https://ai-erp-djab.onrender.com/api';
};

// Instantiate Axios with backend URL
const api = axios.create({
  baseURL: getDefaultApiUrl(),
  timeout: 15000,
});

// Request interceptor to dynamically update the baseURL from localStorage or hostname matching
api.interceptors.request.use(
  (config) => {
    config.baseURL = getDefaultApiUrl();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    // If response contains success:false, treat it as an error
    if (response.data && response.data.success === false) {
      const errorMsg = response.data.message || 'Operation failed';
      toast.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Network error, please try again';
    toast.error(errorMsg);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Dashboard Endpoints
  getDashboardStats: async () => {
    const res = await api.get('/dashboard');
    return res.data?.data || res.data;
  },

  // Text-to-SQL AI Endpoint (mapped to /ask on server)
  askNaturalLanguageQuery: async (question) => {
    const res = await api.post('/ask', { question });
    return res.data?.data || res.data;
  },

  // Finished Goods (Products) Endpoints
  getProducts: async () => {
    const res = await api.get('/products');
    return res.data?.data || res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data?.data || res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data?.data || res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data?.data || res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data?.data || res.data;
  },

  syncAllProductsToTypesense: async () => {
    const res = await api.post('/products/sync');
    return res.data?.data || res.data;
  },

  // Semantic Image Search Endpoint (Multipart Form Data)
  imageSearch: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await api.post('/image-search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data || res.data;
  },

  // Suppliers, Buyers, Orders, Invoices
  getSuppliers: async () => {
    const res = await api.get('/suppliers');
    return res.data?.data || res.data;
  },

  getBuyers: async () => {
    const res = await api.get('/buyers');
    return res.data?.data || res.data;
  },

  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data?.data || res.data;
  },

  getInvoices: async () => {
    const res = await api.get('/invoices');
    return res.data?.data || res.data;
  }
};

export default api;
