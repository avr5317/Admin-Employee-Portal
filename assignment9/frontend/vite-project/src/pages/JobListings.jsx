
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Box,
  Pagination,
  Stack,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../store/slices/jobsSlice';

function JobListings() {
  const dispatch = useDispatch();
  const { items: jobs, loading, error } = useSelector((state) => state.jobs);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6; 

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleApply = (job) => {
    alert(
      `Thank you for your interest in ${job.jobTitle} at ${job.companyName}!\n\nYour application has been submitted.`
    );
  };

  
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

 
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Jobs
      </Typography>

      {jobs.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, jobs.length)} of{' '}
          {jobs.length} jobs
        </Typography>
      )}

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {currentJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {job.jobTitle}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {job.companyName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Salary: ${job.salary.toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleApply(job)}
                  fullWidth
                >
                  Apply
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {jobs.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No jobs available yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Check back later for new opportunities!
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Container>
  );
}

export default JobListings;