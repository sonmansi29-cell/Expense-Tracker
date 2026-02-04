import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to Authorization header for all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if this is expected (e.g., BudgetManager without auth)
      // Don't clear token or redirect for expected unauthenticated endpoints
      const url = error.config?.url || '';
      const expectedAuthErrors = ['/budgets'];
      
      const isExpectedError = expectedAuthErrors.some(endpoint => url.includes(endpoint));
      
      if (!isExpectedError) {
        // Token expired or invalid for protected endpoints - clear storage and trigger logout
        localStorage.removeItem('token');
        
        // Dispatch custom event for components to react
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'Token expired' } 
        }));
        
        // Reload page to show login screen
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => API.post('/auth/login', credentials).then(res => res.data);
export const signup = (data) => API.post('/auth/register', data).then(res => res.data);

// Forgot Password endpoints
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email }).then(res => res.data);
export const resetPassword = (token, password) => API.post('/auth/reset-password', { token, password }).then(res => res.data);
export const fetchTransactions = () => API.get('/transactions').then(res => res.data);
export const addTransaction = (data) => API.post('/transactions', data).then(res => res.data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data).then(res => res.data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Analytics endpoints
export const fetchCategoryTotals = () => API.get('/analytics/category-totals').then(res => res.data);
export const fetchMonthlySummary = () => API.get('/analytics/monthly-summary').then(res => res.data);

// Budget endpoints
export const fetchBudgets = () => API.get('/budgets').then(res => res.data);
export const createBudget = (data) => API.post('/budgets', data).then(res => res.data);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data).then(res => res.data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// Export transactions to CSV
export const exportTransactionsToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // CSV header
  let csvContent = 'Date,Description,Category,Amount,Type\n';

  // Add data rows
  transactions.forEach(t => {
    const date = new Date(t.date).toLocaleDateString();
    const description = `"${t.text.replace(/"/g, '""')}"`; // Escape quotes
    const category = t.category;
    const amount = Math.abs(t.amount).toFixed(2);
    const type = t.amount >= 0 ? 'Income' : 'Expense';
    csvContent += `${date},${description},${category},${amount},${type}\n`;
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
