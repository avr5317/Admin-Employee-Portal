import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/usersSlice';
import useLoadData from '../hooks/useLoadData';
import Page from '../components/Page';

function AdminEmployees() {
  const { list: users } = useSelector((state) => state.users);
  const { status, reload } = useLoadData(fetchUsers);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered = query
    ? users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.type.toLowerCase().includes(query)
      )
    : users;

  const subtitle =
    status === 'loading' ? 'Loading users…' : `${users.length} ${users.length === 1 ? 'user' : 'users'} in total`;

  return (
    <Page title="Employees" subtitle={subtitle}>
      {status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          Users could not be loaded. Check that the server is running and try again.
        </Alert>
      )}

      {status !== 'error' && (
        <>
          <TextField
            label="Search by name, email or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ mb: 3, maxWidth: { sm: 440 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon aria-hidden="true" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 560 }}>
              <Table stickyHeader sx={{ minWidth: 520 }} aria-label="Users">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {status === 'loading' &&
                    [0, 1, 2, 3, 4].map((n) => (
                      <TableRow key={n}>
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                        <TableCell><Skeleton variant="rounded" width={72} height={24} /></TableCell>
                      </TableRow>
                    ))}

                  {status === 'ready' &&
                    filtered.map((user) => (
                      <TableRow key={user.email} hover>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={user.type === 'admin' ? 'Admin' : 'Employee'}
                            color={user.type === 'admin' ? 'primary' : 'default'}
                            variant={user.type === 'admin' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {status === 'ready' && filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <PeopleOutlineIcon color="disabled" sx={{ fontSize: 48 }} aria-hidden="true" />
                <Typography variant="h6" component="p" sx={{ mt: 1 }}>
                  {users.length === 0 ? 'No users yet' : 'No users match your search'}
                </Typography>
                {users.length > 0 && (
                  <Button variant="outlined" onClick={() => setSearch('')} sx={{ mt: 2 }}>
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </Paper>
        </>
      )}
    </Page>
  );
}

export default AdminEmployees;
