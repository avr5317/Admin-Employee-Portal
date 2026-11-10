import { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../store/slices/usersSlice';
import { API_BASE_URL } from '../api/client';

function CompanyShowcase() {
  const dispatch = useDispatch();
  const {
    companies,
    companiesLoading: loading,
    companiesError,
  } = useSelector((state) => state.users);
  const error = Boolean(companiesError);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load companies. Make sure Assignment 8 backend is running on {API_BASE_URL}
          {' '}and you have uploaded some images via <code>/user/uploadImage</code>.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Our Partner Companies
      </Typography>

      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={company.imageUrl}
                alt={company.name}
              />
              <CardContent>
                <Typography variant="h6">{company.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {company.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CompanyShowcase;
