import { Container, Typography, Box } from '@mui/material';

function Contact() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Contact Us
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Email</Typography>
        <Typography variant="body1" paragraph>
          contact@jobportal.com
        </Typography>
        
        <Typography variant="h6">Phone</Typography>
        <Typography variant="body1" paragraph>
          +1 (555) 123-4567
        </Typography>
      </Box>
    </Container>
  );
}

export default Contact;