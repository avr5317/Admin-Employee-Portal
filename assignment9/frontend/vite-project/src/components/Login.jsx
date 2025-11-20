// src/components/Login.jsx
import { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginThunk } from '../store/slices/authSlice';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From Redux auth slice
  const { loading, error, user } = useSelector((state) => state.auth);

  // After successful login, redirect based on role
  useEffect(() => {
    if (!user) return;

    if (user.type === 'admin') {
      // Admin: go to admin employees page
      navigate('/admin/employees', { replace: true });
    } else if (user.type === 'employee') {
      // Employee: go to normal home page
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trigger Redux async thunk for login
    dispatch(loginThunk({ email, password }));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Job Portal Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Demo: First create a user at{' '}
            <code>POST http://localhost:3000/user/create</code> (with type
            <code> "admin"</code> or <code>"employee"</code> in Assignment 8 backend).
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
