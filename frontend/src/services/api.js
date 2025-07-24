import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // DO NOT set Content-Type here globally!
});

// Add an interceptor to include the auth token in requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    // If data is FormData, do NOT set Content-Type (let browser handle it)
    let headers = options.headers || {};
    if (options.data instanceof FormData) {
      // Remove Content-Type if present
      if (headers["Content-Type"]) delete headers["Content-Type"];
    } else {
      // For JSON, set Content-Type
      headers["Content-Type"] = "application/json";
    }

    const response = await axiosInstance.request({
      url: endpoint,
      ...options,
      headers,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "API call failed";
    throw new Error(message);
  }
};

// Auth API functions
export const authAPI = {
  register: (userData) =>
    apiCall("/auth/register", {
      method: "POST",
      data: userData,
    }),

  login: (credentials) =>
    apiCall("/auth/login", {
      method: "POST",
      data: credentials,
    }),

  getMe: () => apiCall("/auth/me"),

  updatePassword: (passwordData) =>
    apiCall("/auth/password", {
      method: "PUT",
      data: passwordData,
    }),
};

// Products API functions
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ""}`);
  },

  getProductById: (id) => apiCall(`/products/${id}`),

  createProduct: (productData) =>
    apiCall("/products", {
      method: "POST",
      data: productData,
    }),

  updateProduct: (id, productData) =>
    apiCall(`/products/${id}`, {
      method: "PUT",
      data: productData,
    }),

  toggleProductStatus: (id) =>
    apiCall(`/products/${id}/status`, {
      method: "PUT",
    }),

  deleteProduct: (id) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
    }),

  getProductStats: () => apiCall("/products/stats"),

  getVendorsByProduct: (productId) =>
    apiCall(`/products/${productId}/vendors`, {
      method: "GET",
    }),
};

// Vendors API functions
export const vendorsAPI = {
  getVendorActivities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/vendors/activities${queryString ? `?${queryString}` : ""}`);
  },

  getVendorProducts: () => apiCall("/vendors/available-products"),

  selectVendorProduct: (productId) =>
    apiCall("/vendors/products", {
      method: "POST",
      data: { product_id: productId },
    }),

  deselectVendorProduct: (productId) =>
    apiCall(`/vendors/products/${productId}`, {
      method: "DELETE",
    }),

  getVendorBills: () =>
    apiCall("/vendors/bills"),

  getVendorBillStats: () =>
    apiCall("/vendors/bills/stats"),

  updateBillStatus: (billId, status) =>
    apiCall(`/vendors/bills/${billId}/status`, {
      method: "PUT",
      data: { status },
    }),

  getMyActivities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/vendors/my-activities${queryString ? `?${queryString}` : ""}`);
  },

  getVendorProductsById: (vendorId) =>
    apiCall(`/vendors/${vendorId}/products`, {
      method: "GET",
    }),
};

// Users API functions
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users${queryString ? `?${queryString}` : ""}`);
  },

  updateUserRole: (userId, roleData) =>
    apiCall(`/users/${userId}/role`, {
      method: "PUT",
      data: roleData,
    }),

  updateUserStatus: (userId, status) =>
    apiCall(`/users/${userId}/status`, {
      method: "PUT",
      data: { status },
    }),

  toggleUserStatus: (userId) =>
    apiCall(`/users/${userId}/status`, {
      method: "PUT",
    }),
};

// Invoices API functions
export const invoicesAPI = {
  generateInvoice: (invoiceData) =>
    apiCall("/invoices/generate", {
      method: "POST",
      data: invoiceData,
    }),
  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/invoices${queryString ? `?${queryString}` : ""}`);
  },
  updateInvoiceStatus: (id, status) =>
    apiCall(`/invoices/${id}/status`, {
      method: "PUT",
      data: { status },
    }),
  downloadInvoicePDF: async (invoiceId) => {
    const response = await axiosInstance.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob", // Ensure the response is treated as a file
    });
    return response;
  },
};

// Admin API functions
export const adminAPI = {
  getDashboardStats: () => apiCall("/vendors/stats"),
  // Add more admin endpoints as needed
};

export const customersAPI = {
  getCustomerByPhone: (phone) =>
    apiCall(`/customers/${phone}`, {
      method: "GET",
    }),
};

// Super Admin API functions
export const superAdminAPI = {
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/super-admin/users${queryString ? `?${queryString}` : ""}`);
  },

  getUserById: (userId) =>
    apiCall(`/super-admin/users/${userId}`, {
      method: "GET",
    }),

  updateUserRole: (userId, role) =>
    apiCall(`/super-admin/users/${userId}/role`, {
      method: "PUT",
      data: { role },
    }),

  updateUserStatus: (userId, status) =>
    apiCall(`/super-admin/users/${userId}/status`, {
      method: "PUT",
      data: { status },
    }),

  deleteUser: (userId) =>
    apiCall(`/super-admin/users/${userId}`, {
      method: "DELETE",
    }),

  getUserStats: () =>
    apiCall("/super-admin/users/stats", {
      method: "GET",
    }),
};
