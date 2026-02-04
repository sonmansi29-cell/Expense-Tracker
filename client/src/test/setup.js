// Vitest setup file
import { vi } from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => {
    if (key === 'token') return 'mock-token';
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window events and functions
global.window = {
  ...window,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  alert: vi.fn(),
  location: {
    ...window.location,
    href: 'http://localhost:5173/',
    pathname: '/',
  },
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock MUI components that use portals
const originalCreatePortal = ReactDOM.createPortal;
ReactDOM.createPortal = (children, container) => {
  if (container === null || container === undefined) {
    return children;
  }
  return originalCreatePortal(children, container);
};

