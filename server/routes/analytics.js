const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./middleware/auth');

// Initialize Prisma
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get category totals for the authenticated user
router.get("/category-totals", async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: req.user.userId,
        date: { gte: startOfMonth }
      }
    });
    
    // Calculate totals by category - return as array with proper format for frontend
    const categoryMap = {};
    transactions.forEach(t => {
      const category = t.category || 'General';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      // Ensure amount is a number before parsing
      const amount = parseFloat(t.amount) || 0;
      if (amount < 0) {
        // Expense (negative amount) - track spending
        categoryMap[category] += Math.abs(amount);
      } else {
        // Income (positive amount) - also track
        categoryMap[category] += amount;
      }
    });
    
    // Convert to array format expected by frontend
    const categoryTotals = Object.entries(categoryMap).map(([category, total]) => ({
      category,
      total: Number(total.toFixed(2))
    }));
    
    res.json(categoryTotals);
  } catch (error) {
    console.error('Error fetching category totals:', error);
    res.status(500).json({ error: 'Failed to fetch category totals' });
  }
});

// Get monthly summary for the authenticated user
router.get("/monthly-summary", async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: req.user.userId,
        date: { gte: startOfMonth }
      }
    });
    
    // Calculate totals - ensure all values are Numbers
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      if (amount < 0) {
        expense += Math.abs(amount);
      } else {
        income += amount;
      }
    });
    
    const balance = income - expense;
    
    res.json({
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

module.exports = router;

