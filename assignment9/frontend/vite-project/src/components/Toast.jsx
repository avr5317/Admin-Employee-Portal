import { Alert, Snackbar } from '@mui/material';

// Small wrapper so every page shows messages the same way.
function Toast({ open, message, severity = 'success', onClose, autoHideDuration = 5000 }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => reason !== 'clickaway' && onClose()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={severity} onClose={onClose} sx={{ width: '100%', boxShadow: 3 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Toast;
