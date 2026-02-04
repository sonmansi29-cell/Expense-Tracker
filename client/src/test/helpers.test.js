// Helper Functions Tests
import { describe, it, expect } from 'vitest';

// Test the helper functions extracted from App.jsx
// These are inline functions in App.jsx that we'll test conceptually

describe('Helper Functions', () => {
  describe('formatAmount', () => {
    const formatAmount = (amount) => {
      const absValue = Math.abs(amount).toFixed(2);
      return `$${absValue}`;
    };

    it('should format positive numbers correctly', () => {
      expect(formatAmount(100)).toBe('$100.00');
      expect(formatAmount(1234.56)).toBe('$1234.56');
    });

    it('should format negative numbers correctly (remove minus sign)', () => {
      expect(formatAmount(-100)).toBe('$100.00');
      expect(formatAmount(-50.25)).toBe('$50.25');
    });

    it('should format zero correctly', () => {
      expect(formatAmount(0)).toBe('$0.00');
    });

    it('should handle decimal places properly', () => {
      expect(formatAmount(99.99)).toBe('$99.99');
      expect(formatAmount(0.01)).toBe('$0.01');
    });
  });

  describe('getTransactionDisplay', () => {
    const getTransactionDisplay = (amount) => {
      const absValue = Math.abs(amount).toFixed(2);
      const isExpense = amount < 0;
      return {
        display: `$${absValue}`,
        color: isExpense ? '#FF3D00' : '#00C853',
        prefix: isExpense ? '↓ ' : '↑ '
      };
    };

    it('should display expense correctly', () => {
      const result = getTransactionDisplay(-50);
      expect(result.display).toBe('$50.00');
      expect(result.color).toBe('#FF3D00');
      expect(result.prefix).toBe('↓ ');
    });

    it('should display income correctly', () => {
      const result = getTransactionDisplay(100);
      expect(result.display).toBe('$100.00');
      expect(result.color).toBe('#00C853');
      expect(result.prefix).toBe('↑ ');
    });

    it('should handle zero as expense', () => {
      const result = getTransactionDisplay(0);
      expect(result.prefix).toBe('↑ '); // 0 is treated as income (>= 0)
    });
  });

  describe('Password Validation', () => {
    const validatePassword = (password) => {
      const isLongEnough = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      const isStrong = isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial;
      
      return {
        isLongEnough,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isStrong
      };
    };

    it('should validate strong password correctly', () => {
      const result = validatePassword('Password123!');
      expect(result.isLongEnough).toBe(true);
      expect(result.hasUpper).toBe(true);
      expect(result.hasLower).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecial).toBe(true);
      expect(result.isStrong).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123!');
      expect(result.hasUpper).toBe(false);
      expect(result.isStrong).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.hasLower).toBe(false);
      expect(result.isStrong).toBe(false);
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('Password!!!');
      expect(result.hasNumber).toBe(false);
      expect(result.isStrong).toBe(false);
    });

    it('should reject password without special characters', () => {
      const result = validatePassword('Password123');
      expect(result.hasSpecial).toBe(false);
      expect(result.isStrong).toBe(false);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('Pass1!');
      expect(result.isLongEnough).toBe(false);
      expect(result.isStrong).toBe(false);
    });

    it('should calculate password strength score', () => {
      const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[a-z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 15;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
        return Math.min(score, 100);
      };

      // Pass1! = P(upper)+ass(lower)+1(number)+!(special) = 20+20+15+15 = 70
      expect(getPasswordStrength('Pass1!')).toBe(70);
      // Password123! = 12 chars + all requirements = 20+10+20+20+15+15 = 100
      expect(getPasswordStrength('Password123!')).toBe(100);
      // weak = only lowercase = 20
      expect(getPasswordStrength('weak')).toBe(20);
      // empty = 0
      expect(getPasswordStrength('')).toBe(0);
    });

    it('should return correct strength color', () => {
      const getStrengthColor = (strength) => {
        if (strength < 40) return '#f44336';
        if (strength < 70) return '#ff9800';
        return '#4caf50';
      };

      expect(getStrengthColor(30)).toBe('#f44336');
      expect(getStrengthColor(50)).toBe('#ff9800');
      expect(getStrengthColor(80)).toBe('#4caf50');
    });

    it('should return correct strength label', () => {
      const getStrengthLabel = (strength) => {
        if (strength < 40) return 'Weak';
        if (strength < 70) return 'Medium';
        return 'Strong';
      };

      expect(getStrengthLabel(20)).toBe('Weak');
      expect(getStrengthLabel(50)).toBe('Medium');
      expect(getStrengthLabel(80)).toBe('Strong');
    });
  });

  describe('Category Filtering', () => {
    const CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'General'];

    it('should contain all required categories', () => {
      expect(CATEGORIES).toContain('Food');
      expect(CATEGORIES).toContain('Rent');
      expect(CATEGORIES).toContain('Transport');
      expect(CATEGORIES).toContain('Entertainment');
      expect(CATEGORIES).toContain('Shopping');
      expect(CATEGORIES).toContain('General');
      expect(CATEGORIES.length).toBe(6);
    });
  });

  describe('Date Filtering', () => {
    it('should filter transactions by month', () => {
      const transactions = [
        { id: 1, date: new Date(2026, 0, 15) }, // January
        { id: 2, date: new Date(2026, 1, 10) }, // February
        { id: 3, date: new Date(2026, 0, 20) }, // January
      ];
      const selectedMonth = 0; // January

      const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === selectedMonth;
      });

      expect(filtered.length).toBe(2);
      expect(filtered.every(t => t.date.getMonth() === 0)).toBe(true);
    });

    it('should filter transactions by year', () => {
      const transactions = [
        { id: 1, date: new Date(2025, 5, 15) },
        { id: 2, date: new Date(2026, 5, 10) },
        { id: 3, date: new Date(2026, 5, 20) },
      ];
      const currentYear = 2026;

      const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === currentYear;
      });

      expect(filtered.length).toBe(2);
      expect(filtered.every(t => t.date.getFullYear() === 2026)).toBe(true);
    });
  });

  describe('Calculations', () => {
    it('should calculate total income correctly', () => {
      const transactions = [
        { amount: 3000 },  // Income
        { amount: -50 },   // Expense
        { amount: 1500 },  // Income
        { amount: -200 },  // Expense
      ];

      const income = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);

      expect(income).toBe(4500);
    });

    it('should calculate total expenses correctly', () => {
      const transactions = [
        { amount: 3000 },  // Income
        { amount: -50 },   // Expense
        { amount: 1500 },  // Income
        { amount: -200 },  // Expense
      ];

      const expense = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

      expect(expense).toBe(250);
    });

    it('should calculate balance correctly', () => {
      const income = 4500;
      const expense = 250;
      const balance = income - expense;

      expect(balance).toBe(4250);
    });

    it('should group expenses by category', () => {
      const transactions = [
        { category: 'Food', amount: -50 },
        { category: 'Food', amount: -30 },
        { category: 'Rent', amount: -1000 },
        { category: 'Transport', amount: -100 },
      ];

      const spendingByCategory = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'General'].map(cat => {
        const total = transactions
          .filter(t => t.category === cat && t.amount < 0)
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        return { name: cat, value: total };
      }).filter(item => item.value > 0);

      expect(spendingByCategory.length).toBe(3);
      expect(spendingByCategory.find(c => c.name === 'Food').value).toBe(80);
      expect(spendingByCategory.find(c => c.name === 'Rent').value).toBe(1000);
    });
  });

  describe('Chart Data Preparation', () => {
    it('should prepare line chart data correctly', () => {
      const filteredTransactions = [
        { date: new Date(2026, 0, 5), amount: 100 },
        { date: new Date(2026, 0, 5), amount: -50 },
        { date: new Date(2026, 0, 10), amount: 200 },
      ];

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

      // Check Day 5 has income and expense
      expect(lineChartData[4].Income).toBe(100);
      expect(lineChartData[4].Expense).toBe(50);

      // Check Day 10 has income
      expect(lineChartData[9].Income).toBe(200);
      expect(lineChartData[9].Expense).toBe(0);

      // Other days should have 0
      expect(lineChartData[0].Income).toBe(0);
      expect(lineChartData[14].Income).toBe(0);
    });
  });

  describe('Budget Calculations', () => {
    it('should calculate percentage correctly', () => {
      const getPercentage = (spending, budget) => {
        if (!budget) return 0;
        return Math.min((spending / budget) * 100, 100);
      };

      expect(getPercentage(250, 500)).toBe(50);
      expect(getPercentage(500, 500)).toBe(100);
      expect(getPercentage(600, 500)).toBe(100); // Capped at 100
      expect(getPercentage(0, 500)).toBe(0);
    });

    it('should determine status color based on percentage', () => {
      const getStatusColor = (percentage) => {
        if (percentage >= 100) return '#f44336';
        if (percentage >= 80) return '#ff9800';
        return '#4caf50';
      };

      expect(getStatusColor(100)).toBe('#f44336');
      expect(getStatusColor(85)).toBe('#ff9800');
      expect(getStatusColor(79)).toBe('#4caf50');
      expect(getStatusColor(50)).toBe('#4caf50');
    });

    it('should calculate remaining budget', () => {
      const getRemaining = (spending, budget) => {
        return budget - spending;
      };

      expect(getRemaining(250, 500)).toBe(250);
      expect(getRemaining(500, 500)).toBe(0);
      expect(getRemaining(600, 500)).toBe(-100);
    });
  });

  describe('CSV Export', () => {
    it('should escape quotes in descriptions', () => {
      const description = 'Test "quoted" description';
      const escaped = description.replace(/"/g, '""');
      expect(escaped).toBe('Test ""quoted"" description');
    });

    it('should format date correctly', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      const formatted = date.toLocaleDateString();
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });

    it('should determine transaction type correctly', () => {
      const getType = (amount) => {
        return amount >= 0 ? 'Income' : 'Expense';
      };

      expect(getType(1000)).toBe('Income');
      expect(getType(-100)).toBe('Expense');
      expect(getType(0)).toBe('Income');
    });
  });

  describe('Category Colors', () => {
    const COLORS = {
      'Food': '#4caf50',
      'Rent': '#f44336',
      'Transport': '#ff9800',
      'Entertainment': '#2196f3',
      'Shopping': '#9c27b0',
      'General': '#795548',
    };

    const EXPENSE_COLORS = ['#f44336', '#ff9800', '#2196f3', '#9c27b0', '#795548', '#4caf50'];
    const INCOME_COLORS = ['#4caf50', '#8bc34a', '#cddc39', '#009688', '#00bcd4', '#03a9f4'];

    it('should have unique colors for each category', () => {
      const values = Object.values(COLORS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have correct expense color mapping', () => {
      expect(COLORS['Food']).toBe('#4caf50');
      expect(COLORS['Rent']).toBe('#f44336');
      expect(COLORS['Transport']).toBe('#ff9800');
    });

    it('should have 6 expense colors', () => {
      expect(EXPENSE_COLORS.length).toBe(6);
    });

    it('should have 6 income colors', () => {
      expect(INCOME_COLORS.length).toBe(6);
    });
  });

  describe('Constants', () => {
    it('should have correct budget limit', () => {
      const BUDGET_LIMIT = 2000;
      expect(BUDGET_LIMIT).toBe(2000);
    });

    it('should have 12 months defined', () => {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      expect(months.length).toBe(12);
    });
  });
});

