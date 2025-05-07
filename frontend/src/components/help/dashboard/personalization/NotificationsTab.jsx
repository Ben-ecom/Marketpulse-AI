/**
 * NotificationsTab.jsx
 * 
 * Component voor het beheren van notificatie-instellingen voor het dashboard.
 * Biedt opties voor het instellen van drempelwaarden voor metrics en notificatiemethoden.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

/**
 * NotificationsTab component
 * @component
 */
const NotificationsTab = ({ 
  notificationSettings, 
  onUpdateSettings,
  onAddThreshold,
  onUpdateThreshold,
  onRemoveThreshold,
  onUpdateMethods,
  onToggleEnabled
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [thresholdForm, setThresholdForm] = useState({
    metric: 'totalInteractions',
    operator: 'gt',
    value: 100,
    message: ''
  });
  
  // Beschikbare metrics met labels en beschrijvingen
  const AVAILABLE_METRICS = [
    { 
      id: 'totalInteractions', 
      label: 'Totaal aantal interacties', 
      description: 'Het totale aantal interacties met het help systeem.'
    },
    { 
      id: 'totalFeedback', 
      label: 'Totaal aantal feedback', 
      description: 'Het totale aantal feedback items ontvangen.'
    },
    { 
      id: 'feedbackSubmissionRate', 
      label: 'Feedback indieningspercentage', 
      description: 'Het percentage van interacties dat resulteert in feedback.'
    },
    { 
      id: 'positiveFeedbackRate', 
      label: 'Positieve feedback percentage', 
      description: 'Het percentage van feedback dat positief is.'
    },
    { 
      id: 'averageUserSatisfaction', 
      label: 'Gemiddelde gebruikerstevredenheid', 
      description: 'De gemiddelde tevredenheidsscore van gebruikers (1-5).'
    }
  ];
  
  // Beschikbare operators met labels
  const OPERATORS = [
    { id: 'gt', label: 'Groter dan (>)' },
    { id: 'lt', label: 'Kleiner dan (<)' },
    { id: 'eq', label: 'Gelijk aan (=)' },
    { id: 'gte', label: 'Groter dan of gelijk aan (>=)' },
    { id: 'lte', label: 'Kleiner dan of gelijk aan (<=)' }
  ];
  
  // Handler voor openen van threshold dialoog
  const handleOpenDialog = (threshold = null) => {
    if (threshold) {
      setEditingThreshold(threshold);
      setThresholdForm({
        metric: threshold.metric,
        operator: threshold.operator,
        value: threshold.value,
        message: threshold.message || ''
      });
    } else {
      setEditingThreshold(null);
      setThresholdForm({
        metric: 'totalInteractions',
        operator: 'gt',
        value: 100,
        message: ''
      });
    }
    
    setOpenDialog(true);
  };
  
  // Handler voor sluiten van threshold dialoog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handler voor wijzigen van threshold form
  const handleThresholdFormChange = (field, value) => {
    setThresholdForm({
      ...thresholdForm,
      [field]: value
    });
  };
  
  // Handler voor opslaan van threshold
  const handleSaveThreshold = () => {
    // Valideer form
    if (thresholdForm.value === '' || isNaN(Number(thresholdForm.value))) {
      return;
    }
    
    const threshold = {
      ...thresholdForm,
      value: Number(thresholdForm.value)
    };
    
    if (editingThreshold) {
      onUpdateThreshold(editingThreshold.id, threshold);
    } else {
      onAddThreshold(threshold);
    }
    
    handleCloseDialog();
  };
  
  // Handler voor verwijderen van threshold
  const handleRemoveThreshold = (thresholdId) => {
    onRemoveThreshold(thresholdId);
  };
  
  // Handler voor wijzigen van notificatie methoden
  const handleMethodChange = (method, enabled) => {
    onUpdateMethods({
      ...notificationSettings.notification_methods,
      [method]: enabled
    });
  };
  
  // Handler voor in-/uitschakelen van notificaties
  const handleToggleEnabled = () => {
    onToggleEnabled(!notificationSettings.enabled);
  };
  
  // Formatteert een threshold voor weergave
  const formatThreshold = (threshold) => {
    const metric = AVAILABLE_METRICS.find(m => m.id === threshold.metric);
    const operator = OPERATORS.find(o => o.id === threshold.operator);
    
    return `${metric ? metric.label : threshold.metric} ${operator ? operator.label.split(' ')[0] : threshold.operator} ${threshold.value}`;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notificatie Instellingen
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Stel notificaties in voor belangrijke metrics in het dashboard. Je kunt drempelwaarden instellen en kiezen hoe je gewaarschuwd wilt worden.
      </Typography>
      
      {/* Notificaties in-/uitschakelen */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {notificationSettings.enabled ? (
              <NotificationsIcon color="primary" sx={{ mr: 2 }} />
            ) : (
              <NotificationsOffIcon color="disabled" sx={{ mr: 2 }} />
            )}
            <Box>
              <Typography variant="subtitle1">
                Notificaties {notificationSettings.enabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notificationSettings.enabled 
                  ? 'Je ontvangt notificaties wanneer metrics drempelwaarden overschrijden.' 
                  : 'Je ontvangt geen notificaties.'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={notificationSettings.enabled}
            onChange={handleToggleEnabled}
            color="primary"
          />
        </Box>
      </Paper>
      
      {/* Notificatie methoden */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Notificatie Methoden
        </Typography>
        <FormControl component="fieldset">
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.notification_methods.in_app}
                  onChange={(e) => handleMethodChange('in_app', e.target.checked)}
                  disabled={!notificationSettings.enabled}
                />
              }
              label="In-app notificaties"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.notification_methods.email}
                  onChange={(e) => handleMethodChange('email', e.target.checked)}
                  disabled={!notificationSettings.enabled}
                />
              }
              label="E-mail notificaties"
            />
          </FormGroup>
        </FormControl>
      </Paper>
      
      {/* Drempelwaarden */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            Drempelwaarden
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!notificationSettings.enabled}
          >
            Nieuwe Drempelwaarde
          </Button>
        </Box>
        
        {notificationSettings.thresholds.length === 0 ? (
          <Alert severity="info">
            Je hebt nog geen drempelwaarden ingesteld. Klik op 'Nieuwe Drempelwaarde' om een drempelwaarde toe te voegen.
          </Alert>
        ) : (
          <List>
            {notificationSettings.thresholds.map((threshold, index) => (
              <React.Fragment key={threshold.id}>
                <ListItem>
                  <ListItemText
                    primary={formatThreshold(threshold)}
                    secondary={threshold.message || 'Geen bericht'}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Bewerken">
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpenDialog(threshold)}
                        disabled={!notificationSettings.enabled}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verwijderen">
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleRemoveThreshold(threshold.id)}
                        disabled={!notificationSettings.enabled}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < notificationSettings.thresholds.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Threshold dialoog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingThreshold ? 'Drempelwaarde Bewerken' : 'Nieuwe Drempelwaarde'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="metric-label">Metric</InputLabel>
                <Select
                  labelId="metric-label"
                  value={thresholdForm.metric}
                  onChange={(e) => handleThresholdFormChange('metric', e.target.value)}
                  label="Metric"
                >
                  {AVAILABLE_METRICS.map((metric) => (
                    <MenuItem key={metric.id} value={metric.id}>
                      <Box>
                        <Typography variant="body1">{metric.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="operator-label">Operator</InputLabel>
                <Select
                  labelId="operator-label"
                  value={thresholdForm.operator}
                  onChange={(e) => handleThresholdFormChange('operator', e.target.value)}
                  label="Operator"
                >
                  {OPERATORS.map((operator) => (
                    <MenuItem key={operator.id} value={operator.id}>
                      {operator.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Waarde"
                type="number"
                value={thresholdForm.value}
                onChange={(e) => handleThresholdFormChange('value', e.target.value)}
                fullWidth
                margin="normal"
                required
                error={thresholdForm.value === '' || isNaN(Number(thresholdForm.value))}
                helperText={thresholdForm.value === '' || isNaN(Number(thresholdForm.value)) ? 'Voer een geldige waarde in' : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Bericht (optioneel)"
                value={thresholdForm.message}
                onChange={(e) => handleThresholdFormChange('message', e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                placeholder="Aangepast bericht voor deze notificatie"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button 
            onClick={handleSaveThreshold} 
            variant="contained" 
            disabled={thresholdForm.value === '' || isNaN(Number(thresholdForm.value))}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

NotificationsTab.propTypes = {
  /**
   * De huidige notificatie instellingen
   */
  notificationSettings: PropTypes.shape({
    thresholds: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      metric: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      message: PropTypes.string
    })).isRequired,
    notification_methods: PropTypes.shape({
      in_app: PropTypes.bool.isRequired,
      email: PropTypes.bool.isRequired
    }).isRequired,
    enabled: PropTypes.bool.isRequired
  }).isRequired,
  
  /**
   * Functie voor het bijwerken van de notificatie instellingen
   */
  onUpdateSettings: PropTypes.func.isRequired,
  
  /**
   * Functie voor het toevoegen van een drempelwaarde
   */
  onAddThreshold: PropTypes.func.isRequired,
  
  /**
   * Functie voor het bijwerken van een drempelwaarde
   */
  onUpdateThreshold: PropTypes.func.isRequired,
  
  /**
   * Functie voor het verwijderen van een drempelwaarde
   */
  onRemoveThreshold: PropTypes.func.isRequired,
  
  /**
   * Functie voor het bijwerken van notificatie methoden
   */
  onUpdateMethods: PropTypes.func.isRequired,
  
  /**
   * Functie voor het in-/uitschakelen van notificaties
   */
  onToggleEnabled: PropTypes.func.isRequired
};

export default NotificationsTab;
