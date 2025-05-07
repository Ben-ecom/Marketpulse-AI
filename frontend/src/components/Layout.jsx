import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Insights as InsightsIcon,
  DataObject as DataIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../api/supabase';

// Import custom UI components
import GradientBackground from './ui/GradientBackground';
import AnimatedCard from './ui/AnimatedCard';
import TextGradient from './ui/TextGradient';
import PulseButton from './ui/PulseButton';

// Breedte van de zijbalk
const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();

  // Menu openen/sluiten
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Uitloggen
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await supabase.auth.signOut();
      clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Uitloggen mislukt:', error.message);
    }
  };

  // Navigatie items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Nieuw Project', icon: <AddIcon />, path: '/projects/new' },
    { text: 'Marktinzichten', icon: <AnalyticsIcon />, path: '/market-insights' },
    // Admin items (alleen tonen voor admin gebruikers)
    ...(user?.is_admin ? [
      { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin' },
      { text: 'Decodo Dashboard', icon: <DataIcon />, path: '/admin/decodo-dashboard' },
    ] : []),
  ];
  
  // Project-specifieke navigatie items
  // Deze worden dynamisch weergegeven wanneer een gebruiker in een project is
  const projectNavItems = [
    { text: 'Insights', icon: <InsightsIcon />, path: '/projects/:projectId/insights' },
    { text: 'Data Collectie', icon: <DataIcon />, path: '/projects/:projectId/data-collection' },
    { text: 'Trending Topics', icon: <TrendingUpIcon />, path: '/projects/:projectId/trending-topics' },
  ];
  
  // Controleer of we in een project context zijn
  const isInProject = location.pathname.includes('/projects/') && !location.pathname.includes('/projects/new');
  const projectId = isInProject ? location.pathname.split('/')[2] : null;
  
  // Vervang placeholders in projectNavItems paths
  const currentProjectNavItems = projectId
    ? projectNavItems.map(item => ({
        ...item,
        path: item.path.replace(':projectId', projectId)
      }))
    : [];

  // Drawer inhoud
  const drawer = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TextGradient 
          variant="h5" 
          component="div" 
          animate={true}
          gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, #6366f1)`}
          sx={{ fontWeight: 700 }}
        >
          MarketPulse AI
        </TextGradient>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ px: 2 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <AnimatedCard 
                variant={isSelected ? 'gradient' : 'glass'} 
                sx={{ 
                  width: '100%',
                  mb: 0.5,
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isSelected ? '#fff' : theme.palette.primary.main,
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? '#fff' : 'inherit'
                    }}
                  />
                </ListItemButton>
              </AnimatedCard>
            </ListItem>
          );
        })}
      </List>
      
      {/* Project navigatie items tonen als we in een project zijn */}
      {isInProject && currentProjectNavItems.length > 0 && (
        <>
          <Divider sx={{ my: 2, mx: 2 }} />
          <Typography variant="subtitle2" sx={{ px: 3, mb: 1, color: theme.palette.text.secondary }}>
            Project Navigatie
          </Typography>
          <List sx={{ px: 2 }}>
            {currentProjectNavItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <AnimatedCard 
                    variant={isSelected ? 'gradient' : 'glass'} 
                    sx={{ 
                      width: '100%',
                      mb: 0.5,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        p: 1.5,
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          color: isSelected ? '#fff' : theme.palette.primary.main,
                          minWidth: 40
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#fff' : 'inherit'
                        }}
                      />
                    </ListItemButton>
                  </AnimatedCard>
                </ListItem>
              );
            })}
          </List>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar met premium gradient */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: theme.shadows[3],
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha(theme.palette.secondary.main, 0.95)})`,
          backdropFilter: 'blur(10px)',
          color: '#fff',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              '&:hover': {
                background: alpha('#fff', 0.1)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Gebruikersmenu met verbeterde styling */}
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ 
              ml: 2,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha('#fff', 0.1),
                transform: 'scale(1.05)'
              }
            }}
            aria-controls="user-menu"
            aria-haspopup="true"
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  px: 1.5,
                  py: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                }
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Profiel" />
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Instellingen" />
            </MenuItem>
            {user?.is_admin && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Admin Dashboard" />
              </MenuItem>
            )}
            <Divider sx={{ my: 1, mx: 1 }} />
            <Box sx={{ px: 1, pb: 1 }}>
              <PulseButton 
                variant="gradient" 
                fullWidth 
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Uitloggen
              </PulseButton>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Zijbalk met premium styling */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobiele drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Betere mobiele performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[5]
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1)
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Hoofdinhoud met GradientBackground */}
      <GradientBackground
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Hoogte van AppBar
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 3,
            flexGrow: 1,
            zIndex: 1,
            position: 'relative',
          }}
        >
          <Outlet />
        </Box>
      </GradientBackground>
    </Box>
  );
};

export default Layout;
