import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { fetchJobs, deleteJob } from '../store/slices/jobsSlice';
import useLoadData from '../hooks/useLoadData';
import Page from '../components/Page';
import Toast from '../components/Toast';
import { avatarColor, formatSalary, initialsOf } from '../utils/format';

const JOBS_PER_PAGE = 6;

function JobCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="45%" />
          </Box>
        </Stack>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </CardContent>
    </Card>
  );
}

function JobListings() {
  const dispatch = useDispatch();
  const { items: jobs, deleteError } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.type === 'admin';

  const { status, reload } = useLoadData(fetchJobs);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  // Client-side filter by title or company
  const query = search.trim().toLowerCase();
  const filtered = query
    ? jobs.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(query) || job.companyName.toLowerCase().includes(query)
      )
    : jobs;

  const totalPages = Math.ceil(filtered.length / JOBS_PER_PAGE);
  // If deleting the last card on the last page empties it, fall back to the previous page
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const visibleJobs = filtered.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleApply = (job) => {
    showToast(
      `Thanks for your interest in ${job.jobTitle} at ${job.companyName}. Applications are not stored.`,
      'info'
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteJob(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);
    if (deleteJob.fulfilled.match(result)) {
      showToast('Job deleted.');
    } else {
      showToast(result.payload || 'Failed to delete job', 'error');
    }
  };

  const loading = status === 'loading';
  const subtitle = loading
    ? 'Loading jobs…'
    : `${jobs.length} open ${jobs.length === 1 ? 'position' : 'positions'}`;

  return (
    <Page
      title={isAdmin ? 'Manage jobs' : 'Available jobs'}
      subtitle={subtitle}
      actions={
        isAdmin && (
          <Button variant="contained" startIcon={<AddIcon aria-hidden="true" />} component={RouterLink} to="/add-job">
            Add job
          </Button>
        )
      }
    >
      {status === 'error' && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          Jobs could not be loaded. Check that the server is running and try again.
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {status !== 'error' && (
        <TextField
          label="Search by title or company"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          fullWidth
          sx={{ mb: 3, maxWidth: { sm: 440 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-hidden="true" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {loading && (
        <Grid container spacing={3}>
          {Array.from({ length: JOBS_PER_PAGE }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <JobCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {status === 'ready' && jobs.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed' }}>
          <InboxOutlinedIcon color="disabled" sx={{ fontSize: 48 }} aria-hidden="true" />
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>
            No jobs available yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {isAdmin ? 'Add the first job to get started.' : 'Check back later for new opportunities.'}
          </Typography>
          {isAdmin && (
            <Button variant="contained" component={RouterLink} to="/add-job" sx={{ mt: 3 }}>
              Add a job
            </Button>
          )}
        </Paper>
      )}

      {status === 'ready' && jobs.length > 0 && filtered.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed' }}>
          <SearchOffIcon color="disabled" sx={{ fontSize: 48 }} aria-hidden="true" />
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>
            No jobs match your search
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Try a different title or company name.
          </Typography>
          <Button variant="outlined" onClick={() => setSearch('')} sx={{ mt: 3 }}>
            Clear search
          </Button>
        </Paper>
      )}

      {status === 'ready' && visibleJobs.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
            Showing {(page - 1) * JOBS_PER_PAGE + 1}–{Math.min(page * JOBS_PER_PAGE, filtered.length)} of{' '}
            {filtered.length} {filtered.length === 1 ? 'job' : 'jobs'}
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {visibleJobs.map((job) => (
              <Grid key={job._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.main', transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: avatarColor(job.companyName), color: '#FFFFFF', width: 44, height: 44 }}>
                        {initialsOf(job.companyName)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
                          {job.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.companyName}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {job.description}
                    </Typography>
                    <Chip color="success" variant="outlined" size="small" label={formatSalary(job.salary)} />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {isAdmin ? (
                      <Button fullWidth variant="outlined" color="error" onClick={() => setDeleteTarget(job)}>
                        Delete
                      </Button>
                    ) : (
                      <Button fullWidth variant="outlined" onClick={() => handleApply(job)}>
                        Apply
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {totalPages > 1 && (
        <Stack sx={{ mt: 4, alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            siblingCount={0}
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      {/* Admin delete confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        aria-labelledby="delete-job-title"
        aria-describedby="delete-job-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-job-title">Delete this job?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-job-description">
            {deleteTarget
              ? `“${deleteTarget.jobTitle}” at ${deleteTarget.companyName} will be permanently removed. This cannot be undone.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Page>
  );
}

export default JobListings;
