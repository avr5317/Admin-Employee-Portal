// src/pages/AddJob.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../store/slices/jobsSlice';
import Page from '../components/Page';
import Toast from '../components/Toast';

const validate = ({ companyName, jobTitle, description, salary }) => {
  const salaryNumber = Number(salary);
  return {
    companyName: companyName.trim() ? '' : 'Please enter the company name.',
    jobTitle: jobTitle.trim() ? '' : 'Please enter the job title.',
    description: description.trim() ? '' : 'Please enter a description.',
    salary:
      salary !== '' && !Number.isNaN(salaryNumber) && salaryNumber > 0
        ? ''
        : 'Please enter a valid salary greater than 0.',
  };
};

function AddJob() {
  const [values, setValues] = useState({ companyName: '', jobTitle: '', description: '', salary: '' });
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const redirectTimer = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.jobs);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const errors = validate(values);
  const showError = (f) => Boolean(touched[f] && errors[f]);
  const bind = (f) => ({
    value: values[f],
    onChange: (e) => setValues((prev) => ({ ...prev, [f]: e.target.value })),
    onBlur: () => setTouched((prev) => ({ ...prev, [f]: true })),
    error: showError(f),
    helperText: showError(f) ? errors[f] : ' ',
    required: true,
    fullWidth: true,
    margin: 'normal',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setTouched({ companyName: true, jobTitle: true, description: true, salary: true });
    if (Object.values(errors).some(Boolean)) return;

    const resultAction = await dispatch(
      createJob({
        companyName: values.companyName.trim(),
        jobTitle: values.jobTitle.trim(),
        description: values.description.trim(),
        salary: Number(values.salary),
      })
    );

    if (createJob.fulfilled.match(resultAction)) {
      setToastOpen(true);
      setValues({ companyName: '', jobTitle: '', description: '', salary: '' });
      setTouched({});

      // Auto-redirect after 2 seconds
      redirectTimer.current = setTimeout(() => navigate('/admin/jobs'), 2000);
    } else {
      setSubmitError(resultAction.payload || 'Failed to create job.');
    }
  };

  return (
    <Page title="Add job" subtitle="Post a new opening for employees to find." maxWidth="sm">
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField label="Company name" {...bind('companyName')} />
          <TextField label="Job title" {...bind('jobTitle')} />
          <TextField label="Description" multiline minRows={4} {...bind('description')} />
          <TextField
            label="Salary (USD per year)"
            type="number"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              htmlInput: { min: 1, step: 1000 },
            }}
            {...bind('salary')}
          />

          <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }} disabled={loading}>
            {loading ? <CircularProgress size={24} aria-label="Creating job" /> : 'Create job'}
          </Button>
        </Box>
      </Paper>

      <Toast
        open={toastOpen}
        message="Job created. Taking you to the job list…"
        onClose={() => setToastOpen(false)}
      />
    </Page>
  );
}

export default AddJob;
