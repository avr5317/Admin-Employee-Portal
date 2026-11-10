import { Box, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import { REPO_URL, getAboutPath, getContactPath, getHomePath, getJobsPath } from '../navigation';

function Footer({ user }) {
  // Logged-out visitors cannot open the app pages (they redirect to login),
  // so they get Login/Register instead of Home/Jobs/About/Contact.
  const links = user
    ? [
        { label: 'Home', to: getHomePath(user) },
        { label: 'Jobs', to: getJobsPath(user) },
        { label: 'About', to: getAboutPath(user) },
        { label: 'Contact', to: getContactPath(user) },
      ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  return (
    <Box
      component="footer"
      sx={{ mt: 6, py: 4, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Job Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a demo project.
            </Typography>
          </Box>

          <Stack
            component="nav"
            aria-label="Footer"
            direction="row"
            spacing={3}
            useFlexGap
            sx={{ flexWrap: 'wrap', alignItems: 'center' }}
          >
            {links.map((link) => (
              <MuiLink
                key={link.label}
                component={RouterLink}
                to={link.to}
                color="text.primary"
                underline="hover"
              >
                {link.label}
              </MuiLink>
            ))}
            <MuiLink
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              color="text.primary"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
            >
              <GitHubIcon fontSize="small" aria-hidden="true" />
              GitHub
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
