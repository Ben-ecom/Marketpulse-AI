import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, Grid, CircularProgress, useTheme } from '@mui/material';
import { fetchFeedbackSummary, fetchFeedbackTrends, fetchFeedbackByPage, fetchFeedbackByUser, fetchFeedbackDetails } from '../../services/analytics/analyticsService';
import FeedbackOverview from './FeedbackOverview';
import FeedbackTrends from './FeedbackTrends';
import FeedbackByPage from './FeedbackByPage';
import FeedbackByUserType from './FeedbackByUserType';
import FeedbackDetails from './FeedbackDetails';
import FeedbackExport from './FeedbackExport';
import FeedbackFilters from './FeedbackFilters';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

/**
 * Feedback Analytics Dashboard Component
 * 
 * Een dashboard voor het analyseren van gebruikersfeedback over de help-functionaliteit.
 * Toont statistieken, trends, en gedetailleerde feedback data.
 */
const FeedbackAnalyticsDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    pages: [],
    userRoles: [],
    experienceLevels: [],
    feedbackTypes: ['positive', 'negative']
  });

  // Laad data wanneer tab of filters veranderen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Haal data op gebaseerd op actieve tab en filters
        switch (activeTab) {
          case 0:
            const summary = await fetchFeedbackSummary(filters);
            setSummaryData(summary);
            break;
          case 1:
            const trends = await fetchFeedbackTrends(filters);
            setTrendsData(trends);
            break;
          case 2:
            const pageData = await fetchFeedbackByPage(filters);
            setPageData(pageData);
            break;
          case 3:
            const userData = await fetchFeedbackByUser(filters);
            setUserData(userData);
            break;
          case 4:
            const detailsData = await fetchFeedbackDetails(filters, pagination);
            setDetailsData(detailsData);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, filters, pagination]);

  // Verander actieve tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Update filters
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    // Reset paginatie bij filter wijziging
    if (activeTab === 4) {
      setPagination({ ...pagination, page: 1 });
    }
  };

  // Update paginatie
  const handlePaginationChange = (newPagination) => {
    setPagination({ ...pagination, ...newPagination });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Grid container alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h4" component="h1">
              Feedback Analytics Dashboard
            </Typography>
          </Grid>
          <Grid item>
            <ContextualTooltip
              content="Dit dashboard toont analyses van gebruikersfeedback over de help-functionaliteit. Gebruik het om inzicht te krijgen in hoe gebruikers de help-functionaliteit ervaren en waar verbeteringen mogelijk zijn."
              placement="right"
            >
              <HelpOutline fontSize="small" color="primary" />
            </ContextualTooltip>
          </Grid>
        </Grid>

        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="feedback analytics tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="Overzicht" 
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab 
                label="Trends" 
                id="tab-1"
                aria-controls="tabpanel-1"
              />
              <Tab 
                label="Per Pagina" 
                id="tab-2"
                aria-controls="tabpanel-2"
              />
              <Tab 
                label="Per Gebruiker" 
                id="tab-3"
                aria-controls="tabpanel-3"
              />
              <Tab 
                label="Details" 
                id="tab-4"
                aria-controls="tabpanel-4"
              />
              <Tab 
                label="Exporteren" 
                id="tab-5"
                aria-controls="tabpanel-5"
              />
            </Tabs>
          </Box>
        </Paper>

        <FeedbackFilters filters={filters} onFilterChange={handleFilterChange} />
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <FeedbackOverview data={summaryData} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <FeedbackTrends data={trendsData} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <FeedbackByPage data={pageData} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <FeedbackByUserType data={userData} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <FeedbackDetails 
                data={detailsData} 
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <FeedbackExport filters={filters} />
            </TabPanel>
          </Box>
        )}
      </Box>
    </Container>
  );
};

// TabPanel component voor het tonen van tab inhoud
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

export default FeedbackAnalyticsDashboard;