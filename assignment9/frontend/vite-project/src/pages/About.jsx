import { Container, Typography } from '@mui/material';

function About() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1" paragraph>
        We are a leading job portal dedicated to connecting job seekers with their ideal careers.
      </Typography>
      <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
        Our Mission
      </Typography>
      <Typography variant="body1" paragraph>
        To simplify the job search process and help professionals find meaningful work.
      </Typography>
    </Container>
  );
}

export default About;