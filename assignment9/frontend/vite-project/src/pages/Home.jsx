import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Job Portal
      </Typography>
      <Typography variant="h5" paragraph>
        Find your dream job today!
      </Typography>
      <Typography variant="body1" paragraph>
        We connect talented professionals with top companies.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" component={Link} to="/jobs">
          View Jobs
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/companies" sx={{ ml: 2 }}>
          Explore Companies
        </Button>
      </Box>
    </Container>
  );
}

export default Home;