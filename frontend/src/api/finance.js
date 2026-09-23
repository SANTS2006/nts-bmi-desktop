import { apiRequest } from './client.js';

const data = (r) => r?.data ?? r;
const id = (v, label = 'ID') => { if (!v) throw new Error(`${label} is required.`); };
const qs = (params) => { const q = new URLSearchParams(); Object.entries(params || {}).forEach(([k,v]) => { if (v !== '' && v !== null && v !== undefined) q.set(k, v instanceof Date ? v.toISOString() : String(v)); }); return q.toString() ? `?${q}` : ''; };

export const getFinanceDashboard = (params = {}) => apiRequest(`/api/finance/reports/dashboard${qs(params)}`);
export const getProfitAndLoss = (params = {}) => apiRequest(`/api/finance/reports/profit-loss${qs(params)}`);
export const getCashFlow = (params = {}) => apiRequest(`/api/finance/reports/cash-flow${qs(params)}`);
export const getReceivables = (params = {}) => apiRequest(`/api/finance/reports/receivables${qs(params)}`);
export const getBudgetUtilization = (budgetId) => { id(budgetId, 'Budget ID'); return apiRequest(`/api/finance/reports/budgets/${encodeURIComponent(budgetId)}/utilization`); };

export const getAccounts = (params = {}) => apiRequest(`/api/finance/accounts${qs(params)}`);
export const getAccount = (idValue) => { id(idValue,'Account ID'); return apiRequest(`/api/finance/accounts/${encodeURIComponent(idValue)}`); };
export const createAccount = (body) => apiRequest('/api/finance/accounts',{method:'POST',body});
export const updateAccount = (idValue,body) => { id(idValue,'Account ID'); return apiRequest(`/api/finance/accounts/${encodeURIComponent(idValue)}`,{method:'PATCH',body}); };

export const getCategories = (params = {}) => apiRequest(`/api/finance/categories${qs(params)}`);
export const getCategory = (idValue) => { id(idValue,'Category ID'); return apiRequest(`/api/finance/categories/${encodeURIComponent(idValue)}`); };
export const createCategory = (body) => apiRequest('/api/finance/categories',{method:'POST',body});
export const updateCategory = (idValue,body) => { id(idValue,'Category ID'); return apiRequest(`/api/finance/categories/${encodeURIComponent(idValue)}`,{method:'PATCH',body}); };
export const deleteCategory = (idValue) => { id(idValue,'Category ID'); return apiRequest(`/api/finance/categories/${encodeURIComponent(idValue)}`,{method:'DELETE'}); };

export const getTransactions = (params = {}) => apiRequest(`/api/finance/transactions${qs(params)}`);
export const getTransaction = (idValue) => { id(idValue,'Transaction ID'); return apiRequest(`/api/finance/transactions/${encodeURIComponent(idValue)}`); };
export const createTransaction = (body) => apiRequest('/api/finance/transactions',{method:'POST',body});
export const updateTransaction = (idValue,body) => { id(idValue,'Transaction ID'); return apiRequest(`/api/finance/transactions/${encodeURIComponent(idValue)}`,{method:'PATCH',body}); };
export const cancelTransaction = (idValue) => { id(idValue,'Transaction ID'); return apiRequest(`/api/finance/transactions/${encodeURIComponent(idValue)}/cancel`,{method:'POST',body:{}}); };
export const createTransfer = (body) => apiRequest('/api/finance/transactions/transfer',{method:'POST',body});

export const getInvoices = (params = {}) => apiRequest(`/api/finance/invoices${qs(params)}`);
export const getInvoice = (idValue) => { id(idValue,'Invoice ID'); return apiRequest(`/api/finance/invoices/${encodeURIComponent(idValue)}`); };
export const createInvoice = (body) => apiRequest('/api/finance/invoices',{method:'POST',body});
export const updateInvoice = (idValue,body) => { id(idValue,'Invoice ID'); return apiRequest(`/api/finance/invoices/${encodeURIComponent(idValue)}`,{method:'PATCH',body}); };
export const sendInvoice = (idValue) => { id(idValue,'Invoice ID'); return apiRequest(`/api/finance/invoices/${encodeURIComponent(idValue)}/send`,{method:'POST',body:{}}); };
export const cancelInvoice = (idValue) => { id(idValue,'Invoice ID'); return apiRequest(`/api/finance/invoices/${encodeURIComponent(idValue)}/cancel`,{method:'POST',body:{}}); };
export const markOverdueInvoices = () => apiRequest('/api/finance/invoices/mark-overdue',{method:'POST',body:{}});

export const getPayments = (params = {}) => apiRequest(`/api/finance/payments${qs(params)}`);
export const getPayment = (idValue) => { id(idValue,'Payment ID'); return apiRequest(`/api/finance/payments/${encodeURIComponent(idValue)}`); };
export const createPayment = (body) => apiRequest('/api/finance/payments',{method:'POST',body});
export const refundPayment = (idValue) => { id(idValue,'Payment ID'); return apiRequest(`/api/finance/payments/${encodeURIComponent(idValue)}/refund`,{method:'POST',body:{}}); };

export const getBudgets = (params = {}) => apiRequest(`/api/finance/budgets${qs(params)}`);
export const getBudget = (idValue) => { id(idValue,'Budget ID'); return apiRequest(`/api/finance/budgets/${encodeURIComponent(idValue)}`); };
export const createBudget = (body) => apiRequest('/api/finance/budgets',{method:'POST',body});
export const updateBudget = (idValue,body) => { id(idValue,'Budget ID'); return apiRequest(`/api/finance/budgets/${encodeURIComponent(idValue)}`,{method:'PATCH',body}); };
export const closeBudget = (idValue) => { id(idValue,'Budget ID'); return apiRequest(`/api/finance/budgets/${encodeURIComponent(idValue)}/close`,{method:'POST',body:{}}); };
