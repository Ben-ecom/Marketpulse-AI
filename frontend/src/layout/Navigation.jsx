import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  DataObject as DataObjectIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  BubbleChart as BubbleChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Logo importeren
import logo from '../assets/logo.svg';

// Constante voor drawer breedte
const drawerWidth = 240;

/**
 * Navigation Component
 * 
 * Hoofdnavigatie component voor het MarketPulse AI platform.
 * Bevat de app bar, drawer en navigatie items.
 * 
 * @component
 */
const Navigation = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State voor drawer en menu's
  const [open, setOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  
  // Navigatie items
  const mainNavItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      description: 'Overzicht van alle projecten en analyses'
    },
    { 
      text: 'Data Bronnen', 
      icon: <DataObjectIcon />, 
      path: '/data-sources',
      description: 'Beheer en configureer databronnen'
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      description: 'Geavanceerde analyses en visualisaties'
    }
  ];
  
  // Submenu voor Analytics
  const analyticsSubItems = [
    { 
      text: 'Topic Analyse', 
      icon: <BubbleChartIcon />, 
      path: '/analytics/topic-analysis',
      description: 'Analyseer trending topics en keywords'
    },
    { 
      text: 'Sentiment Analyse', 
      icon: <TimelineIcon />, 
      path: '/analytics/sentiment-analysis',
      description: 'Analyseer sentiment trends over tijd'
    },
    { 
      text: 'Marktaandeel', 
      icon: <PieChartIcon />, 
      path: '/analytics/market-share',
      description: 'Analyseer marktaandeel en concurrentie'
    },
    { 
      text: 'Topic Awareness', 
      icon: <BarChartIcon />, 
      path: '/analytics/topic-awareness',
      description: 'Genereer topic awareness rapporten'
    }
  ];
  
  // Onderste navigatie items
  const bottomNavItems = [
    { 
      text: 'Instellingen', 
      icon: <SettingsIcon />, 
      path: '/settings',
      description: 'Configureer platform instellingen'
    },
    { 
      text: 'Help', 
      icon: <HelpIcon />, 
      path: '/help',
      description: 'Documentatie en ondersteuning'
    }
  ];
  
  // Handlers voor drawer
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  
  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  // Handlers voor gebruikersmenu
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Handlers voor notificatiemenu
  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };
  
  // Handler voor navigatie
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Controleer of een pad actief is
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Controleer of een subpad actief is
  const isSubActive = (path) => {
    return location.pathname === path;
  };
  
  // Render navigatie items
  const renderNavItems = (items) => (
    <List>
      {items.map((item) => (
        <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
          <Tooltip title={open ? '' : item.description} placement="right">
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }} 
              />
            </ListItemButton>
          </Tooltip>
          
          {/* Render submenu voor Analytics */}
          {open && item.text === 'Analytics' && isActive(item.path) && (
            <List component="div" disablePadding>
              {analyticsSubItems.map((subItem) => (
                <ListItem key={subItem.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => handleNavigate(subItem.path)}
                    selected={isSubActive(subItem.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      pl: 4,
                      py: 0
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isSubActive(subItem.path) ? 'primary.main' : 'inherit'
                      }}
                    >
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      sx={{ 
                        opacity: open ? 1 : 0,
                        color: isSubActive(subItem.path) ? 'primary.main' : 'inherit'
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </ListItem>
      ))}
    </List>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={open ? "Sluit navigatie menu" : "Open navigatie menu"}
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            MarketPulse AI
          </Typography>
          
          {/* Zoekknop */}
          <IconButton color="inherit" aria-label="Zoeken">
            <SearchIcon />
          </IconButton>
          
          {/* Notificaties */}
          <IconButton
            color="inherit"
            aria-label="Notificaties"
            onClick={handleOpenNotificationsMenu}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationsMenu}
          >
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">Nieuwe data beschikbaar</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">Rapport gegenereerd</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">Systeem update</Typography>
            </MenuItem>
          </Menu>
          
          {/* Gebruikersmenu */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Tooltip title="Open instellingen">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src="/static/images/avatar/1.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Profiel</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Instellingen</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Uitloggen</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            ...(open ? {
              overflowX: 'hidden',
            } : {
              overflowX: 'hidden',
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
          }}
        >
          {open && (
            <Box
              component="img"
              sx={{
                height: 40,
                my: 1,
              }}
              alt="MarketPulse AI Logo"
              src={logo}
            />
          )}
        </Toolbar>
        <Divider />
        
        {/* Hoofdnavigatie items */}
        {renderNavItems(mainNavItems)}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider />
        
        {/* Onderste navigatie items */}
        {renderNavItems(bottomNavItems)}
      </Drawer>
      
      {/* Hoofdcontent */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)` },
          ml: { sm: open ? `${drawerWidth}px` : `${theme.spacing(9)}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Navigation;
