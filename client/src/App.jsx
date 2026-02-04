import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography,
  Button, TextField, List, ListItem, ListItemText, IconButton, MenuItem, Select, FormControl, InputLabel, Box, Tabs, Tab, Snackbar, Alert, LinearProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, addTransaction, deleteTransaction, updateTransaction, login, signup, fetchCategoryTotals, fetchMonthlySummary, exportTransactionsToCSV } from './api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import SpendingChart from './components/SpendingChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import BudgetManager from './components/BudgetManager';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const EXPENSE_COLORS = ['#f44336', '#ff9800', '#2196f3', '#9c27b0', '#795548', '#4caf50'];
const INCOME_COLORS = ['#4caf50', '#8bc34a', '#cddc39', '#009688', '#00bcd4', '#03a9f4'];
const CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'General'];
const BUDGET_LIMIT = 2000;

// Glassmorphism Card Style
const cardStyle = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
  }
};

// Helper function to format amount without minus signs
const formatAmount = (amount) => {
  const absValue = Math.abs(amount).toFixed(2);
  return `$${absValue}`;
};

// Helper function to get display amount and color for transaction list
const getTransactionDisplay = (amount) => {
  const absValue = Math.abs(amount).toFixed(2);
  const isExpense = amount < 0;
  return {
    display: `$${absValue}`,
    color: isExpense ? '#FF3D00' : '#00C853',
    prefix: isExpense ? '↓ ' : '↑ '
  };
};
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Auth Page Component with Clean White Design and Password Validation
function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Validation Logic
  const isLongEnough = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isStrong = isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial;

  // Calculate password strength score (0-100)
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (hasUpper) score += 20;
    if (hasLower) score += 20;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;
    return Math.min(score, 100);
  };

  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength < 40) return '#f44336'; // Red
    if (strength < 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };
  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await login({ email, password });
      } else {
        response = await signup({ name, email, password });
      }
      // Assuming the API returns { token: '...', user: {...} } or { token: '...' }
      const token = response.token || response;
      const userData = response.user || response;
      onLogin(token, userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card sx={{ p: 4, width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
          <Typography variant="h4" fontWeight="800" textAlign="center" gutterBottom>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          
          {!isLogin && (
            <TextField fullWidth label="Full Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField 
            fullWidth 
            label="Password" 
            type="password" 
            margin="normal" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          {/* Forgot Password Link */}
          <Button 
            fullWidth 
            sx={{ mt: 1, mb: 2 }} 
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Button>

          {/* Strength Indicator */}
          {!isLogin && (
            <Box sx={{ mt: 1, mb: 2 }}>
              {/* Password Strength Progress Bar */}
              {password.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">
                      Password Strength
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: getStrengthColor() }}>
                      {getStrengthLabel()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStrengthColor(),
                        borderRadius: 4,
                        transition: 'width 0.3s ease-in-out',
                      },
                    }}
                  />
                </Box>
              )}
              <Typography variant="caption" color={isLongEnough ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                {isLongEnough ? '✅' : '❌'} At least 8 characters
              </Typography>
              <Typography variant="caption" color={hasUpper ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                {hasUpper ? '✅' : '❌'} At least 1 uppercase letter (A-Z)
              </Typography>
              <Typography variant="caption" color={hasLower ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                {hasLower ? '✅' : '❌'} At least 1 lowercase letter (a-z)
              </Typography>
              <Typography variant="caption" color={hasNumber ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                {hasNumber ? '✅' : '❌'} At least 1 number (0-9)
              </Typography>
              <Typography variant="caption" color={hasSpecial ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                {hasSpecial ? '✅' : '❌'} At least 1 special character (!@#$%^&*()_+-=)
              </Typography>
            </Box>
          )}

          <Button 
            fullWidth 
            variant="contained" 
            disabled={!isLogin && !isStrong || loading}
            sx={{ mt: 3, py: 1.5, borderRadius: '12px', bgcolor: '#1A237E' }}
            onClick={handleSubmit}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </Button>

          <Button fullWidth sx={{ mt: 2 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </Card>
      </motion.div>
    </Box>
  );
}

function App() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Stores the logged-in name
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' for welcome, 'success' for logout
  const [showToast, setShowToast] = useState(false);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState('expense');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check if user is authenticated - reactive to localStorage changes
  const isAuthenticated = !!token;

  // Listen for auth changes from other components (like api interceptor)
  useEffect(() => {
    const handleAuthChange = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      // Only clear state if token is actually removed (not during login)
      // Don't show goodbye message here - it's only shown in handleLogout
      if (!storedToken && user) {
        setUser(null);
        setHasLoggedIn(false);
      }
    };
    window.addEventListener('auth:logout', handleAuthChange);
    return () => window.removeEventListener('auth:logout', handleAuthChange);
  }, [user]);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('General');

  const handleLogin = (token, userData = {}) => {
    // Clear any previous messages first
    setMessage('');
    setShowToast(false);
    
    const userName = userData.name || userData.email || 'User';
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userName);
    
    // Show welcome modal for new users (signup)
    // We can detect if this is a new user by checking if they were already logged in
    if (!hasLoggedIn && !localStorage.getItem('hasSeenWelcome')) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    
    setHasLoggedIn(true);
    // Show welcome message
    setMessage(`Welcome, ${userName}!`);
    setMessageType('info');
    setShowToast(true);
  };

  const handleLogout = () => {
    // Set message BEFORE clearing state
    setMessage(`Goodbye, ${user}! You have been logged out.`);
    setMessageType('success');
    setShowToast(true);
    setUser(null);
    localStorage.removeItem('token');
    setToken(null);
    setHasLoggedIn(false);
    // Clear the query cache on logout
    queryClient.clear();
  };

  // 1. Fetch Data - only fetch if authenticated
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    enabled: !!token,
  });

  // 2. Add Transaction Mutation
  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => queryClient.invalidateQueries(['transactions']),
  });

// 3. Delete Transaction Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries(['transactions']),
  });

  // 4. Update Transaction Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setEditingId(null);
      setEditText('');
      setEditAmount('');
      setEditCategory('General');
    },
  });

  // Analytics Queries - only fetch if authenticated
  const { data: categoryTotals = [] } = useQuery({
    queryKey: ['categoryTotals'],
    queryFn: fetchCategoryTotals,
    enabled: !!token,
  });

  const { data: monthlySummary } = useQuery({
    queryKey: ['monthlySummary'],
    queryFn: fetchMonthlySummary,
    enabled: !!token,
  });

  // Filter transactions by selected month and current year
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const monthMatch = tDate.getMonth() === selectedMonth;
    const yearMatch = tDate.getFullYear() === new Date().getFullYear();
    return monthMatch && yearMatch;
  });

  // Calculations
  const income = filteredTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = income - expense;

  // Group expenses by category
  const spendingByCategory = CATEGORIES.map(cat => {
    const total = filteredTransactions
      .filter(t => t.category === cat && t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  // Group income by category
  const incomeByCategory = CATEGORIES.map(cat => {
    const total = filteredTransactions
      .filter(t => t.category === cat && t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  // Create an array of daily cash flow for the selected month
  const lineChartData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dayTransactions = filteredTransactions.filter(
      (t) => new Date(t.date).getDate() === day
    );

    const dailyIncome = dayTransactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);

    const dailyExpense = dayTransactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      day: `Day ${day}`,
      Income: dailyIncome,
      Expense: dailyExpense
    };
  });

const handleAdd = (e) => {
    e.preventDefault();
    if (!text || !amount) return;

    // If user selected 'expense', we automatically make the number negative
    const finalAmount = type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    addMutation.mutate({
      text,
      amount: finalAmount,
      category
    });

    setText('');
    setAmount('');
    setCategory('General'); // Reset category
    setType('expense'); // Reset type
  };

  // Start editing a transaction
  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
    setEditAmount(t.amount.toString());
    setEditCategory(t.category);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditAmount('');
    setEditCategory('General');
  };

  // Save edited transaction
  const saveEdit = (id) => {
    if (!editText || !editAmount) return;
    updateMutation.mutate({
      id,
      data: {
        text: editText,
        amount: parseFloat(editAmount),
        category: editCategory,
      },
    });
  };

  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword onBackToLogin={() => navigate('/')} />} />
      <Route path="/reset-password" element={<ResetPassword onBackToLogin={() => navigate('/')} />} />
      <Route path="/" element={
        !token ? (
          <>
            <AuthPage onLogin={handleLogin} />
            {/* Toast Message (Welcome or Logout) - show even on auth page */}
            <Snackbar
              open={showToast}
              autoHideDuration={4000}
              onClose={() => setShowToast(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity={messageType} variant="filled" sx={{ width: '100%', borderRadius: '12px' }}>
                {message}
              </Alert>
            </Snackbar>
          </>
        ) : (
          <>
            {/* Main Dashboard */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, backgroundColor: '#F4F7FE', minHeight: '100vh', borderRadius: '20px', p: 3 }}>
              
              {/* Welcome Modal for New Users */}
              <Dialog
                open={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                PaperProps={{
                  sx: {
                    borderRadius: '24px',
                    padding: 2,
                    maxWidth: 450
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(26, 35, 126, 0.3)'
                      }}
                    >
                      <Typography variant="h2">🎉</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#1A237E' }}>
                      Welcome!
                    </Typography>
                  </DialogTitle>
                  <DialogContent sx={{ textAlign: 'center' }}>
                    <DialogContentText variant="h6" sx={{ color: '#333', mb: 2 }}>
                      Welcome to Expense Tracker, <strong>{user}</strong>!
                    </DialogContentText>
                    <DialogContentText variant="body1" sx={{ color: '#666', mb: 2 }}>
                      Thank you for joining us. Let's start tracking your finances!
                    </DialogContentText>
                    <Box
                      sx={{
                        bgcolor: '#f0f4ff',
                        borderRadius: 2,
                        p: 2,
                        mt: 2
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#1A237E', fontWeight: 500 }}>
                        💡 Tip: Use the dashboard to add transactions, view charts, and monitor your spending.
                      </Typography>
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                    <Button
                      variant="contained"
                      onClick={() => setShowWelcomeModal(false)}
                      sx={{
                        bgcolor: '#1A237E',
                        borderRadius: '12px',
                        px: 4,
                        py: 1,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: '#0D1442'
                        }
                      }}
                    >
                      Let's Get Started
                    </Button>
                  </DialogActions>
                </motion.div>
              </Dialog>

              <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#1A237E' }}>
                    Hello, <span style={{ color: '#00C853' }}>{user}</span>
                  </Typography>
                  <Typography color="textSecondary">Here is your financial status today</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportTransactionsToCSV(transactions)}
                    sx={{ borderRadius: '12px' }}
                  >
                    Export CSV
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: '12px' }}>
                    Logout
                  </Button>
                </Box>
              </Box>


              <Grid size={12}>
                <FormControl sx={{ minWidth: 200, mb: 2 }}>
                  <InputLabel>View Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="View Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid container spacing={3}>
                {/* Summary Cards - Enhanced with Icons and Glassmorphism */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card sx={{
                      ...cardStyle,
                      bgcolor: balance >= 0 ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 61, 0, 0.1)',
                      border: balance >= 0 ? '1px solid rgba(0, 200, 83, 0.3)' : '1px solid rgba(255, 61, 0, 0.3)'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AccountBalanceWalletIcon sx={{ color: balance >= 0 ? '#00C853' : '#FF3D00' }} />
                          <Typography color="textSecondary">Balance</Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          sx={{
                            color: balance >= 0 ? '#00C853' : '#FF3D00',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatAmount(balance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card sx={{
                      ...cardStyle,
                      bgcolor: 'rgba(0, 200, 83, 0.1)',
                      border: '1px solid rgba(0, 200, 83, 0.3)'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TrendingUpIcon sx={{ color: '#00C853' }} />
                          <Typography color="textSecondary">Income</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: '#00C853', fontWeight: 'bold' }}>
                          {formatAmount(income)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card sx={{
                      ...cardStyle,
                      bgcolor: 'rgba(255, 61, 0, 0.1)',
                      border: '1px solid rgba(255, 61, 0, 0.3)'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TrendingDownIcon sx={{ color: '#FF3D00' }} />
                          <Typography color="textSecondary">Expenses</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: '#FF3D00', fontWeight: 'bold' }}>
                          {formatAmount(expense)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

        {/* Budget Alert */}
        {expense > BUDGET_LIMIT && (
          <Grid size={12}>
            <Typography color="error" sx={{ fontWeight: 'bold', mb: 2 }}>
              ⚠️ Warning: You have exceeded your monthly budget of ${BUDGET_LIMIT}!
            </Typography>
          </Grid>
        )}

        {/* Form and List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, mb: 2 }}>
            <form onSubmit={handleAdd}>
              <TextField fullWidth label="Transaction Name" value={text} onChange={(e) => setText(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" type="submit" fullWidth disabled={addMutation.isPending}>Add Transaction</Button>
            </form>
          </Card>

<List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            {filteredTransactions.map((t) => (
              <ListItem key={t.id} secondaryAction={
                <Box>
                  {editingId === t.id ? (
                    <>
                      <Button 
                        size="small" 
                        color="primary" 
                        onClick={() => saveEdit(t.id)}
                        disabled={updateMutation.isPending}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button size="small" onClick={cancelEdit} sx={{ mr: 1 }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton edge="end" onClick={() => startEdit(t)} sx={{ mr: 1 }}>
                        <span role="img" aria-label="edit">✏️</span>
                      </IconButton>
                      <IconButton edge="end" onClick={() => deleteMutation.mutate(t.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              }>
                {editingId === t.id ? (
                  // Edit mode
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Transaction Name"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Amount"
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editCategory}
                        label="Category"
                        onChange={(e) => setEditCategory(e.target.value)}
                      >
                        {CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  // Display mode - using helper function to show amounts without minus signs
                  <ListItemText 
                    primary={t.text} 
                    secondary={
                      <span>
                        <span style={{ 
                          color: t.amount < 0 ? '#f44336' : '#4caf50',
                          fontWeight: 600
                        }}>
                          {getTransactionDisplay(t.amount).prefix}{getTransactionDisplay(t.amount).display}
                        </span>
                        <span style={{ marginLeft: 8, padding: '2px 6px', backgroundColor: '#e0e0e0', borderRadius: 4, fontSize: '0.75rem' }}>
                          {t.category}
                        </span>
                      </span>
                    }
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Dual Pie Charts - Income & Expenses Breakdown */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            💰 Income vs Expenses Breakdown
          </Typography>
        </Grid>
        
        {/* Income Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 480 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#00C853' }}>
                ↑ Income by Category
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 50 }}>
                      <Pie 
                        data={incomeByCategory} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend verticalAlign="bottom" height={40} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 480 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#c62828' }}>
                ↓ Expenses by Category
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 50 }}>
                      <Pie 
                        data={spendingByCategory} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend verticalAlign="bottom" height={40} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Area Chart */}
        <Grid size={12}>
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Cash Flow Trend</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF3D00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="Income" stroke="#00C853" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                  <Area type="monotone" dataKey="Expense" stroke="#FF3D00" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Analytics Dashboard */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
            📊 Analytics Dashboard
          </Typography>
        </Grid>

        {/* Category Totals Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Spending by Category</Typography>
            {categoryTotals.length > 0 ? (
              <SpendingChart data={categoryTotals} />
            ) : (
              <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                No spending data for this month
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          {categoryTotals.length > 0 ? (
            <CategoryBreakdown data={categoryTotals} />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                <Typography color="textSecondary">
                  No spending data available for this month
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Monthly Summary Stats */}
        {monthlySummary && (
          <Grid size={12}>
            <Card sx={{ bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>📅 Monthly Summary (Server Data)</Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">Income</Typography>
                      <Typography variant="h5" sx={{ color: '#00C853', fontWeight: 'bold' }}>
                        {formatAmount(parseFloat(monthlySummary.income))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">Expenses</Typography>
                      <Typography variant="h5" sx={{ color: '#FF3D00', fontWeight: 'bold' }}>
                        {formatAmount(parseFloat(monthlySummary.expenses))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">Balance</Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: parseFloat(monthlySummary.balance) >= 0 ? 'green' : 'red'
                        }}>
                        {formatAmount(parseFloat(monthlySummary.balance))}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                  {monthlySummary.transactionCount} transactions this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Budget Manager */}
        <Grid size={12}>
          <BudgetManager categoryTotals={categoryTotals} />
        </Grid>
      </Grid>
      </Container>
      </>
      )}
    />
    </Routes>
  );
}

export default App;
