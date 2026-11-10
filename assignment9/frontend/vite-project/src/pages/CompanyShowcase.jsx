import { useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { fetchJobs } from '../store/slices/jobsSlice';
import useLoadData from '../hooks/useLoadData';
import Page from '../components/Page';
import { avatarColor, initialsOf } from '../utils/format';
import { getJobsPath } from '../navigation';

const MAX_TITLE_CHIPS = 3;

function CompanyShowcase() {
  const { items: jobs } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const { status, reload } = useLoadData(fetchJobs);

  // Companies are derived from the jobs in Redux: one card per companyName
  const companies = useMemo(() => {
    const byName = new Map();
    jobs.forEach((job) => {
      if (!byName.has(job.companyName)) byName.set(job.companyName, []);
      byName.get(job.companyName).push(job.jobTitle);
    });
    return [...byName.entries()]
      .map(([name, titles]) => ({ name, titles }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  const jobsPath = getJobsPath(user);
  const subtitle =
    status === 'loading'
      ? 'Loading companies…'
      : `${companies.length} ${companies.length === 1 ? 'company is' : 'companies are'} hiring right now`;

  return (
    <Page title="Companies" subtitle={subtitle}>
      {status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          Companies could not be loaded. Check that the server is running and try again.
        </Alert>
      )}

      {status === 'loading' && (
        <Grid container spacing={3}>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <Grid key={n} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={52} height={52} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Stack>
                  <Skeleton variant="rounded" height={28} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {status === 'ready' && companies.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed' }}>
          <BusinessIcon color="disabled" sx={{ fontSize: 48 }} aria-hidden="true" />
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>
            No companies yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Companies appear here once jobs have been posted.
          </Typography>
        </Paper>
      )}

      {status === 'ready' && companies.length > 0 && (
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {companies.map((company) => {
            const extra = company.titles.length - MAX_TITLE_CHIPS;
            return (
              <Grid key={company.name} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{ bgcolor: avatarColor(company.name), color: '#FFFFFF', width: 52, height: 52 }}
                      >
                        {initialsOf(company.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.titles.length} open {company.titles.length === 1 ? 'role' : 'roles'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {company.titles.slice(0, MAX_TITLE_CHIPS).map((title, i) => (
                        <Chip key={`${title}-${i}`} size="small" variant="outlined" label={title} sx={{ maxWidth: '100%' }} />
                      ))}
                      {extra > 0 && <Chip size="small" label={`+${extra} more`} />}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to={`${jobsPath}?q=${encodeURIComponent(company.name)}`}
                    >
                      View jobs
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Page>
  );
}

export default CompanyShowcase;
