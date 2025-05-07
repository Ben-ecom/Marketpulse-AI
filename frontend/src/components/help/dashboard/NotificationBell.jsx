/**
 * NotificationBell.jsx
 * 
 * Component voor het weergeven van een notificatie bel met een badge voor ongelezen notificaties.
 * Toont een popover met een lijst van notificaties wanneer erop geklikt wordt.
 */

import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
  Paper,
  CircularProgress,
  ListItemSecondaryAction,
  ListItemIcon
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { useNotifications } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * NotificationBell component
 * @component
 */
const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications
  } = useNotifications();

  // Handler voor het openen van het popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    refreshNotifications();
  };

  // Handler voor het sluiten van het popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handler voor het markeren van een notificatie als gelezen
  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  // Handler voor het markeren van alle notificaties als gelezen
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Handler voor het verwijderen van een notificatie
  const handleDelete = (event, notificationId) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  // Handler voor het verwijderen van alle notificaties
  const handleDeleteAll = () => {
    deleteAllNotifications();
    handleClose();
  };

  // Bepaal of het popover open is
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  // Helper functie om een icoon te krijgen op basis van de metric
  const getIconForMetric = (metric) => {
    switch (metric) {
      case 'totalInteractions':
        return <InfoIcon color="primary" />;
      case 'totalFeedback':
        return <InfoIcon color="primary" />;
      case 'feedbackSubmissionRate':
        return <WarningIcon color="warning" />;
      case 'positiveFeedbackRate':
        return <CheckCircleIcon color="success" />;
      case 'averageUserSatisfaction':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="primary" />;
    }
  };

  // Helper functie om een datum te formatteren
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: nl });
    } catch (error) {
      return 'Onbekende datum';
    }
  };

  return (
    <>
      <Tooltip title="Notificaties">
        <IconButton
          aria-describedby={id}
          onClick={handleClick}
          color="inherit"
          size="large"
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificaties</Typography>
          <Box>
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Alles gelezen
            </Button>
            <Button 
              size="small" 
              color="error" 
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
            >
              Alles verwijderen
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Je hebt geen notificaties
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <Paper
                key={notification.id}
                elevation={0}
                sx={{
                  mb: 0.5,
                  backgroundColor: notification.read ? 'transparent' : 'action.hover'
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleMarkAsRead(notification.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    {getIconForMetric(notification.metric)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {`${notification.metric}: ${notification.currentValue}`}
                        </Typography>
                        {" — "}
                        {formatDate(notification.created_at)}
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDelete(e, notification.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </Paper>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
