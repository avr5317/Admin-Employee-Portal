import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './components/Navbar';
import Login from './components/Login';

import Home from './pages/Home';
import About from './pages/About';
import CompanyShowcase from './pages/CompanyShowcase';
import Contact from './pages/Contact';
import JobListings from './pages/JobListings';
import AdminEmployees from './pages/AdminEmployees';
import AddJob from './pages/AddJob';

import { RequireAuth, RequireRole } from './components/ProtectedRoute';
import { logout } from './store/slices/authSlice';

import './App.css';

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

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

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
    </Router>
  );
}

export default App;