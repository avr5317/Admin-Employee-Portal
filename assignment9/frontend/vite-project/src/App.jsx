import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

import Navbar from './components/Navbar';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const CompanyShowcase = lazy(() => import('./pages/CompanyShowcase'));
const Contact = lazy(() => import('./pages/Contact'));
const JobListings = lazy(() => import('./pages/JobListings'));
const AdminEmployees = lazy(() => import('./pages/AdminEmployees'));
const AddJob = lazy(() => import('./pages/AddJob'));
const Register = lazy(() => import('./pages/Register'));

import { RequireAuth, RequireRole } from './components/ProtectedRoute';
import { logout } from './store/slices/authSlice';

import './App.css';

// Error boundary resets whenever the route changes
function BoundedRoutes({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense
        fallback={
          <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      {/* Navbar always visible */}
      <Navbar user={user} userName={user?.fullName} onLogout={handleLogout} />

      <BoundedRoutes>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All protected routes go inside RequireAuth */}
        <Route element={<RequireAuth />}>
          
          {/* Employee routes */}
          <Route element={<RequireRole allowed={['employee']} />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/companies" element={<CompanyShowcase />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin routes - Admin can access EVERYTHING */}
          <Route element={<RequireRole allowed={['admin']} />}>
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/add-job" element={<AddJob />} />
            <Route path="/admin/jobs" element={<JobListings />} />
            <Route path="/admin/companies" element={<CompanyShowcase />} />
            <Route path="/admin/about" element={<About />} />
            <Route path="/admin/contact" element={<Contact />} />
          </Route>
          
        </Route>

        {/* Default / catch-all */}
        <Route
          path="*"
          element={<Navigate to={user ? (user.type === 'admin' ? '/admin/employees' : '/') : '/login'} replace />}
        />
      </Routes>
      </BoundedRoutes>
    </Router>
  );
}

export default App;