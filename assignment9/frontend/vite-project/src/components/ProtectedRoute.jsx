
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';


export const RequireAuth = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};


export const RequireRole = ({ allowed }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.type)) {
    // Redirect to default page based on role
    const redirectPath = user.type === 'admin' ? '/admin/employees' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

 
export default RequireAuth;
