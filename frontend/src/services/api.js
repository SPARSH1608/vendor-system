const API_BASE_URL = '/api'

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API call failed')
  }

  return data
}

// Auth API functions
export const authAPI = {
  register: (userData) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiCall('/auth/me'),

  updatePassword: (passwordData) =>
    apiCall('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
}

// Products API functions
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`)
  },

  getProductById: (id) => apiCall(`/products/${id}`),

  createProduct: (productData) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  toggleProductStatus: (id) =>
    apiCall(`/products/${id}/status`, {
      method: 'PUT',
    }),

  deleteProduct: (id) =>
    apiCall(`/products/${id}`, {
      method: 'DELETE',
    }),

  getProductStats: () => apiCall('/products/stats'),
}

// Users API functions
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/users${queryString ? `?${queryString}` : ''}`)
  },

  getUserById: (id) => apiCall(`/users/${id}`),

  updateUserRole: (userId, roleData) =>
    apiCall(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    }),

  toggleUserStatus: (userId) =>
    apiCall(`/users/${userId}/status`, {
      method: 'PUT',
    }),

  deleteUser: (userId) =>
    apiCall(`/users/${userId}`, {
      method: 'DELETE',
    }),

  getUserStats: () => apiCall('/users/stats'),
}

// Vendors API functions
export const vendorsAPI = {
  getVendorActivities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/vendors/activities${queryString ? `?${queryString}` : ''}`)
  },

  getMyActivities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/vendors/my-activities${queryString ? `?${queryString}` : ''}`)
  },

  createVendorActivity: (activityData) =>
    apiCall('/vendors/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    }),

  updateVendorActivity: (id, activityData) =>
    apiCall(`/vendors/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    }),

  deleteVendorActivity: (id) =>
    apiCall(`/vendors/activities/${id}`, {
      method: 'DELETE',
    }),

  getVendorStats: () => apiCall('/vendors/stats'),
}

// Invoices API functions
export const invoicesAPI = {
  generateInvoice: (invoiceData) =>
    apiCall('/invoices/generate', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    }),

  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/invoices${queryString ? `?${queryString}` : ''}`)
  },

  getInvoiceById: (id) => apiCall(`/invoices/${id}`),

  updateInvoiceStatus: (id, statusData) =>
    apiCall(`/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  downloadInvoicePDF: (id) =>
    apiCall(`/invoices/${id}/pdf`, {
      headers: {
        'Content-Type': 'application/pdf',
      },
    }),

  getInvoiceStats: () => apiCall('/invoices/stats'),
}

// QR API functions
export const qrAPI = {
  generateQRCode: (qrData) =>
    apiCall('/qr/generate', {
      method: 'POST',
      body: JSON.stringify(qrData),
    }),

  generatePaymentQR: (paymentData) =>
    apiCall('/qr/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
}
