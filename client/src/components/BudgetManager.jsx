import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Button, TextField, Select, MenuItem, 
  FormControl, InputLabel, IconButton, List, ListItem, ListItemText, 
  ListItemSecondaryAction, Box, Chip, LinearProgress, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../api';

const CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'General'];
const COLORS = {
  'Food': '#4caf50',
  'Rent': '#f44336',
  'Transport': '#ff9800',
  'Entertainment': '#2196f3',
  'Shopping': '#9c27b0',
  'General': '#795548',
};

function BudgetManager({ categoryTotals = [] }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');
  const [token, setToken] = useState(null);

  // Get token from localStorage
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  // Fetch budgets - with error handling
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: fetchBudgets,
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Create/Update budget mutation
  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
      setSelectedCategory('');
      setLimit('');
    },
  });

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
    },
  });

  // Get spending for a category
  const getSpending = (category) => {
    const catData = categoryTotals.find(c => c.category === category);
    return catData ? catData.total : 0;
  };

  // Get budget for a category
  const getBudget = (category) => {
    const budget = budgets.find(b => b.category === category);
    return budget ? budget.limit : null;
  };

  // Get budget ID for a category
  const getBudgetId = (category) => {
    const budget = budgets.find(b => b.category === category);
    return budget ? budget.id : null;
  };

  // Calculate percentage
  const getPercentage = (category) => {
    const budget = getBudget(category);
    const spending = getSpending(category);
    if (!budget) return 0;
    return Math.min((spending / budget) * 100, 100);
  };

  // Get status color based on percentage
  const getStatusColor = (category) => {
    const percentage = getPercentage(category);
    if (percentage >= 100) return '#f44336'; // Red - over budget
    if (percentage >= 80) return '#ff9800'; // Orange - warning
    return '#4caf50'; // Green - ok
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory || !limit) return;
    createMutation.mutate({
      category: selectedCategory,
      limit: parseFloat(limit),
    });
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setEditLimit(budget.limit.toString());
  };

  const handleSaveEdit = (budget) => {
    if (!editLimit) return;
    createMutation.mutate({
      category: budget.category,
      limit: parseFloat(editLimit),
    });
    setEditingId(null);
    setEditLimit('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLimit('');
  };

  // Show only categories that don't have a budget yet (for the form)
  const categoriesWithoutBudget = CATEGORIES.filter(cat => !getBudget(cat));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          💰 Budget Manager
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Set spending limits for each category to track your budget
        </Typography>

        {/* Add Budget Form */}
        {categoriesWithoutBudget.length > 0 && (
          <form onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoriesWithoutBudget.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Budget Limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                sx={{ width: 150 }}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography> }}
              />
              <Button 
                variant="contained" 
                type="submit"
                disabled={!selectedCategory || !limit || createMutation.isPending}
              >
                Add Budget
              </Button>
            </Box>
          </form>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Budget List with Progress */}
        {isLoading ? (
          <Typography>Loading budgets...</Typography>
        ) : budgets.length === 0 ? (
          <Typography color="textSecondary" sx={{ py: 2 }}>
            No budgets set yet. Add a budget above to start tracking!
          </Typography>
        ) : (
          <List>
            {budgets.map((budget) => {
              const spending = getSpending(budget.category);
              const percentage = getPercentage(budget.category);
              const isOverBudget = percentage >= 100;
              const isEditing = editingId === budget.id;

              return (
                <ListItem key={budget.id} sx={{ py: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS[budget.category] || '#795548',
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {budget.category}
                        </Typography>
                        {isOverBudget && (
                          <Chip 
                            label="Over Budget!" 
                            size="small" 
                            color="error"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        {isEditing ? (
                          <>
                            <TextField
                              size="small"
                              type="number"
                              value={editLimit}
                              onChange={(e) => setEditLimit(e.target.value)}
                              sx={{ width: 120 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleSaveEdit(budget)}
                                color="primary"
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={handleCancelEdit}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" color="textSecondary">
                              ${spending.toFixed(2)} / ${budget.limit.toFixed(2)}
                            </Typography>
                            <IconButton size="small" onClick={() => handleEdit(budget)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => deleteMutation.mutate(budget.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(budget.category),
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        {percentage.toFixed(0)}% used
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={isOverBudget ? 'error' : 'textSecondary'}
                      >
                        {isOverBudget 
                          ? `$${(spending - budget.limit).toFixed(2)} over` 
                          : `$${(budget.limit - spending).toFixed(2)} remaining`
                        }
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetManager;

