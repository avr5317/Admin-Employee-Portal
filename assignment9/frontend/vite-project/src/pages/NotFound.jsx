import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHomePath } from '../navigation';

function NotFound() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <Typography
        aria-hidden="true"
        sx={{ fontSize: { xs: '5rem', md: '7rem' }, fontWeight: 800, lineHeight: 1, color: 'primary.main' }}
      >
        404
      </Typography>
      <Typography variant="h3" component="h1" sx={{ mt: 2 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        The page you are looking for does not exist or may have been moved.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" component={RouterLink} to={getHomePath(user)}>
          {user ? 'Go to home' : 'Go to login'}
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;
