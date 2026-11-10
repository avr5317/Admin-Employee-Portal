import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import Page from '../components/Page';
import { REPO_URL } from '../navigation';

const ADMIN_CAN = [
  'Add jobs with a company, title, description and salary',
  'Search and page through all job listings',
  'Delete jobs, after a confirmation',
  'See every user in the Employees table, with their role',
  'See which companies are hiring on the Companies page',
];

const EMPLOYEE_CAN = [
  'Browse jobs and search them by title or company',
  'Press Apply on a job (the demo shows a message only)',
  'See which companies are hiring and how many roles each has open',
  'Register their own employee account from the sign-up page',
];

const FRONTEND_STACK = ['React', 'Redux Toolkit', 'Material UI', 'React Router', 'Axios', 'Vite'];
const BACKEND_STACK = ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'bcrypt'];

const SECURITY = [
  ['JWT sign-in', 'Logging in returns a signed token that expires after one day. The app sends it with every API request.'],
  ['Admin-only endpoints', 'Creating and deleting jobs, listing users, and editing or deleting users require an admin token. Everything else except sign-up and login needs a logged-in user.'],
  ['Role-based routes', 'Employee and admin pages are separate. Someone with the wrong role is redirected away.'],
  ['Password hashing', 'Passwords are hashed with bcrypt before they are stored.'],
  ['Automatic sign-out', 'If the API rejects the token, for example because it expired, the app clears the saved login and signs you out.'],
  ['Lazy-loaded pages and an error boundary', 'Pages are loaded on demand. If a page fails to render or load, you get a message with a Reload button instead of a blank screen.'],
];

const LIMITATIONS = [
  'The login token is stored in localStorage, so a script injected into the page could read it.',
  'Apply only shows a message. Nothing is saved or sent.',
  'There are no refresh tokens or rate limiting.',
  'There are no automated tests.',
];

const FAQ = [
  [
    'How do roles work?',
    'Every account is either an admin or an employee. Admins can add and delete jobs and see the Employees table. Employees can browse jobs and companies. The API checks the role for admin-only actions, so hiding a button is not the only protection.',
  ],
  [
    'How can I try the demo?',
    'Register to create an employee account. If you run the backend on your own machine, running npm run seed in assignment8/user-management-api adds demo data and two accounts: admin@demo.test and employee@demo.test, both with the password Passw0rd!. These accounts are for local development only.',
  ],
  [
    'Can I make an admin account from the sign-up page?',
    'No. Registration always creates an employee. After the first admin exists, only an admin can create another admin account, through the API.',
  ],
  [
    'Where is my data stored?',
    'Users and jobs are stored in MongoDB behind the Express API. In your browser, the login token, your user details and your light or dark theme choice are kept in localStorage.',
  ],
  [
    'What does the Apply button do?',
    'It shows a confirmation message and nothing else. No application is saved, and nothing is sent to an employer.',
  ],
  [
    'How long do I stay logged in?',
    'Your login is restored when you refresh the page. It ends when you log out, when the one-day token expires, or when the API rejects the token.',
  ],
];

function Section({ id, title, children }) {
  return (
    <Box component="section" aria-labelledby={id} sx={{ mt: { xs: 5, md: 7 } }}>
      <Typography id={id} variant="h4" component="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function CapabilityCard({ icon, title, items }) {
  const Icon = icon;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Icon color="primary" aria-hidden="true" />
          <Typography variant="h5" component="h3">
            {title}
          </Typography>
        </Stack>
        <List dense disablePadding>
          {items.map((item) => (
            <ListItem key={item} disableGutters sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" aria-hidden="true" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function About() {
  return (
    <Page
      title="About"
      subtitle="What this project is, what it can do and how it is built."
      maxWidth="md"
    >
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h5" component="h2" gutterBottom>
          A job portal with two roles
        </Typography>
        <Typography color="text.secondary">
          Job Portal is a full-stack web app for two kinds of people. Admins post and manage jobs.
          Employees browse the jobs and apply. It is a portfolio project, built to practise React,
          Redux, role-based access and a secured REST API. It is not a live hiring service.
        </Typography>
      </Paper>

      <Section id="can-do" title="What you can do">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CapabilityCard icon={AdminPanelSettingsIcon} title="Admin" items={ADMIN_CAN} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CapabilityCard icon={PersonOutlineIcon} title="Employee" items={EMPLOYEE_CAN} />
          </Grid>
        </Grid>
      </Section>

      <Section id="built-with" title="Built with">
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Frontend
            </Typography>
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
              {FRONTEND_STACK.map((name) => (
                <Chip key={name} label={name} color="primary" variant="outlined" />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Backend
            </Typography>
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
              {BACKEND_STACK.map((name) => (
                <Chip key={name} label={name} color="secondary" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Section>

      <Section id="security" title="Security and architecture">
        <Grid container spacing={2}>
          {SECURITY.map(([title, text]) => (
            <Grid key={title} size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
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
      </Section>

      <Section id="limitations" title="Known limitations">
        <Alert severity="warning" icon={false}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This is a demo, so please keep these in mind:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {LIMITATIONS.map((item) => (
              <li key={item}>
                <Typography variant="body2">{item}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      </Section>

      <Section id="faq" title="Frequently asked questions">
        {FAQ.map(([question, answer], index) => (
          <Accordion key={question} disableGutters variant="outlined" square={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-${index}-content`}
              id={`faq-${index}-header`}
            >
              <Typography component="h3" sx={{ fontWeight: 600 }}>
                {question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails id={`faq-${index}-content`}>
              <Typography color="text.secondary">{answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Section>

      <Section id="built-by" title="Built by">
        <Card>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" component="p">
                avr5317
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The source code and issue tracker are on GitHub.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon aria-hidden="true" />}
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Button>
          </CardContent>
        </Card>
      </Section>
    </Page>
  );
}

export default About;
