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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerThunk, resetRegister } from '../store/slices/authSlice';

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
  const [touched, setTouched] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;

    const result = await dispatch(
      registerThunk({ fullName: fullName.trim(), email: email.trim(), password })
    );
    if (registerThunk.fulfilled.match(result)) {
      navigate('/login', { replace: true, state: { registered: true } });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Create an Account
        </Typography>

        {registerError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {registerError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full name"
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={touched && Boolean(errors.fullName)}
            helperText={touched && errors.fullName ? errors.fullName : 'Letters and spaces only.'}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={touched && Boolean(errors.email)}
            helperText={touched && errors.email ? errors.email : ' '}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && Boolean(errors.password)}
            helperText={PASSWORD_HINT}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={touched && Boolean(errors.confirmPassword)}
            helperText={touched && errors.confirmPassword ? errors.confirmPassword : ' '}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={registerLoading}
          >
            {registerLoading ? <CircularProgress size={24} /> : 'Register'}
          </Button>

          <Typography variant="body2">
            Already have an account?{' '}
            <MuiLink component={RouterLink} to="/login">
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;
