require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: 'https://expense-tracker-1-d6wy.onrender.com'
}));
app.use(express.json());

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

// Serve React static files in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  // Point to your React build folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Redirect all other requests to the React app
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  );
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

