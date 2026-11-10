import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Page from '../components/Page';
import { REPO_URL } from '../navigation';

const MESSAGE_MAX = 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || '').trim();

const validate = ({ name, email, subject, message }) => ({
  name: name.trim().length < 2 ? 'Please enter your name (at least 2 characters).' : '',
  email: EMAIL_REGEX.test(email.trim()) ? '' : 'Please enter a valid email address.',
  subject: subject.trim().length < 3 ? 'Please enter a subject (at least 3 characters).' : '',
  message:
    message.trim().length < 10
      ? 'Please write a message of at least 10 characters.'
      : message.length > MESSAGE_MAX
        ? `Please keep the message under ${MESSAGE_MAX} characters.`
        : '',
});

const EMPTY = { name: '', email: '', subject: '', message: '' };

function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const errors = validate(values);
  const isValid = Object.values(errors).every((e) => !e);
  const showError = (field) => Boolean(touched[field] && errors[field]);

  const handleChange = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;

    // This demo form does not send anything. The short wait only shows the loading state.
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setSnackbarOpen(true);
      setValues(EMPTY);
      setTouched({});
    }, 500);
  };

  const mailtoHref = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(
        `${values.message}\n\n${values.name} <${values.email}>`
      )}`
    : '';

  const field = (id, label, extra = {}) => ({
    id: `contact-${id}`,
    label,
    value: values[id],
    onChange: handleChange(id),
    onBlur: handleBlur(id),
    error: showError(id),
    helperText: showError(id) ? errors[id] : extra.helperText,
    required: true,
    fullWidth: true,
    margin: 'normal',
    ...extra,
  });

  return (
    <Page
      title="Contact"
      subtitle="This page is part of the demo project."
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              This is a demo form. It does not send messages anywhere.
            </Alert>

            <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
              <TextField {...field('name', 'Name', { autoComplete: 'name' })} />
              <TextField {...field('email', 'Email', { type: 'email', autoComplete: 'email' })} />
              <TextField {...field('subject', 'Subject')} />
              <TextField
                {...field('message', 'Message', {
                  multiline: true,
                  minRows: 5,
                  helperText: undefined,
                  slotProps: { htmlInput: { maxLength: MESSAGE_MAX } },
                })}
                helperText={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <span>{showError('message') ? errors.message : ''}</span>
                    <span aria-live="polite" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {values.message.length} / {MESSAGE_MAX}
                    </span>
                  </Box>
                }
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} aria-label="Submitting" /> : 'Submit'}
                </Button>
                {CONTACT_EMAIL && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<EmailOutlinedIcon aria-hidden="true" />}
                    href={mailtoHref}
                    disabled={!isValid}
                  >
                    Send by email
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Project links
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The code and the issue tracker for this project are on GitHub.
              </Typography>
              <Stack spacing={1.5}>
                <MuiLink
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                >
                  <GitHubIcon fontSize="small" aria-hidden="true" />
                  GitHub repository
                </MuiLink>
                <MuiLink
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                >
                  <BugReportOutlinedIcon fontSize="small" aria-hidden="true" />
                  Report an issue
                </MuiLink>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%', boxShadow: 3 }}>
          Thanks. This demo form does not send messages.
        </Alert>
      </Snackbar>
    </Page>
  );
}

export default Contact;
