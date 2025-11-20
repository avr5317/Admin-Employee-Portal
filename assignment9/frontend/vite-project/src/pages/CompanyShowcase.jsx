import { useState, useEffect } from 'react';
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
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

function CompanyShowcase() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(false);

       
        const response = await axios.get(`${API_BASE_URL}/user/getAll`);
        const users = response.data.users || [];

       
        const mappedCompanies = users
          .filter((user) => user.imagePath) 
          .map((user) => ({
            id: user.email,
            name: user.fullName,
            description: user.email,
            imageUrl: `${API_BASE_URL}${user.imagePath}`, 
          }));

        setCompanies(mappedCompanies);
      } catch (err) {
        setError(true);
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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
