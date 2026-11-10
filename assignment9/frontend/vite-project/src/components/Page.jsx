import { Container, Box, Typography } from '@mui/material';

// Consistent page shell: max-width container, one h1 and an optional subtitle/actions.
function Page({ title, subtitle, actions, maxWidth = 'lg', children }) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Box>
      {children}
    </Container>
  );
}

export default Page;
