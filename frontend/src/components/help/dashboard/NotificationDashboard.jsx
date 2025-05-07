/**
 * NotificationDashboard.jsx
 * 
 * Dashboard component voor het monitoren en beheren van notificaties.
 * Biedt een overzicht van alle notificaties in het systeem en statistieken over notificatiegebruik.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Divider,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

// COLORS voor grafieken
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * NotificationDashboard component
 * @component
 */
const NotificationDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State voor notificatiedata
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState([]);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    totalRead: 0,
    totalUnread: 0,
    notificationsByMetric: [],
    notificationsByDay: [],
    settingsByUser: 0,
    thresholdsByMetric: []
  });
  
  // State voor filters en paginering
  const [filters, setFilters] = useState({
    metric: '',
    read: '',
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    }
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // Functie voor het ophalen van notificaties
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Bouw de query op basis van filters
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Voeg filters toe indien ingesteld
      if (filters.metric) {
        query = query.eq('metric', filters.metric);
      }
      
      if (filters.read !== '') {
        query = query.eq('read', filters.read === 'read');
      }
      
      if (filters.dateRange.start && filters.dateRange.end) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
      
      // Haal ook notificatie-instellingen op
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*');
      
      if (settingsError) {
        throw settingsError;
      }
      
      setNotificationSettings(settingsData || []);
      
      // Bereken statistieken
      calculateStats(data || [], settingsData || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Er is een fout opgetreden bij het ophalen van notificaties.');
    } finally {
      setLoading(false);
    }
  };
  
  // Functie voor het berekenen van statistieken
  const calculateStats = (notificationsData, settingsData) => {
    // Totalen
    const totalNotifications = notificationsData.length;
    const totalRead = notificationsData.filter(n => n.read).length;
    const totalUnread = totalNotifications - totalRead;
    
    // Notificaties per metric
    const notificationsByMetric = [];
    const metricCounts = {};
    
    notificationsData.forEach(notification => {
      if (!metricCounts[notification.metric]) {
        metricCounts[notification.metric] = 0;
      }
      metricCounts[notification.metric]++;
    });
    
    Object.keys(metricCounts).forEach(metric => {
      notificationsByMetric.push({
        name: getMetricLabel(metric),
        value: metricCounts[metric]
      });
    });
    
    // Notificaties per dag
    const notificationsByDay = [];
    const dayCounts = {};
    
    notificationsData.forEach(notification => {
      const date = format(parseISO(notification.created_at), 'yyyy-MM-dd');
      if (!dayCounts[date]) {
        dayCounts[date] = 0;
      }
      dayCounts[date]++;
    });
    
    // Sorteer op datum en neem de laatste 14 dagen
    const sortedDates = Object.keys(dayCounts).sort();
    const last14Days = sortedDates.slice(-14);
    
    last14Days.forEach(date => {
      notificationsByDay.push({
        date: format(parseISO(date), 'd MMM', { locale: nl }),
        count: dayCounts[date]
      });
    });
    
    // Aantal gebruikers met instellingen
    const settingsByUser = settingsData.length;
    
    // Drempelwaarden per metric
    const thresholdsByMetric = [];
    const thresholdCounts = {};
    
    settingsData.forEach(setting => {
      if (setting.thresholds && Array.isArray(setting.thresholds)) {
        setting.thresholds.forEach(threshold => {
          if (!thresholdCounts[threshold.metric]) {
            thresholdCounts[threshold.metric] = 0;
          }
          thresholdCounts[threshold.metric]++;
        });
      }
    });
    
    Object.keys(thresholdCounts).forEach(metric => {
      thresholdsByMetric.push({
        name: getMetricLabel(metric),
        value: thresholdCounts[metric]
      });
    });
    
    setStats({
      totalNotifications,
      totalRead,
      totalUnread,
      notificationsByMetric,
      notificationsByDay,
      settingsByUser,
      thresholdsByMetric
    });
  };
  
  // Helper functie voor het formatteren van metrics
  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'totalInteractions':
        return 'Totaal Interacties';
      case 'totalFeedback':
        return 'Totaal Feedback';
      case 'feedbackSubmissionRate':
        return 'Feedback %';
      case 'positiveFeedbackRate':
        return 'Positieve Feedback %';
      case 'averageUserSatisfaction':
        return 'Gem. Tevredenheid';
      default:
        return metric;
    }
  };
  
  // Helper functie voor het formatteren van operators
  const getOperatorLabel = (operator) => {
    switch (operator) {
      case 'gt':
        return '>';
      case 'lt':
        return '<';
      case 'eq':
        return '=';
      case 'gte':
        return '>=';
      case 'lte':
        return '<=';
      default:
        return operator;
    }
  };
  
  // Handlers voor paginering
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handler voor filters
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handler voor refresh
  const handleRefresh = () => {
    fetchNotifications();
  };
  
  // Handler voor exporteren
  const handleExport = () => {
    // Converteer notificaties naar CSV
    const headers = ['ID', 'Gebruiker', 'Metric', 'Operator', 'Waarde', 'Huidige Waarde', 'Bericht', 'Gelezen', 'Aangemaakt'];
    const csvContent = [
      headers.join(','),
      ...notifications.map(notification => [
        notification.id,
        notification.user_id,
        getMetricLabel(notification.metric),
        getOperatorLabel(notification.operator),
        notification.value,
        notification.current_value,
        `"${notification.message.replace(/"/g, '""')}"`,
        notification.read ? 'Ja' : 'Nee',
        format(parseISO(notification.created_at), 'dd-MM-yyyy HH:mm:ss')
      ].join(','))
    ].join('\n');
    
    // Maak een downloadbare link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `notificaties-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Laad notificaties bij het laden van de component
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Laad notificaties opnieuw wanneer filters veranderen
  useEffect(() => {
    fetchNotifications();
  }, [filters]);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Notificatie Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={notifications.length === 0}
          >
            Exporteren
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Verversen
          </Button>
        </Box>
      </Box>
      
      {showFilters && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Metric</InputLabel>
                <Select
                  value={filters.metric}
                  onChange={(e) => handleFilterChange('metric', e.target.value)}
                  label="Metric"
                >
                  <MenuItem value="">Alle metrics</MenuItem>
                  <MenuItem value="totalInteractions">Totaal Interacties</MenuItem>
                  <MenuItem value="totalFeedback">Totaal Feedback</MenuItem>
                  <MenuItem value="feedbackSubmissionRate">Feedback %</MenuItem>
                  <MenuItem value="positiveFeedbackRate">Positieve Feedback %</MenuItem>
                  <MenuItem value="averageUserSatisfaction">Gem. Tevredenheid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.read}
                  onChange={(e) => handleFilterChange('read', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Alle notificaties</MenuItem>
                  <MenuItem value="read">Gelezen</MenuItem>
                  <MenuItem value="unread">Ongelezen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={() => setFilters({
                  metric: '',
                  read: '',
                  dateRange: {
                    start: subDays(new Date(), 30),
                    end: new Date()
                  }
                })}
              >
                Filters Wissen
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Statistieken */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notificatie Overzicht
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Totaal aantal notificaties
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {stats.totalNotifications}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Gelezen notificaties
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {stats.totalRead}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ongelezen notificaties
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="error.main">
                      {stats.totalUnread}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Gebruikers met instellingen
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {stats.settingsByUser}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notificaties per Metric
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    {stats.notificationsByMetric.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.notificationsByMetric}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.notificationsByMetric.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Geen data beschikbaar
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Drempelwaarden per Metric
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    {stats.thresholdsByMetric.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.thresholdsByMetric}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Geen data beschikbaar
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notificaties per Dag
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {stats.notificationsByDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stats.notificationsByDay}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="count" name="Aantal Notificaties" stroke="#2563eb" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Geen data beschikbaar
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Notificatie tabel */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Notificaties
            </Typography>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Waarde</TableCell>
                    <TableCell>Huidige Waarde</TableCell>
                    <TableCell>Bericht</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aangemaakt</TableCell>
                    <TableCell>Acties</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((notification) => (
                      <TableRow hover key={notification.id}>
                        <TableCell>{getMetricLabel(notification.metric)}</TableCell>
                        <TableCell>
                          {getOperatorLabel(notification.operator)} {notification.value}
                        </TableCell>
                        <TableCell>{notification.current_value}</TableCell>
                        <TableCell>{notification.message}</TableCell>
                        <TableCell>
                          <Chip
                            label={notification.read ? 'Gelezen' : 'Ongelezen'}
                            color={notification.read ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {format(parseISO(notification.created_at), 'dd-MM-yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {notifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Geen notificaties gevonden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={notifications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rijen per pagina:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default NotificationDashboard;
