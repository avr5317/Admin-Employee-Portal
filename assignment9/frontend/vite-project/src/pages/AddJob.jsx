// src/pages/AddJob.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../store/slices/jobsSlice';

function AddJob() {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.jobs);


const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    const salaryNumber = Number(salary);
    if (Number.isNaN(salaryNumber) || salaryNumber <= 0) {
      return alert('Please enter a valid salary.');
    }

    const resultAction = await dispatch(
      createJob({ companyName, jobTitle, description, salary: salaryNumber })
    );

    if (createJob.fulfilled.match(resultAction)) {
      setSuccess('Job created successfully!');
      setCompanyName('');
      setJobTitle('');
      setDescription('');
      setSalary('');
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin/jobs';
      }, 2000);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Job
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Company Name"
          margin="normal"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Job Title"
          margin="normal"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Salary"
          margin="normal"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Job'}
        </Button>
      </Box>
    </Container>
  );
}

export default AddJob;
