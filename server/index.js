require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  // Copy your EXACT frontend URL from the browser bar
  origin: 'https://expense-tracker-1-d6wy.onrender.com', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ROUTES
const authRoutes = require("./routes/auth");
const transactionsRoutes = require("./routes/transactions");
const analyticsRoutes = require("./routes/analytics");
const budgetsRoutes = require("./routes/budgets");

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetsRoutes);

// ROOT TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API is running 🚀",
    routes: [
      "GET /api/transactions",
      "POST /api/transactions",
      "DELETE /api/transactions/:id",
      "GET /api/analytics/category-totals",
      "GET /api/analytics/monthly-summary"
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

