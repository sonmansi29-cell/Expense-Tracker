import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, Alert, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';

function ResetPassword({ onBackToLogin }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Validation Logic
  const isLongEnough = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isStrong = isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  // Calculate password strength score (0-100)
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (hasUpper) score += 20;
    if (hasLower) score += 20;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;
    return Math.min(score, 100);
  };

  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength < 40) return '#f44336'; // Red
    if (strength < 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };
  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrong || !passwordsMatch) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(token, password);
      setMessage('Password reset successfully! You can now log in with your new password.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card sx={{ p: 4, width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
            <Typography variant="h4" fontWeight="800" textAlign="center" gutterBottom>
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 3 }}>
              This password reset link is invalid or has expired.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={onBackToLogin}
              sx={{ mt: 3, py: 1.5, borderRadius: '12px', bgcolor: '#1A237E' }}
            >
              Back to Login
            </Button>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card sx={{ p: 4, width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
          <Typography variant="h4" fontWeight="800" textAlign="center" gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Strength Indicator */}
            {password.length > 0 && (
              <Box sx={{ mt: 1, mb: 2 }}>
                {/* Password Strength Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">
                      Password Strength
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: getStrengthColor() }}>
                      {getStrengthLabel()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStrengthColor(),
                        borderRadius: 4,
                        transition: 'width 0.3s ease-in-out',
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color={isLongEnough ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                  {isLongEnough ? '✅' : '❌'} At least 8 characters
                </Typography>
                <Typography variant="caption" color={hasUpper ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                  {hasUpper ? '✅' : '❌'} At least 1 uppercase letter (A-Z)
                </Typography>
                <Typography variant="caption" color={hasLower ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                  {hasLower ? '✅' : '❌'} At least 1 lowercase letter (a-z)
                </Typography>
                <Typography variant="caption" color={hasNumber ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                  {hasNumber ? '✅' : '❌'} At least 1 number (0-9)
                </Typography>
                <Typography variant="caption" color={hasSpecial ? "success.main" : "text.disabled"} sx={{ display: 'block' }}>
                  {hasSpecial ? '✅' : '❌'} At least 1 special character (!@#$%^&*)
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && !passwordsMatch}
              helperText={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : ''}
              required
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={!isStrong || !passwordsMatch || loading}
              sx={{ mt: 3, py: 1.5, borderRadius: '12px', bgcolor: '#1A237E' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <Button
            fullWidth
            sx={{ mt: 2 }}
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </Card>
      </motion.div>
    </Box>
  );
}

export default ResetPassword;

