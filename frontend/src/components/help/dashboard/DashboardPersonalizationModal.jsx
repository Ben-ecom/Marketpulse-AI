/**
 * DashboardPersonalizationModal.jsx
 * 
 * Modale dialoog voor het personaliseren van het Help Metrics Dashboard.
 * Biedt opties voor het configureren van widgets, filters en uiterlijk.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WidgetsIcon from '@mui/icons-material/Widgets';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useDashboardPersonalization } from './DashboardPersonalizationProvider';

// Tab panels
import WidgetConfigTab from './personalization/WidgetConfigTab';
import FilterConfigTab from './personalization/FilterConfigTab';
import AppearanceConfigTab from './personalization/AppearanceConfigTab';
import NotificationsTab from './personalization/NotificationsTab';

// Notification context
import { useNotifications } from '../../../contexts/NotificationContext';

/**
 * TabPanel component voor het weergeven van tabinhoud
 */
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`personalization-tabpanel-${index}`}
      aria-labelledby={`personalization-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

/**
 * Helper functie voor toegankelijkheidsattributen
 */
const a11yProps = (index) => {
  return {
    id: `personalization-tab-${index}`,
    'aria-controls': `personalization-tabpanel-${index}`,
  };
};

/**
 * DashboardPersonalizationModal component
 * @component
 */
const DashboardPersonalizationModal = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    preferences, 
    isLoading, 
    error,
    updateWidgetConfiguration,
    updateLayout,
    updateTheme,
    updateRealtimeSetting,
    saveFilterConfiguration,
    deleteFilterConfiguration,
    setDefaultFilter,
    resetToDefaults
  } = useDashboardPersonalization();
  
  // Notification context
  const {
    notificationSettings,
    addThreshold,
    updateThreshold,
    removeThreshold,
    updateNotificationMethods,
    toggleNotificationsEnabled
  } = useNotifications();
  
  // State voor het bijhouden van wijzigingen
  const [widgetConfig, setWidgetConfig] = useState({
    visibleWidgets: [],
    widgetOrder: []
  });
  const [appearanceConfig, setAppearanceConfig] = useState({
    layout: 'default',
    theme: 'system',
    realtimeEnabled: false
  });
  
  // Initialiseer state met huidige voorkeuren wanneer de modal wordt geopend
  React.useEffect(() => {
    if (preferences && open) {
      setWidgetConfig({
        visibleWidgets: [...preferences.visible_widgets],
        widgetOrder: [...preferences.widget_order]
      });
      
      setAppearanceConfig({
        layout: preferences.layout,
        theme: preferences.theme,
        realtimeEnabled: preferences.realtime_enabled
      });
    }
  }, [preferences, open]);
  
  // Handler voor tab wissel
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handler voor opslaan van wijzigingen
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update widget configuratie
      await updateWidgetConfiguration(
        widgetConfig.visibleWidgets,
        widgetConfig.widgetOrder
      );
      
      // Update uiterlijk configuratie
      await updateLayout(appearanceConfig.layout);
      await updateTheme(appearanceConfig.theme);
      await updateRealtimeSetting(appearanceConfig.realtimeEnabled);
      
      // Sluit de modal
      onClose();
    } catch (error) {
      console.error('Error saving dashboard personalization:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler voor annuleren
  const handleCancel = () => {
    onClose();
  };
  
  // Handler voor resetten naar standaardwaarden
  const handleReset = async () => {
    setIsSaving(true);
    
    try {
      await resetToDefaults();
      onClose();
    } catch (error) {
      console.error('Error resetting dashboard personalization:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Dashboard Personalisatie
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Dashboard Personalisatie
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '300px' }}>
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Sluiten</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Dashboard Personalisatie
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="personalization tabs"
        >
          <Tab icon={<WidgetsIcon />} label="Widgets" {...a11yProps(0)} />
          <Tab icon={<FilterListIcon />} label="Filters" {...a11yProps(1)} />
          <Tab icon={<PaletteIcon />} label="Uiterlijk" {...a11yProps(2)} />
          <Tab icon={<NotificationsIcon />} label="Notificaties" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      <DialogContent dividers sx={{ minHeight: '400px' }}>
        <TabPanel value={tabValue} index={0}>
          <WidgetConfigTab 
            widgetConfig={widgetConfig} 
            setWidgetConfig={setWidgetConfig} 
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <FilterConfigTab 
            savedFilters={preferences?.saved_filters || []}
            defaultFilter={preferences?.default_filter}
            onSaveFilter={saveFilterConfiguration}
            onDeleteFilter={deleteFilterConfiguration}
            onSetDefaultFilter={setDefaultFilter}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <AppearanceConfigTab 
            appearanceConfig={appearanceConfig} 
            setAppearanceConfig={setAppearanceConfig} 
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <NotificationsTab 
            notificationSettings={notificationSettings}
            onUpdateSettings={() => {}}
            onAddThreshold={addThreshold}
            onUpdateThreshold={updateThreshold}
            onRemoveThreshold={removeThreshold}
            onUpdateMethods={updateNotificationMethods}
            onToggleEnabled={toggleNotificationsEnabled}
          />
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleReset} 
          color="error"
          disabled={isSaving}
        >
          Standaardwaarden
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          onClick={handleCancel} 
          disabled={isSaving}
        >
          Annuleren
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DashboardPersonalizationModal.propTypes = {
  /**
   * Of de modal open is
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback voor het sluiten van de modal
   */
  onClose: PropTypes.func.isRequired
};

export default DashboardPersonalizationModal;