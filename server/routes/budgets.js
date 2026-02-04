const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./middleware/auth');

// Initialize Prisma
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all budgets for the authenticated user
router.get("/", async (req, res) => {
  try {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const budgets = await prisma.budget.findMany({
      where: { 
        userId: req.user.userId,
        month: month,
        year: year
      }
    });
    
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create a new budget
router.post("/", async (req, res) => {
  try {
    const { category, limit } = req.body;
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Check if budget already exists for this category/month/year
    const existing = await prisma.budget.findFirst({
      where: {
        userId: req.user.userId,
        category: category,
        month: month,
        year: year
      }
    });
    
    if (existing) {
      // Update existing budget
      const budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { limit: parseFloat(limit) }
      });
      return res.json(budget);
    }
    
    // Create new budget
    const budget = await prisma.budget.create({
      data: {
        category: category,
        limit: parseFloat(limit),
        month: month,
        year: year,
        userId: req.user.userId
      }
    });
    
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Update a budget
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.body;
    
    const budget = await prisma.budget.updateMany({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      },
      data: { limit: parseFloat(limit) }
    });
    
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete a budget
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.budget.deleteMany({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });
    
    res.json({ message: "Budget deleted" });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;

