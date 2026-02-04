const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./middleware/auth');

// Initialize Prisma
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all transactions for the authenticated user
router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create a new transaction
router.post("/", async (req, res) => {
  try {
    const { text, amount, category, date } = req.body;
    
    const transaction = await prisma.transaction.create({
      data: {
        text,
        amount: parseFloat(amount),
        category: category || 'General',
        date: date ? new Date(date) : new Date(),
        userId: req.user.userId
      }
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, amount, category, date } = req.body;

    const data = {
      text,
      amount: parseFloat(amount),
      category: category || 'General'
    };

    // Only update date if provided
    if (date) {
      data.date = new Date(date);
    }

    const result = await prisma.transaction.updateMany({
      where: {
        id: parseInt(id),
        userId: req.user.userId // Only update if owned by user
      },
      data
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.transaction.deleteMany({
      where: { 
        id: parseInt(id),
        userId: req.user.userId // Only delete if owned by user
      }
    });
    
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;

