/**
 * AdvancedAnalytics.jsx
 * 
 * Component voor geavanceerde analyses in het Help Metrics Dashboard.
 * Biedt interactieve drill-down grafieken voor diepgaande analyse.
 */

import React, { useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { 
  BarChartOutlined, 
  FeedbackOutlined, 
  SentimentSatisfiedAltOutlined 
} from '@mui/icons-material';

import HelpMetricsService from '../../../services/help/HelpMetricsService';
import { useRealtime } from './RealtimeProvider';

// Lazy load DrillDownChart component
const DrillDownChart = React.lazy(() => import('./DrillDownChart'));

/**
 * TabPanel component voor het weergeven van tabinhoud
 */
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
};

/**
 * AdvancedAnalytics component
 */
const AdvancedAnalytics = ({ filters }) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    interactions: [],
    feedback: [],
    userExperience: []
  });
  
  // Haal realtime context op
  const { lastUpdate } = useRealtime();
  
  // Laad data bij initiële render en wanneer filters of lastUpdate veranderen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Haal data op voor de huidige tab
        const dataTypes = ['interactions', 'feedback', 'userExperience'];
        const activeType = dataTypes[value];
        
        if (!data[activeType] || data[activeType].length === 0) {
          const result = await HelpMetricsService.getHierarchicalData(activeType, filters);
          setData(prev => ({
            ...prev,
            [activeType]: result
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Fout bij het ophalen van geavanceerde analyses:', error);
        setError('Er is een fout opgetreden bij het laden van de gegevens.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, value, lastUpdate]);
  
  // Handler voor tab wissel
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  // Laad data voor de geselecteerde tab als deze nog niet geladen is
  useEffect(() => {
    const loadTabData = async () => {
      const dataTypes = ['interactions', 'feedback', 'userExperience'];
      const activeType = dataTypes[value];
      
      if (!data[activeType] || data[activeType].length === 0) {
        setLoading(true);
        try {
          const result = await HelpMetricsService.getHierarchicalData(activeType, filters);
          setData(prev => ({
            ...prev,
            [activeType]: result
          }));
          setLoading(false);
        } catch (error) {
          console.error(`Fout bij het laden van ${activeType} data:`, error);
          setError(`Er is een fout opgetreden bij het laden van de ${activeType} gegevens.`);
          setLoading(false);
        }
      }
    };
    
    loadTabData();
  }, [value, filters]);
  
  // Render error state
  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Geavanceerde Analyses
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Geavanceerde Analyses
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Klik op de grafiekelementen om dieper in de gegevens te duiken. Gebruik de tabbladen om tussen verschillende analyses te schakelen.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="analyse tabs"
          variant="fullWidth"
        >
          <Tab 
            label="Interacties" 
            icon={<BarChartOutlined />} 
            iconPosition="start" 
            {...a11yProps(0)} 
          />
          <Tab 
            label="Feedback" 
            icon={<FeedbackOutlined />} 
            iconPosition="start" 
            {...a11yProps(1)} 
          />
          <Tab 
            label="Gebruikerservaring" 
            icon={<SentimentSatisfiedAltOutlined />} 
            iconPosition="start" 
            {...a11yProps(2)} 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
          <DrillDownChart 
            data={data.interactions} 
            loading={loading && value === 0} 
            title="Interacties per Type"
            type="bar"
          />
        </Suspense>
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
          <DrillDownChart 
            data={data.feedback} 
            loading={loading && value === 1} 
            title="Feedback per Help Item"
            type="pie"
          />
        </Suspense>
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
          <DrillDownChart 
            data={data.userExperience} 
            loading={loading && value === 2} 
            title="Gebruikerservaring per Pagina"
            type="bar"
          />
        </Suspense>
      </TabPanel>
    </Paper>
  );
};

AdvancedAnalytics.propTypes = {
  /**
   * Filters voor de data (dateRange, userRoles, experienceLevels)
   */
  filters: PropTypes.shape({
    dateRange: PropTypes.shape({
      start: PropTypes.instanceOf(Date),
      end: PropTypes.instanceOf(Date)
    }),
    userRoles: PropTypes.arrayOf(PropTypes.string),
    experienceLevels: PropTypes.arrayOf(PropTypes.string)
  })
};

export default AdvancedAnalytics;
