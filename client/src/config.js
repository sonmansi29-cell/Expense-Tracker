// Centralized API configuration
// Use environment variable for API URL, default to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { API_URL };

