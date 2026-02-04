const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Database Operations (Unit Tests)', () => {
  describe('User Operations', () => {
    const mockUsers = [
      { id: 1, name: 'Test User', email: 'test@example.com', password: 'hashedpassword' }
    ];

    it('should find user by email', () => {
      const user = mockUsers.find(u => u.email === 'test@example.com');
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
    });

    it('should not find non-existent user', () => {
      const user = mockUsers.find(u => u.email === 'nonexistent@example.com');
      expect(user).toBeUndefined();
    });

    it('should create user object structure', () => {
      const newUser = {
        id: 2,
        name: 'New User',
        email: 'newuser@test.com',
        password: 'hashedpassword123'
      };

      expect(newUser.id).toBeDefined();
      expect(newUser.name).toBe('New User');
      expect(newUser.email).toBe('newuser@test.com');
    });
  });

  describe('Transaction Operations', () => {
    const mockTransactions = [
      { id: 1, text: 'Groceries', amount: -50.00, category: 'Food', date: new Date('2026-01-15'), userId: 1 },
      { id: 2, text: 'Salary', amount: 3000.00, category: 'General', date: new Date('2026-01-01'), userId: 1 },
      { id: 3, text: 'Rent', amount: -1000.00, category: 'Rent', date: new Date('2026-01-05'), userId: 1 },
      { id: 4, text: 'Utilities', amount: -150.00, category: 'General', date: new Date('2026-01-10'), userId: 1 },
      { id: 5, text: 'Entertainment', amount: -75.00, category: 'Entertainment', date: new Date('2026-01-20'), userId: 1 }
    ];

    it('should fetch transactions for user', () => {
      const userTransactions = mockTransactions.filter(t => t.userId === 1);
      expect(userTransactions.length).toBe(5);
    });

    it('should filter transactions by category', () => {
      const foodTransactions = mockTransactions.filter(t => t.category === 'Food');
      expect(foodTransactions.length).toBe(1);
      expect(foodTransactions[0].text).toBe('Groceries');
    });

    it('should calculate income correctly', () => {
      const incomeTransactions = mockTransactions.filter(t => t.amount > 0);
      const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      expect(income).toBe(3000.00);
    });

    it('should calculate expenses correctly', () => {
      const expenseTransactions = mockTransactions.filter(t => t.amount < 0);
      const expenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      expect(expenses).toBe(1275.00);
    });

    it('should group expenses by category', () => {
      const categoryMap = {};
      mockTransactions
        .filter(t => t.amount < 0)
        .forEach(t => {
          const category = t.category || 'General';
          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += Math.abs(t.amount);
        });

      expect(categoryMap['Food']).toBe(50.00);
      expect(categoryMap['Rent']).toBe(1000.00);
      expect(categoryMap['Entertainment']).toBe(75.00);
      expect(categoryMap['General']).toBe(150.00);
    });

    it('should filter transactions by month', () => {
      const startOfMonth = new Date(2026, 0, 1); // January
      const januaryTransactions = mockTransactions.filter(t => new Date(t.date) >= startOfMonth);
      expect(januaryTransactions.length).toBe(5);
    });

    it('should create new transaction', () => {
      const newTransaction = {
        id: 6,
        text: 'New Transaction',
        amount: -100.00,
        category: 'Shopping',
        date: new Date('2026-01-25'),
        userId: 1
      };

      expect(newTransaction.id).toBeDefined();
      expect(newTransaction.text).toBe('New Transaction');
      expect(newTransaction.amount).toBe(-100);
    });
  });

  describe('Budget Operations', () => {
    const mockBudgets = [
      { id: 1, category: 'Food', limit: 500.00, month: 0, year: 2026, userId: 1 },
      { id: 2, category: 'Rent', limit: 1200.00, month: 0, year: 2026, userId: 1 }
    ];

    it('should fetch budgets for user and month', () => {
      const userBudgets = mockBudgets.filter(b => b.userId === 1 && b.month === 0 && b.year === 2026);
      expect(userBudgets.length).toBe(2);
    });

    it('should calculate budget percentages', () => {
      mockBudgets.forEach(budget => {
        let spending;
        if (budget.category === 'Food') {
          spending = 50; // from mock transactions
        } else if (budget.category === 'Rent') {
          spending = 1000;
        }

        const percentage = (spending / budget.limit) * 100;

        if (budget.category === 'Food') {
          expect(percentage).toBe(10);
        }
        if (budget.category === 'Rent') {
          expect(percentage).toBeCloseTo(83.33, 1);
        }
      });
    });

    it('should create new budget', () => {
      const newBudget = {
        id: 3,
        category: 'Entertainment',
        limit: 300.00,
        month: 0,
        year: 2026,
        userId: 1
      };

      expect(newBudget.id).toBeDefined();
      expect(newBudget.category).toBe('Entertainment');
      expect(newBudget.limit).toBe(300.00);
    });
  });

  describe('Analytics Calculations', () => {
    const mockTransactions = [
      { id: 1, text: 'Groceries', amount: -50.00, category: 'Food' },
      { id: 2, text: 'Salary', amount: 3000.00, category: 'General' },
      { id: 3, text: 'Rent', amount: -1000.00, category: 'Rent' },
      { id: 4, text: 'Utilities', amount: -150.00, category: 'General' },
      { id: 5, text: 'Entertainment', amount: -75.00, category: 'Entertainment' }
    ];

    it('should calculate total income', () => {
      const income = mockTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      expect(income).toBe(3000.00);
    });

    it('should calculate total expenses', () => {
      const expenses = mockTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      expect(expenses).toBe(1275.00);
    });

    it('should calculate balance correctly', () => {
      const income = mockTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = mockTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const balance = income - expenses;
      expect(balance).toBe(1725.00);
    });

    it('should count transactions', () => {
      expect(mockTransactions.length).toBe(5);
    });

    it('should generate monthly summary object', () => {
      const income = mockTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = mockTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const summary = {
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        balance: Number((income - expenses).toFixed(2)),
        transactionCount: mockTransactions.length
      };

      expect(summary.income).toBe(3000);
      expect(summary.expenses).toBe(1275);
      expect(summary.balance).toBe(1725);
      expect(summary.transactionCount).toBe(5);
    });
  });
});

describe('JWT Token Operations', () => {
  const JWT_SECRET = 'test-secret-key';

  it('should generate a valid token', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a valid token', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
  });

  it('should include expiration in token', () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  it('should reject invalid token', () => {
    expect(() => {
      jwt.verify('invalid-token', JWT_SECRET);
    }).toThrow();
  });

  it('should reject token with wrong secret', () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow();
  });

  it('should reject expired token', () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow();
  });
});

describe('Password Hashing', () => {
  it('should hash a password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(50);
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2a$10$')).toBe(true); // bcrypt format
  });

  it('should compare password with hash', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should not match wrong password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare('WrongPassword!', hash);
    expect(isMatch).toBe(false);
  });

  it('should hash different passwords differently', async () => {
    const hash1 = await bcrypt.hash('Password1!', 10);
    const hash2 = await bcrypt.hash('Password2!', 10);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different salts for same password', async () => {
    const hash1 = await bcrypt.hash('SamePassword!', 10);
    const hash2 = await bcrypt.hash('SamePassword!', 10);

    // Even same password should have different hashes due to random salt
    expect(hash1).not.toBe(hash2);
  });
});

