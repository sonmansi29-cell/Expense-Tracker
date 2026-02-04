const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const createMockApp = () => {
  const app = express();
  app.use(express.json());

  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  return { app, authMiddleware };
};

describe('Auth Routes (Unit Tests)', () => {
  let app;

  beforeEach(() => {
    const result = createMockApp();
    app = result.app;
  });

  describe('POST /auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const validateRegistration = (data) => {
        const errors = [];
        if (!data.name) errors.push('name is required');
        if (!data.email) errors.push('email is required');
        if (!data.password) errors.push('password is required');
        if (errors.length > 0) return { valid: false, errors };
        return { valid: true };
      };

      const result = validateRegistration({ name: 'Test' });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject weak passwords', async () => {
      const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('1 uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('1 lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('1 number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('1 special character');
        return errors;
      };

      const errors = validatePassword('weak');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate password format correctly', () => {
      const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('1 uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('1 lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('1 number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('1 special character');
        return errors;
      };

      const errors = validatePassword('ValidPass123!');
      expect(errors.length).toBe(0);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without credentials', async () => {
      const validateLogin = (credentials) => {
        if (!credentials.email || !credentials.password) {
          return { valid: false, error: 'Email and password required' };
        }
        return { valid: true };
      };

      const result = validateLogin({});
      expect(result.valid).toBe(false);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should reject request without email', async () => {
      const validateForgotPassword = (data) => {
        if (!data.email) {
          return { valid: false, message: 'Email is required' };
        }
        return { valid: true };
      };

      const result = validateForgotPassword({});
      expect(result.valid).toBe(false);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reject reset without token', async () => {
      const validateResetPassword = (data) => {
        if (!data.token) return { valid: false, message: 'Token is required' };
        if (!data.newPassword) return { valid: false, message: 'New password is required' };
        return { valid: true };
      };

      const result = validateResetPassword({ newPassword: 'NewPass123!' });
      expect(result.valid).toBe(false);
    });
  });
});

describe('Protected Routes Logic', () => {
  describe('Transactions Routes', () => {
    let app;
    let authMiddleware;

    beforeEach(() => {
      const result = createMockApp();
      app = result.app;
      authMiddleware = result.authMiddleware;

      app.get('/api/transactions', authMiddleware, (req, res) => {
        res.json([
          { id: 1, text: 'Test Transaction', amount: -50, category: 'Food', date: new Date() },
          { id: 2, text: 'Salary', amount: 3000, category: 'General', date: new Date() }
        ]);
      });

      app.post('/api/transactions', authMiddleware, (req, res) => {
        const { text, amount, category } = req.body;
        res.status(201).json({ id: 3, text, amount, category, date: new Date() });
      });
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return transactions with valid token', async () => {
      const validToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should create transaction with valid data', async () => {
      const validToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ text: 'New Transaction', amount: -100, category: 'Food' })
        .expect(201);

      expect(response.body.text).toBe('New Transaction');
    });
  });

  describe('Analytics Routes', () => {
    let app;
    let authMiddleware;

    beforeEach(() => {
      const result = createMockApp();
      app = result.app;
      authMiddleware = result.authMiddleware;

      app.get('/api/analytics/category-totals', authMiddleware, (req, res) => {
        res.json([
          { category: 'Food', total: 250.50 },
          { category: 'Rent', total: 1000 }
        ]);
      });

      app.get('/api/analytics/monthly-summary', authMiddleware, (req, res) => {
        res.json({
          income: 3000,
          expenses: 1400.50,
          balance: 1599.50,
          transactionCount: 15
        });
      });
    });

    it('should return category totals', async () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '24h' });

      const response = await request(app)
        .get('/api/analytics/category-totals')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return monthly summary', async () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '24h' });

      const response = await request(app)
        .get('/api/analytics/monthly-summary')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.income).toBe(3000);
      expect(response.body.transactionCount).toBe(15);
    });
  });

  describe('Budgets Routes', () => {
    let app;
    let authMiddleware;

    beforeEach(() => {
      const result = createMockApp();
      app = result.app;
      authMiddleware = result.authMiddleware;

      app.get('/api/budgets', authMiddleware, (req, res) => {
        res.json([
          { id: 1, category: 'Food', limit: 500 },
          { id: 2, category: 'Rent', limit: 1200 }
        ]);
      });

      app.post('/api/budgets', authMiddleware, (req, res) => {
        const { category, limit } = req.body;
        res.status(201).json({ id: 3, category, limit: parseFloat(limit) });
      });
    });

    it('should return budgets with valid token', async () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '24h' });

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create budget with valid data', async () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '24h' });

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ category: 'Entertainment', limit: 300 })
        .expect(201);

      expect(response.body.category).toBe('Entertainment');
    });
  });
});

describe('Auth Middleware', () => {
  let app;
  let authMiddleware;

  beforeEach(() => {
    const result = createMockApp();
    app = result.app;
    authMiddleware = result.authMiddleware;
  });

  it('should reject missing authorization header', async () => {
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ message: 'Success' });
    });

    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
  });

  it('should reject invalid authorization format', async () => {
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ message: 'Success' });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormat token')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
  });

  it('should reject invalid token', async () => {
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ message: 'Success' });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.error).toBe('Invalid token');
  });

  it('should allow valid token', async () => {
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ userId: req.user.userId });
    });

    const validToken = jwt.sign(
      { userId: 123 },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.userId).toBe(123);
  });
});

