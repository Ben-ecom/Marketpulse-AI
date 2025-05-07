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
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabaseClient';
import { edgeFunctionsService } from '../../services/EdgeFunctionsService';
import AwarenessDashboard from '../awareness/AwarenessDashboard';
import DecodoScheduler from './DecodoScheduler';
import DecodoInsightsDashboard from './DecodoInsightsDashboard';
import ExportButton from '../export/ExportButton';
import ContextualTooltip from '../help/ContextualTooltip';
import '../../styles/decodoResultsDashboard.css';

/**
 * DecodoResultsDashboard Component
 * Visualiseert de scraping resultaten van de Decodo API en biedt opties voor het genereren van aanbevelingen
 */
const DecodoResultsDashboard = ({ 
  projectId, 
  projectName,
  onRefresh = null
}) => {
  // State voor het dashboard
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapingResults, setScrapingResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    platform: 'all',
    contentType: 'all',
    dateRange: 'all',
    keyword: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedResult, setSelectedResult] = useState(null);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [awarenessData, setAwarenessData] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [scheduledJobs, setScheduledJobs] = useState([]);

  // Laad scraping resultaten wanneer het component wordt geladen of wanneer projectId verandert
  useEffect(() => {
    if (projectId) {
      fetchScrapingResults();
      fetchProjectDetails();
      fetchRecommendations();
    }
  }, [projectId]);

  // Haal projectdetails op
  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      setProjectDetails(data);
    } catch (error) {
      console.error('Fout bij het ophalen van projectdetails:', error);
      setError('Fout bij het ophalen van projectdetails. Probeer het later opnieuw.');
    }
  };

  // Haal scraping resultaten op uit de database
  const fetchScrapingResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Haal scraping resultaten op
      const { data, error } = await supabase
        .from('scrape_results')
        .select(`
          id,
          platform,
          content_type,
          raw_data,
          processed_data,
          sentiment,
          created_at,
          scrape_jobs!inner(project_id)
        `)
        .eq('scrape_jobs.project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setScrapingResults(data || []);

      // Extraheer unieke platforms en content types
      if (data && data.length > 0) {
        const uniquePlatforms = [...new Set(data.map(item => item.platform || 'unknown'))];
        setPlatforms(['all', ...uniquePlatforms]);

        const uniqueContentTypes = [...new Set(data.map(item => item.content_type || 'unknown'))];
        setContentTypes(['all', ...uniqueContentTypes]);
      }

      // Haal aanbevelingen op
      fetchRecommendations();
    } catch (error) {
      console.error('Fout bij het ophalen van scraping resultaten:', error);
      setError('Fout bij het ophalen van scraping resultaten. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  // Haal aanbevelingen op uit de database
  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRecommendations(data || []);

      // Verwerk data voor de AwarenessDashboard
      const awarenessRecs = data?.filter(rec => rec.platform === 'awareness') || [];
      
      // Transformeer de data naar het formaat dat AwarenessDashboard verwacht
      const transformedData = awarenessRecs.map(rec => ({
        id: rec.id,
        platform: 'awareness',
        phase: rec.phase,
        title: rec.title,
        description: rec.description,
        strategy_text: rec.strategy_text,
        priority: rec.priority,
        implementation_steps: rec.implementation_steps,
        status: rec.status,
        created_at: rec.created_at
      }));

      setAwarenessData(transformedData);
    } catch (error) {
      console.error('Fout bij het ophalen van aanbevelingen:', error);
    }
  };

  // Filter de scraping resultaten op basis van de geselecteerde filters
  const getFilteredResults = () => {
    return scrapingResults.filter(result => {
      // Filter op platform
      if (filters.platform !== 'all' && result.platform !== filters.platform) {
        return false;
      }

      // Filter op content type
      if (filters.contentType !== 'all' && result.content_type !== filters.contentType) {
        return false;
      }

      // Filter op keyword (zoek in de raw_data als JSON string)
      if (filters.keyword && !JSON.stringify(result.raw_data).toLowerCase().includes(filters.keyword.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  // Genereer aanbevelingen op basis van de scraping resultaten
  const generateRecommendations = async () => {
    setGeneratingRecommendations(true);
    setError(null);

    try {
      const result = await edgeFunctionsService.generateRecommendations(projectId);
      
      // Vernieuw de aanbevelingen
      fetchRecommendations();
      
      // Ga naar de aanbevelingen tab
      setActiveTab(1);
    } catch (error) {
      console.error('Fout bij het genereren van aanbevelingen:', error);
      setError('Fout bij het genereren van aanbevelingen. Probeer het later opnieuw.');
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  // Genereer awareness fase aanbevelingen
  const generateAwarenessRecommendations = async () => {
    setGeneratingRecommendations(true);
    setError(null);

    try {
      const result = await edgeFunctionsService.generateAwarenessRecommendations(projectId);
      
      // Vernieuw de aanbevelingen
      fetchRecommendations();
      
      // Ga naar de awareness tab
      setActiveTab(2);
    } catch (error) {
      console.error('Fout bij het genereren van awareness aanbevelingen:', error);
      setError('Fout bij het genereren van awareness aanbevelingen. Probeer het later opnieuw.');
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  // Handle result selection
  const handleResultSelect = (result) => {
    setSelectedResult(result === selectedResult ? null : result);
  };

  // Get filtered and paginated results
  const filteredResults = getFilteredResults();
  const paginatedResults = filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box className="decodo-results-dashboard">
      <Box className="dashboard-header">
        <Typography variant="h5" component="h1" gutterBottom>
          {projectName || 'Decodo Resultaten Dashboard'}
        </Typography>
        
        <Box className="dashboard-actions">
          <Tooltip title="Vernieuw data">
            <IconButton 
              onClick={fetchScrapingResults} 
              disabled={isLoading}
              className="action-button"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toon/verberg filters">
            <IconButton 
              onClick={() => setShowFilters(!showFilters)} 
              className="action-button"
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <ExportButton 
            data={filteredResults} 
            filename={`decodo-results-${projectName || 'export'}`} 
            label="Exporteer"
          />
        </Box>
      </Box>

      {showFilters && (
        <Paper className="filters-container" elevation={1}>
          <Typography variant="subtitle2" gutterBottom>
            Filters
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Platform"
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                fullWidth
                SelectProps={{
                  native: true
                }}
                size="small"
              >
                {platforms.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Alle platforms' : option}
                  </option>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Content Type"
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                fullWidth
                SelectProps={{
                  native: true
                }}
                size="small"
              >
                {contentTypes.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Alle content types' : option}
                  </option>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Zoekterm"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <SearchIcon color="action" fontSize="small" />
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                onClick={() => setFilters({
                  platform: 'all',
                  contentType: 'all',
                  dateRange: 'all',
                  keyword: ''
                })}
                fullWidth
                size="small"
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}

      <Box className="dashboard-tabs">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          className="dashboard-tabs"
        >
          <Tab 
            label="Scraping Resultaten" 
            icon={<StorageIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Aanbevelingen" 
            icon={<LightbulbIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Awareness Fasen" 
            icon={<AssignmentIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Periodieke Scraping" 
            icon={<ScheduleIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Inzichten" 
            icon={<TimelineIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Data laden...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Scraping Resultaten Tab */}
          {activeTab === 0 && (
            <Box className="tab-content">
              <Box className="tab-header">
                <Typography variant="h6" component="h2">
                  Scraping Resultaten
                </Typography>
                
                <Box className="tab-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LightbulbIcon />}
                    onClick={generateRecommendations}
                    disabled={generatingRecommendations || scrapingResults.length === 0}
                  >
                    {generatingRecommendations ? 'Bezig...' : 'Genereer Aanbevelingen'}
                  </Button>
                </Box>
              </Box>

              {scrapingResults.length === 0 ? (
                <Card className="empty-state">
                  <CardContent>
                    <Box textAlign="center" py={5}>
                      <StorageIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Geen scraping resultaten gevonden
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Gebruik de Decodo Tester om data te verzamelen
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        href="/admin/decodo-tester"
                        sx={{ mt: 2 }}
                      >
                        Ga naar Decodo Tester
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <TableContainer component={Paper} className="results-table">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Platform</TableCell>
                          <TableCell>Content Type</TableCell>
                          <TableCell>URL</TableCell>
                          <TableCell>Datum</TableCell>
                          <TableCell>Acties</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedResults.map((result) => (
                          <React.Fragment key={result.id}>
                            <TableRow 
                              hover
                              onClick={() => handleResultSelect(result)}
                              className={selectedResult === result ? 'selected-row' : ''}
                            >
                              <TableCell>
                                <Chip 
                                  label={result.platform} 
                                  size="small" 
                                  className={`platform-chip platform-${result.platform}`}
                                />
                              </TableCell>
                              <TableCell>{result.content_type}</TableCell>
                              <TableCell>
                                {result.raw_data?.url ? (
                                  <Tooltip title={result.raw_data.url}>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                                      {result.raw_data.url}
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Geen URL
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>{formatDate(result.created_at)}</TableCell>
                              <TableCell>
                                <Tooltip title="Bekijk details">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResultSelect(result);
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            
                            {selectedResult === result && (
                              <TableRow className="details-row">
                                <TableCell colSpan={5}>
                                  <Box className="result-details">
                                    <Typography variant="subtitle2" gutterBottom>
                                      Data Preview
                                    </Typography>
                                    <pre className="json-preview">
                                      {JSON.stringify(result.raw_data, null, 2)}
                                    </pre>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={filteredResults.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Rijen per pagina:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
                  />
                </>
              )}
            </Box>
          )}
          
          {/* Aanbevelingen Tab */}
          {activeTab === 1 && (
            <Box className="tab-content">
              <Box className="tab-header">
                <Typography variant="h6" component="h2">
                  Aanbevelingen
                </Typography>
                
                <Box className="tab-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AssignmentIcon />}
                    onClick={generateAwarenessRecommendations}
                    disabled={generatingRecommendations}
                  >
                    {generatingRecommendations ? 'Bezig...' : 'Genereer Awareness Aanbevelingen'}
                  </Button>
                </Box>
              </Box>

              {recommendations.length === 0 ? (
                <Card className="empty-state">
                  <CardContent>
                    <Box textAlign="center" py={5}>
                      <LightbulbIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Geen aanbevelingen gevonden
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Genereer aanbevelingen op basis van de scraping resultaten
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={generateRecommendations}
                        disabled={generatingRecommendations || scrapingResults.length === 0}
                        sx={{ mt: 2 }}
                      >
                        {generatingRecommendations ? 'Bezig...' : 'Genereer Aanbevelingen'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {recommendations
                    .filter(rec => rec.platform !== 'awareness')
                    .map((recommendation) => (
                      <Grid item xs={12} md={6} key={recommendation.id}>
                        <Card className="recommendation-card">
                          <CardHeader
                            title={recommendation.title}
                            subheader={
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Chip 
                                  label={recommendation.platform} 
                                  size="small" 
                                  className={`platform-chip platform-${recommendation.platform}`}
                                />
                                <Chip 
                                  label={recommendation.priority} 
                                  size="small" 
                                  color={
                                    recommendation.priority === 'high' ? 'error' : 
                                    recommendation.priority === 'medium' ? 'warning' : 'info'
                                  }
                                  variant="outlined"
                                />
                              </Box>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Typography variant="body2" paragraph>
                              {recommendation.description}
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Strategie
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {recommendation.strategy_text}
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Implementatie Stappen
                            </Typography>
                            <ol className="implementation-steps">
                              {recommendation.implementation_steps?.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Awareness Fasen Tab */}
          {activeTab === 2 && (
            <Box className="tab-content">
              {awarenessData.length === 0 ? (
                <Card className="empty-state">
                  <CardContent>
                    <Box textAlign="center" py={5}>
                      <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Geen awareness fase aanbevelingen gevonden
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Genereer awareness fase aanbevelingen
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={generateAwarenessRecommendations}
                        disabled={generatingRecommendations}
                        sx={{ mt: 2 }}
                      >
                        {generatingRecommendations ? 'Bezig...' : 'Genereer Awareness Aanbevelingen'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <AwarenessDashboard 
                  data={awarenessData}
                  projectName={projectName}
                  isLoading={isLoading}
                  error={error}
                  productName={projectDetails?.name || ''}
                  industrie={projectDetails?.niche || ''}
                  onRefresh={fetchScrapingResults}
                />
              )}
            </Box>
          )}
          
          {/* Periodieke Scraping Tab */}
          {activeTab === 3 && (
            <Box className="tab-content">
              <DecodoScheduler projectId={projectId} />
            </Box>
          )}
          
          {/* Inzichten Tab */}
          {activeTab === 4 && (
            <Box className="tab-content">
              <DecodoInsightsDashboard 
                projectId={projectId} 
                projectName={projectName} 
                onRefresh={fetchScrapingResults} 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

DecodoResultsDashboard.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectName: PropTypes.string,
  onRefresh: PropTypes.func
};

export default DecodoResultsDashboard;
