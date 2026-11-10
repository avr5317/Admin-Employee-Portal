import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/BusinessCenter';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '../colorMode';
import { getHomePath, getNavLinks, getRoleLabel } from '../navigation';

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

function Navbar({ userName, onLogout }) {
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const { mode, toggleColorMode } = useColorMode();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const links = getNavLinks(user);
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`));
  const displayName = userName || user?.fullName || '';
  const roleChipLabel = user ? `${displayName} · ${getRoleLabel(user)}` : '';

  const handleLogout = () => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    onLogout();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: { xs: 0.5, sm: 1 }, minHeight: { xs: 56, md: 64 } }}>
          {/* Hamburger (logged in, below lg) */}
          {user && (
            <IconButton
              aria-label="Open navigation menu"
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Brand */}
          <Typography
            variant="h6"
            component={RouterLink}
            to={getHomePath(user)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mr: { lg: 3 },
              whiteSpace: 'nowrap',
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 800,
            }}
          >
            <WorkIcon color="primary" aria-hidden="true" />
            Job Portal
          </Typography>

          {/* Desktop links (logged in) */}
          {user && (
            <Box
              component="nav"
              aria-label="Main"
              sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, flexGrow: 1 }}
            >
              {links.map((link) => {
                const active = isActive(link.to);
                return (
                  <Button
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    color="inherit"
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      borderRadius: 0,
                      borderBottom: 3,
                      borderColor: active ? 'primary.main' : 'transparent',
                      color: active ? 'primary.main' : 'text.primary',
                      px: 1.5,
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ flexGrow: 1, display: user ? { lg: 'none' } : 'block' }} />

          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              color="inherit"
              onClick={toggleColorMode}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Logged out: only Login and Register */}
          {!user && (
            <>
              <Button color="inherit" component={RouterLink} to="/login" sx={{ color: 'text.primary', px: { xs: 1, sm: 2 }, minWidth: 0 }}>
                Login
              </Button>
              <Button variant="contained" component={RouterLink} to="/register" sx={{ px: { xs: 1.5, sm: 2 } }}>
                Register
              </Button>
            </>
          )}

          {/* User chip + menu (desktop) */}
          {user && (
            <>
              <Chip
                avatar={<Avatar>{initialsOf(displayName)}</Avatar>}
                label={roleChipLabel}
                variant="outlined"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(menuAnchor)}
                aria-controls="user-menu"
                aria-label={`Account menu for ${roleChipLabel}`}
                sx={{
                  display: { xs: 'none', lg: 'inline-flex' },
                  maxWidth: 260,
                  height: 36,
                  color: 'text.primary',
                  '& .MuiChip-avatar': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                }}
              />
              <Menu
                id="user-menu"
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} aria-hidden="true" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile drawer (logged in) */}
      {user && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: 280, maxWidth: '85vw' } } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Job Portal
            </Typography>
            <IconButton aria-label="Close navigation menu" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 2, pb: 2 }}>
            <Chip
              avatar={<Avatar>{initialsOf(displayName)}</Avatar>}
              label={roleChipLabel}
              variant="outlined"
              sx={{
                maxWidth: '100%',
                color: 'text.primary',
                '& .MuiChip-avatar': { bgcolor: 'primary.main', color: 'primary.contrastText' },
              }}
            />
          </Box>
          <Divider />
          <List component="nav" aria-label="Main">
            {links.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                selected={isActive(link.to)}
                aria-current={isActive(link.to) ? 'page' : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} aria-hidden="true" />
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Drawer>
      )}
    </AppBar>
  );
}

export default Navbar;
