import React from 'react';
import { Container, Typography, Button, Alert } from '@mui/material';

// Catches render errors (and failed lazy-chunk loads) in the tree below it.
// Pass a `resetKey` (e.g. the current route) to clear the error when it changes.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ mt: 6, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3, justifyContent: 'center' }}>
            Something went wrong while loading this page.
          </Alert>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please try reloading. If the problem keeps happening, try again later.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
