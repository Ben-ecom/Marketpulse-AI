import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import { edgeFunctionsService } from '../../services/EdgeFunctionsService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { nl } from 'date-fns/locale';
import '../../styles/decodoScheduler.css';

/**
 * DecodoScheduler Component
 * Stelt gebruikers in staat om periodieke scraping taken aan te maken en te beheren
 */
const DecodoScheduler = ({ projectId }) => {
  // State voor de lijst van geplande taken
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State voor het aanmaken/bewerken van taken
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState({
    platform: 'reddit',
    content_type: 'page',
    url: '',
    frequency: 'daily',
    day_of_week: 1, // Maandag
    day_of_month: 1,
    time_of_day: new Date(new Date().setHours(9, 0, 0, 0)), // 9:00 AM
    params: {},
    active: true
  });
  
  // State voor het handmatig uitvoeren van een taak
  const [runningJob, setRunningJob] = useState(null);
  
  // Platform opties
  const platformOptions = [
    { value: 'reddit', label: 'Reddit' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'trustpilot', label: 'Trustpilot' }
  ];
  
  // Content type opties
  const contentTypeOptions = [
    { value: 'page', label: 'Pagina' },
    { value: 'post', label: 'Post' },
    { value: 'comment', label: 'Comment' },
    { value: 'review', label: 'Review' },
    { value: 'profile', label: 'Profiel' }
  ];
  
  // Frequentie opties
  const frequencyOptions = [
    { value: 'daily', label: 'Dagelijks' },
    { value: 'weekly', label: 'Wekelijks' },
    { value: 'monthly', label: 'Maandelijks' }
  ];
  
  // Dagen van de week opties
  const daysOfWeekOptions = [
    { value: 0, label: 'Zondag' },
    { value: 1, label: 'Maandag' },
    { value: 2, label: 'Dinsdag' },
    { value: 3, label: 'Woensdag' },
    { value: 4, label: 'Donderdag' },
    { value: 5, label: 'Vrijdag' },
    { value: 6, label: 'Zaterdag' }
  ];
  
  // Dagen van de maand opties
  const daysOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`
  }));
  
  // Laad geplande taken wanneer het component wordt geladen of wanneer projectId verandert
  useEffect(() => {
    if (projectId) {
      fetchScheduledJobs();
    }
  }, [projectId]);
  
  // Haal geplande taken op
  const fetchScheduledJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('scheduled_scrape_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('next_run', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setScheduledJobs(data || []);
    } catch (error) {
      console.error('Fout bij het ophalen van geplande taken:', error);
      setError('Fout bij het ophalen van geplande taken. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open het dialoogvenster voor het aanmaken van een nieuwe taak
  const handleAddJob = () => {
    setIsEditing(false);
    setCurrentJob({
      platform: 'reddit',
      content_type: 'page',
      url: '',
      frequency: 'daily',
      day_of_week: 1, // Maandag
      day_of_month: 1,
      time_of_day: new Date(new Date().setHours(9, 0, 0, 0)), // 9:00 AM
      params: {},
      active: true
    });
    setOpenDialog(true);
  };
  
  // Open het dialoogvenster voor het bewerken van een bestaande taak
  const handleEditJob = (job) => {
    setIsEditing(true);
    
    // Converteer time_of_day string naar Date object
    const [hours, minutes] = job.time_of_day.split(':').map(Number);
    const timeOfDay = new Date();
    timeOfDay.setHours(hours, minutes, 0, 0);
    
    setCurrentJob({
      ...job,
      time_of_day: timeOfDay
    });
    
    setOpenDialog(true);
  };
  
  // Sluit het dialoogvenster
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setCurrentJob(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle time change
  const handleTimeChange = (newTime) => {
    setCurrentJob(prev => ({
      ...prev,
      time_of_day: newTime
    }));
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    
    setCurrentJob(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Bereken de volgende uitvoeringstijd
  const calculateNextRun = (job) => {
    const now = new Date();
    const nextRun = new Date();
    
    // Zet de tijd op de ingestelde tijd
    const timeOfDay = job.time_of_day instanceof Date ? job.time_of_day : new Date();
    nextRun.setHours(timeOfDay.getHours(), timeOfDay.getMinutes(), 0, 0);
    
    // Als de tijd vandaag al is geweest, zet de datum op morgen
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Pas de datum aan op basis van de frequentie
    switch (job.frequency) {
      case 'daily':
        // Geen aanpassing nodig, we hebben al de volgende dag ingesteld als nodig
        break;
        
      case 'weekly':
        // Zet de datum op de volgende dag van de week
        const dayOfWeek = job.day_of_week !== null ? job.day_of_week : 0; // Default naar zondag
        const currentDay = nextRun.getDay();
        let daysUntilTargetDay = dayOfWeek - currentDay;
        
        if (daysUntilTargetDay <= 0) {
          // Als de dag vandaag is of al is geweest deze week, ga naar volgende week
          daysUntilTargetDay += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysUntilTargetDay);
        break;
        
      case 'monthly':
        // Zet de datum op de volgende dag van de maand
        const dayOfMonth = job.day_of_month !== null ? job.day_of_month : 1; // Default naar de 1e
        
        // Ga naar de volgende maand
        nextRun.setMonth(nextRun.getMonth() + 1);
        
        // Zet de dag van de maand
        // Zorg ervoor dat we niet over de grenzen van de maand gaan
        const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        nextRun.setDate(targetDay);
        break;
    }
    
    return nextRun;
  };
  
  // Sla de taak op
  const handleSaveJob = async () => {
    try {
      // Valideer de input
      if (!currentJob.url) {
        setError('URL is verplicht');
        return;
      }
      
      // Bereid de data voor
      const timeOfDay = currentJob.time_of_day instanceof Date ? currentJob.time_of_day : new Date();
      const formattedTime = `${timeOfDay.getHours().toString().padStart(2, '0')}:${timeOfDay.getMinutes().toString().padStart(2, '0')}`;
      
      const nextRun = calculateNextRun(currentJob);
      
      const jobData = {
        project_id: projectId,
        platform: currentJob.platform,
        content_type: currentJob.content_type,
        url: currentJob.url,
        frequency: currentJob.frequency,
        day_of_week: currentJob.frequency === 'weekly' ? currentJob.day_of_week : null,
        day_of_month: currentJob.frequency === 'monthly' ? currentJob.day_of_month : null,
        time_of_day: formattedTime,
        params: currentJob.params || {},
        active: currentJob.active,
        next_run: nextRun.toISOString()
      };
      
      if (isEditing) {
        // Update bestaande taak
        const { error } = await supabase
          .from('scheduled_scrape_jobs')
          .update(jobData)
          .eq('id', currentJob.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Maak nieuwe taak aan
        const { error } = await supabase
          .from('scheduled_scrape_jobs')
          .insert(jobData);
        
        if (error) {
          throw error;
        }
      }
      
      // Vernieuw de lijst
      fetchScheduledJobs();
      
      // Sluit het dialoogvenster
      handleCloseDialog();
    } catch (error) {
      console.error('Fout bij het opslaan van taak:', error);
      setError('Fout bij het opslaan van taak. Probeer het later opnieuw.');
    }
  };
  
  // Verwijder een taak
  const handleDeleteJob = async (job) => {
    try {
      const { error } = await supabase
        .from('scheduled_scrape_jobs')
        .delete()
        .eq('id', job.id);
      
      if (error) {
        throw error;
      }
      
      // Vernieuw de lijst
      fetchScheduledJobs();
    } catch (error) {
      console.error('Fout bij het verwijderen van taak:', error);
      setError('Fout bij het verwijderen van taak. Probeer het later opnieuw.');
    }
  };
  
  // Activeer/deactiveer een taak
  const handleToggleActive = async (job) => {
    try {
      const { error } = await supabase
        .from('scheduled_scrape_jobs')
        .update({ active: !job.active })
        .eq('id', job.id);
      
      if (error) {
        throw error;
      }
      
      // Vernieuw de lijst
      fetchScheduledJobs();
    } catch (error) {
      console.error('Fout bij het wijzigen van taak status:', error);
      setError('Fout bij het wijzigen van taak status. Probeer het later opnieuw.');
    }
  };
  
  // Voer een taak handmatig uit
  const handleRunJob = async (job) => {
    try {
      setRunningJob(job.id);
      
      // Roep de scheduled-scraper Edge Function aan
      const response = await edgeFunctionsService.callFunction('scheduled-scraper', {
        job_id: job.id,
        run_now: true
      });
      
      // Vernieuw de lijst
      fetchScheduledJobs();
    } catch (error) {
      console.error('Fout bij het uitvoeren van taak:', error);
      setError('Fout bij het uitvoeren van taak. Probeer het later opnieuw.');
    } finally {
      setRunningJob(null);
    }
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Niet gepland';
    
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get paginated jobs
  const paginatedJobs = scheduledJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box className="decodo-scheduler">
      <Box className="scheduler-header">
        <Typography variant="h6" component="h2">
          Geplande Scraping Taken
        </Typography>
        
        <Box className="scheduler-actions">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddJob}
          >
            Nieuwe Taak
          </Button>
          
          <IconButton 
            onClick={fetchScheduledJobs} 
            disabled={isLoading}
            className="refresh-button"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" className="error-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Taken laden...
          </Typography>
        </Box>
      ) : (
        <>
          {scheduledJobs.length === 0 ? (
            <Card className="empty-state">
              <CardContent>
                <Box textAlign="center" py={3}>
                  <ScheduleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Geen geplande taken gevonden
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Maak een nieuwe taak aan om periodiek data te verzamelen
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddJob}
                    sx={{ mt: 2 }}
                  >
                    Nieuwe Taak
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              <TableContainer component={Paper} className="jobs-table">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Frequentie</TableCell>
                      <TableCell>Volgende Uitvoering</TableCell>
                      <TableCell>Laatste Uitvoering</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Acties</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Chip 
                            label={job.platform} 
                            size="small" 
                            className={`platform-chip platform-${job.platform}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={job.url}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {job.url}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {job.frequency === 'daily' && 'Dagelijks'}
                          {job.frequency === 'weekly' && `Wekelijks (${daysOfWeekOptions.find(d => d.value === job.day_of_week)?.label})`}
                          {job.frequency === 'monthly' && `Maandelijks (Dag ${job.day_of_month})`}
                          <Typography variant="caption" display="block" color="text.secondary">
                            om {job.time_of_day}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(job.next_run)}</TableCell>
                        <TableCell>{job.last_run ? formatDate(job.last_run) : 'Nog niet uitgevoerd'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.active ? 'Actief' : 'Inactief'} 
                            color={job.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box className="action-buttons">
                            <Tooltip title="Uitvoeren">
                              <IconButton 
                                size="small" 
                                onClick={() => handleRunJob(job)}
                                disabled={!!runningJob}
                                className="run-button"
                              >
                                {runningJob === job.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <PlayArrowIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={job.active ? 'Deactiveren' : 'Activeren'}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleToggleActive(job)}
                                className={job.active ? 'pause-button' : 'play-button'}
                              >
                                {job.active ? (
                                  <PauseIcon fontSize="small" />
                                ) : (
                                  <PlayArrowIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Bewerken">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditJob(job)}
                                className="edit-button"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Verwijderen">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteJob(job)}
                                className="delete-button"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={scheduledJobs.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Rijen per pagina:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
              />
            </>
          )}
        </>
      )}
      
      {/* Dialoogvenster voor het aanmaken/bewerken van taken */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Taak Bewerken' : 'Nieuwe Taak Aanmaken'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="platform-label">Platform</InputLabel>
                <Select
                  labelId="platform-label"
                  id="platform"
                  name="platform"
                  value={currentJob.platform}
                  onChange={handleInputChange}
                  label="Platform"
                >
                  {platformOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="content-type-label">Content Type</InputLabel>
                <Select
                  labelId="content-type-label"
                  id="content_type"
                  name="content_type"
                  value={currentJob.content_type}
                  onChange={handleInputChange}
                  label="Content Type"
                >
                  {contentTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                name="url"
                value={currentJob.url}
                onChange={handleInputChange}
                margin="normal"
                placeholder="https://www.example.com"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Frequentie
              </Typography>
              
              <RadioGroup
                name="frequency"
                value={currentJob.frequency}
                onChange={handleInputChange}
                row
              >
                {frequencyOptions.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
            
            {currentJob.frequency === 'weekly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="day-of-week-label">Dag van de Week</InputLabel>
                  <Select
                    labelId="day-of-week-label"
                    id="day_of_week"
                    name="day_of_week"
                    value={currentJob.day_of_week}
                    onChange={handleInputChange}
                    label="Dag van de Week"
                  >
                    {daysOfWeekOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {currentJob.frequency === 'monthly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="day-of-month-label">Dag van de Maand</InputLabel>
                  <Select
                    labelId="day-of-month-label"
                    id="day_of_month"
                    name="day_of_month"
                    value={currentJob.day_of_month}
                    onChange={handleInputChange}
                    label="Dag van de Maand"
                  >
                    {daysOfMonthOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
                <TimePicker
                  label="Tijd"
                  value={currentJob.time_of_day}
                  onChange={handleTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentJob.active}
                    onChange={handleSwitchChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Actief"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSaveJob} 
            variant="contained" 
            color="primary"
            disabled={!currentJob.url}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

DecodoScheduler.propTypes = {
  projectId: PropTypes.string.isRequired
};

export default DecodoScheduler;
