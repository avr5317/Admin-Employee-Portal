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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerThunk, resetRegister } from '../store/slices/authSlice';
import PasswordField from '../components/PasswordField';

// Same rules as the backend (controllers/userController.js and models/User.js)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_HINT =
  'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and one special character (@ $ ! % * ? &). Other characters are not allowed.';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, registerLoading, registerError } = useSelector((state) => state.auth);

  // Clear any old error/loading state when the page opens
  useEffect(() => {
    dispatch(resetRegister());
  }, [dispatch]);

  // Already logged in: send to the normal landing page
  useEffect(() => {
    if (!user) return;
    navigate(user.type === 'admin' ? '/admin/employees' : '/', { replace: true });
  }, [user, navigate]);

  const errors = {
    fullName:
      fullName.trim() && NAME_REGEX.test(fullName) ? '' : 'Use letters and spaces only.',
    email: EMAIL_REGEX.test(email.trim()) ? '' : 'Enter a valid email address.',
    password: PASSWORD_REGEX.test(password) ? '' : PASSWORD_HINT,
    confirmPassword: confirmPassword === password ? '' : 'Passwords do not match.',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (f) => Boolean(touched[f] && errors[f]);
  const markTouched = (f) => () => setTouched((prev) => ({ ...prev, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (hasErrors) return;

    const result = await dispatch(
      registerThunk({ fullName: fullName.trim(), email: email.trim(), password })
    );
    if (registerThunk.fulfilled.match(result)) {
      navigate('/login', { replace: true, state: { registered: true } });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography component="h1" variant="h3">
          Create an account
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          New accounts are employee accounts.
        </Typography>

        {registerError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {registerError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full name"
            autoComplete="name"
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={markTouched('fullName')}
            error={showError('fullName')}
            helperText={showError('fullName') ? errors.fullName : 'Letters and spaces only.'}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={markTouched('password')}
            error={showError('password')}
            helperText={PASSWORD_HINT}
          />

          <PasswordField
            margin="normal"
            required
            fullWidth
            label="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={markTouched('confirmPassword')}
            error={showError('confirmPassword')}
            helperText={showError('confirmPassword') ? errors.confirmPassword : ' '}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2, mb: 2 }}
            disabled={registerLoading}
          >
            {registerLoading ? <CircularProgress size={24} aria-label="Creating account" /> : 'Register'}
          </Button>

          <Typography variant="body2">
            Already have an account?{' '}
            <MuiLink component={RouterLink} to="/login">
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
