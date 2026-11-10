// src/components/Login.jsx
import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { loginThunk } from '../store/slices/authSlice';
import PasswordField from './PasswordField';
import Toast from './Toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [toastOpen, setToastOpen] = useState(Boolean(useLocation().state?.registered));

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

  const errors = {
    email: !email.trim()
      ? 'Please enter your email.'
      : EMAIL_REGEX.test(email.trim())
        ? ''
        : 'Please enter a valid email address.',
    password: password ? '' : 'Please enter your password.',
  };
  const showError = (f) => Boolean(touched[f] && errors[f]);
  const markTouched = (f) => () => setTouched((prev) => ({ ...prev, [f]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;

    // Trigger Redux async thunk for login
    dispatch(loginThunk({ email: email.trim(), password }));
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography component="h1" variant="h3">
          Log in
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Welcome back to Job Portal.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={markTouched('email')}
            error={showError('email')}
            helperText={showError('email') ? errors.email : ' '}
          />

          <PasswordField
            margin="normal"
            required
            fullWidth
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={markTouched('password')}
            error={showError('password')}
            helperText={showError('password') ? errors.password : ' '}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} aria-label="Logging in" /> : 'Log in'}
          </Button>

          <Typography variant="body2">
            New here?{' '}
            <MuiLink component={RouterLink} to="/register">
              Create an account
            </MuiLink>
          </Typography>
        </Box>
      </Paper>

      <Toast
        open={toastOpen}
        message="Account created! Please log in."
        onClose={() => setToastOpen(false)}
      />
    </Container>
  );
}

export default Login;
