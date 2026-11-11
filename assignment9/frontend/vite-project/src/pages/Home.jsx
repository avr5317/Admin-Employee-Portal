import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { fetchJobs } from '../store/slices/jobsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import useLoadData from '../hooks/useLoadData';
import { formatSalary } from '../utils/format';
import { getCompaniesPath, getJobsPath, isAdmin } from '../navigation';

const HERO = {
  admin: {
    title: 'Manage jobs and your team',
    text: 'Post new openings, review every listing, remove outdated ones and see which accounts exist.',
  },
  employee: {
    title: 'Find your next role',
    text: 'Browse open positions, search by title or company, and see which companies are hiring.',
  },
  guest: {
    title: 'A simple portal for jobs and the people who post them',
    text: 'Admins post and manage jobs, employees browse and apply. Log in to get started, or create an employee account.',
  },
};

const STEPS = {
  admin: [
    ['Add a job', 'Use the Add job form to post a company, title, description and salary.'],
    ['Review listings', 'Open Jobs to search and page through everything that has been posted.'],
    ['Keep it tidy', 'Delete outdated jobs, and check the Employees table to see who has an account.'],
  ],
  employee: [
    ['Log in', 'Sign in with your employee account, or register one from the login page.'],
    ['Find a job', 'Search jobs by title or company, or browse the companies that are hiring.'],
    ['Apply', 'Press Apply on a job. It shows a confirmation message, but applications are not stored.'],
  ],
  guest: [
    ['Create an account', 'Register with your name, email and a strong password. New accounts are employees.'],
    ['Log in', 'Sign in to open the jobs, companies and information pages.'],
    ['Browse jobs', 'Search the jobs that admins have posted and see which companies are hiring.'],
  ],
};

const FEATURES = [
  [AdminPanelSettingsIcon, 'Role-based access', 'Admins and employees see different pages, and the API enforces admin-only actions.'],
  [SearchIcon, 'Search and pagination', 'Filter jobs by title or company and page through the results.'],
  [BusinessIcon, 'Companies at a glance', 'See which companies are hiring and how many roles each one has open.'],
  [LockOutlinedIcon, 'Secure sign-in', 'Passwords are hashed with bcrypt and sessions use signed tokens that expire after a day.'],
  [BoltIcon, 'Fast page loads', 'Pages are loaded on demand, so the first load stays small.'],
  [Brightness4Icon, 'Light and dark themes', 'Switch themes from the navbar. Your choice is remembered in this browser.'],
];

function StatCard({ icon, label, value, status }) {
  const Icon = icon;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          variant="rounded"
          sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.14), color: 'primary.main', width: 48, height: 48 }}
        >
          <Icon aria-hidden="true" />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          {status === 'ready' ? (
            <Typography variant="h3" component="p" sx={{ lineHeight: 1.1 }}>
              {value}
            </Typography>
          ) : status === 'error' ? (
            <Typography variant="h3" component="p" sx={{ lineHeight: 1.1 }} aria-label="Unavailable">
              –
            </Typography>
          ) : (
            <Skeleton variant="text" width={64} height={44} />
          )}
          <Typography variant="body2" color="text.secondary">
            {status === 'error' ? `${label} (could not load)` : label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function Home() {
  const { user } = useSelector((state) => state.auth);
  const { items: jobs } = useSelector((state) => state.jobs);
  const { list: users } = useSelector((state) => state.users);

  const admin = isAdmin(user);
  const role = !user ? 'guest' : admin ? 'admin' : 'employee';

  // Jobs need a login; the users list is admin-only
  const { status: jobsStatus } = useLoadData(fetchJobs, Boolean(user));
  const { status: usersStatus } = useLoadData(fetchUsers, admin);

  const hero = HERO[role];
  const jobsPath = getJobsPath(user);
  const companyCount = new Set(jobs.map((job) => job.companyName)).size;
  const latest = jobs.slice(0, 3); // the API returns newest first

  const primaryCta = !user
    ? { label: 'Log in', to: '/login' }
    : admin
      ? { label: 'Manage jobs', to: jobsPath }
      : { label: 'Browse jobs', to: jobsPath };
  const secondaryCta = !user
    ? { label: 'Create an account', to: '/register' }
    : admin
      ? { label: 'Add a job', to: '/add-job' }
      : { label: 'Explore companies', to: getCompaniesPath(user) };

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.16)} 0%, ${alpha(t.palette.secondary.main, 0.1)} 100%)`,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
          <Chip
            label={role === 'guest' ? 'Welcome' : `Signed in as ${admin ? 'admin' : 'employee'}`}
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Typography variant="h1" sx={{ maxWidth: 780 }}>
            {hero.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2, maxWidth: 620 }}>
            {hero.text}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button variant="contained" size="large" component={RouterLink} to={primaryCta.to}>
              {primaryCta.label}
            </Button>
            <Button variant="outlined" size="large" component={RouterLink} to={secondaryCta.to}>
              {secondaryCta.label}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Stats: real numbers from Redux, only for logged-in users */}
        {user && (
          <Box component="section" aria-labelledby="stats-heading" sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography id="stats-heading" variant="h4" component="h2" sx={{ mb: 2 }}>
              At a glance
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: admin ? 4 : 6 }}>
                <StatCard icon={WorkOutlineIcon} label="Open jobs" value={jobs.length} status={jobsStatus} />
              </Grid>
              <Grid size={{ xs: 12, sm: admin ? 4 : 6 }}>
                <StatCard icon={BusinessIcon} label="Companies hiring" value={companyCount} status={jobsStatus} />
              </Grid>
              {admin && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard icon={PeopleOutlineIcon} label="Users" value={users.length} status={usersStatus} />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* How it works */}
        <Box component="section" aria-labelledby="how-heading" sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography id="how-heading" variant="h4" component="h2" sx={{ mb: 2 }}>
            How it works
          </Typography>
          <Grid container spacing={2}>
            {STEPS[role].map(([title, text], index) => (
              <Grid key={title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
                      {index + 1}
                    </Avatar>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Latest jobs */}
        {user && (
          <Box component="section" aria-labelledby="latest-heading" sx={{ mb: { xs: 5, md: 7 } }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2 }}>
              <Typography id="latest-heading" variant="h4" component="h2">
                Latest jobs
              </Typography>
              {latest.length > 0 && (
                <MuiLink component={RouterLink} to={jobsPath}>
                  View all jobs
                </MuiLink>
              )}
            </Box>

            {jobsStatus === 'loading' && (
              <Grid container spacing={2}>
                {[0, 1, 2].map((n) => (
                  <Grid key={n} size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="rounded" height={132} />
                  </Grid>
                ))}
              </Grid>
            )}

            {jobsStatus === 'error' && (
              <Typography color="text.secondary">Latest jobs could not be loaded right now.</Typography>
            )}

            {jobsStatus === 'ready' && latest.length === 0 && (
              <Paper
                variant="outlined"
                sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}
              >
                <InboxOutlinedIcon color="disabled" sx={{ fontSize: 40 }} aria-hidden="true" />
                <Typography variant="h6" component="p" sx={{ mt: 1 }}>
                  No jobs have been posted yet
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {admin ? 'Add the first job to see it here.' : 'Check back later for new openings.'}
                </Typography>
                {admin && (
                  <Button variant="contained" component={RouterLink} to="/add-job" sx={{ mt: 2 }}>
                    Add a job
                  </Button>
                )}
              </Paper>
            )}

            {jobsStatus === 'ready' && latest.length > 0 && (
              <Grid container spacing={2}>
                {latest.map((job) => (
                  <Grid key={job._id} size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="h3" noWrap title={job.jobTitle}>
                          {job.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                          {job.companyName}
                        </Typography>
                        <Chip size="small" color="success" variant="outlined" label={formatSalary(job.salary)} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Features */}
        <Box component="section" aria-labelledby="features-heading">
          <Typography id="features-heading" variant="h4" component="h2" sx={{ mb: 2 }}>
            What you get
          </Typography>
          <Grid container spacing={2}>
            {FEATURES.map(([icon, title, text]) => {
              const Icon = icon;
              return (
              <Grid key={title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Icon color="primary" sx={{ fontSize: 32, mb: 1.5 }} aria-hidden="true" />
                    <Typography variant="h6" component="h3" gutterBottom>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
