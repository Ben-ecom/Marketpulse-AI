import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

import RecommendationCard from './RecommendationCard';
import RecommendationDetail from './RecommendationDetail';
import RecommendationFilters from './RecommendationFilters';
import RecommendationTracker from './RecommendationTracker';

/**
 * Component voor het weergeven en beheren van een lijst met aanbevelingen
 */
const RecommendationsList = ({
  recommendations = [],
  loading = false,
  error = null,
  onRefresh,
  onRecommendationAction,
  onRecommendationUpdate
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State voor filters en sorteren
  const [filters, setFilters] = useState({
    categories: [],
    priorities: [],
    effortLevels: [],
    impactLevels: [],
    timeFrames: [],
    status: 'all',
    search: ''
  });
  
  const [sort, setSort] = useState({
    sortBy: 'priority',
    sortDirection: 'desc'
  });
  
  // State voor weergave
  const [viewMode, setViewMode] = useState('grid'); // 'grid' of 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 4 : 8);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Update itemsPerPage op basis van schermgrootte
  useEffect(() => {
    setItemsPerPage(isMobile ? 4 : 8);
  }, [isMobile]);
  
  // Filter en sorteer aanbevelingen
  const filteredRecommendations = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return [];
    
    // Filter functie
    const filterRecommendation = (rec) => {
      // Filter op categorieën
      if (filters.categories.length > 0 && !filters.categories.includes(rec.category)) {
        return false;
      }
      
      // Filter op prioriteiten
      if (filters.priorities.length > 0 && !filters.priorities.includes(rec.priority)) {
        return false;
      }
      
      // Filter op inspanningsniveaus
      if (filters.effortLevels.length > 0 && !filters.effortLevels.includes(rec.effortCategory)) {
        return false;
      }
      
      // Filter op impactniveaus
      if (filters.impactLevels.length > 0 && !filters.impactLevels.includes(rec.impactCategory)) {
        return false;
      }
      
      // Filter op tijdsbestek
      if (filters.timeFrames.length > 0 && !filters.timeFrames.includes(rec.implementationTime)) {
        return false;
      }
      
      // Filter op status
      if (filters.status !== 'all') {
        if (filters.status === 'completed' && !rec.completed) return false;
        if (filters.status === 'in_progress' && !rec.inProgress) return false;
        if (filters.status === 'pending' && (rec.completed || rec.inProgress)) return false;
        if (filters.status === 'scheduled' && !rec.dueDate) return false;
        if (filters.status === 'assigned' && !rec.assignee) return false;
      }
      
      // Filter op zoekterm
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = rec.title.toLowerCase().includes(searchLower);
        const descriptionMatch = rec.description.toLowerCase().includes(searchLower);
        const categoryMatch = rec.category && rec.category.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !descriptionMatch && !categoryMatch) {
          return false;
        }
      }
      
      return true;
    };
    
    // Sorteer functie
    const sortRecommendations = (a, b) => {
      const direction = sort.sortDirection === 'asc' ? 1 : -1;
      
      switch (sort.sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return direction * (priorityOrder[b.priority] - priorityOrder[a.priority]);
          
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return direction * (impactOrder[b.impactCategory] - impactOrder[a.impactCategory]);
          
        case 'effort':
          const effortOrder = { quick_win: 1, low: 2, medium: 3, high: 4 };
          return direction * (effortOrder[a.effortCategory] - effortOrder[b.effortCategory]);
          
        case 'date':
          return direction * (new Date(b.createdAt) - new Date(a.createdAt));
          
        case 'category':
          return direction * a.category.localeCompare(b.category);
          
        default:
          return 0;
      }
    };
    
    // Filter en sorteer
    return [...recommendations]
      .filter(filterRecommendation)
      .sort(sortRecommendations);
  }, [recommendations, filters, sort]);
  
  // Bereken paginering
  const paginatedRecommendations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecommendations.slice(startIndex, endIndex);
  }, [filteredRecommendations, currentPage, itemsPerPage]);
  
  // Bereken totaal aantal pagina's
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRecommendations.length / itemsPerPage);
  }, [filteredRecommendations, itemsPerPage]);
  
  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset naar eerste pagina bij filter wijziging
  };
  
  const handleSortChange = (newSort) => {
    setSort(newSort);
  };
  
  const handleResetFilters = () => {
    setFilters({
      categories: [],
      priorities: [],
      effortLevels: [],
      impactLevels: [],
      timeFrames: [],
      status: 'all',
      search: ''
    });
    setSort({
      sortBy: 'priority',
      sortDirection: 'desc'
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  const handleViewModeChange = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  const handleRecommendationClick = (recommendationId) => {
    const recommendation = recommendations.find(rec => rec.id === recommendationId);
    if (recommendation) {
      setSelectedRecommendation(recommendation);
      setDetailDialogOpen(true);
    }
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  const handleRecommendationComplete = (recommendationId, completed) => {
    if (onRecommendationUpdate) {
      onRecommendationUpdate(recommendationId, { completed });
    }
  };
  
  const handleRecommendationBookmark = (recommendationId, bookmarked) => {
    if (onRecommendationUpdate) {
      onRecommendationUpdate(recommendationId, { bookmarked });
    }
  };
  
  const handleRecommendationPriorityChange = (recommendationId, priority) => {
    if (onRecommendationUpdate) {
      onRecommendationUpdate(recommendationId, { priority });
    }
  };
  
  const handleStepComplete = (recommendationId, stepIndex, completed, completedSteps) => {
    if (onRecommendationUpdate) {
      onRecommendationUpdate(recommendationId, { completedSteps });
    }
  };
  
  const handleActionPerformed = (actionType, recommendationId, data) => {
    if (onRecommendationAction) {
      onRecommendationAction(actionType, recommendationId, data);
    }
    
    if (actionType === 'delete') {
      handleCloseDetailDialog();
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Aanbevelingen laden...
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  // Render empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Er zijn nog geen aanbevelingen beschikbaar.
        </Alert>
        
        {onRefresh && (
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Genereer aanbevelingen
          </Button>
        )}
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Marketing Aanbevelingen
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
            onClick={handleViewModeChange}
            sx={{ mr: 1 }}
          >
            {viewMode === 'grid' ? 'Lijst' : 'Grid'}
          </Button>
          
          {onRefresh && (
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Vernieuwen
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Tracker en filters */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <RecommendationTracker
            recommendations={recommendations}
            onViewDetails={handleRecommendationClick}
            onViewAll={(filterType) => {
              // Pas filters aan op basis van filterType
              if (filterType === 'highPriority') {
                handleFilterChange({
                  ...filters,
                  priorities: ['high'],
                  status: 'pending'
                });
              } else if (filterType === 'recent') {
                handleSortChange({
                  sortBy: 'date',
                  sortDirection: 'desc'
                });
                handleFilterChange({
                  ...filters,
                  status: 'all'
                });
              }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <RecommendationFilters
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSearch={(searchTerm) => handleFilterChange({ ...filters, search: searchTerm })}
            onReset={handleResetFilters}
          />
        </Grid>
      </Grid>
      
      {/* Resultaten */}
      <Box sx={{ mt: 3 }}>
        {/* Resultaat header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            {filteredRecommendations.length} aanbevelingen gevonden
          </Typography>
        </Box>
        
        {/* Geen resultaten */}
        {filteredRecommendations.length === 0 && (
          <Alert severity="info">
            Geen aanbevelingen gevonden die voldoen aan de filtervoorwaarden.
          </Alert>
        )}
        
        {/* Aanbevelingen grid/lijst */}
        <Grid container spacing={3}>
          {paginatedRecommendations.map((recommendation) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'grid' ? 6 : 12} 
              md={viewMode === 'grid' ? 4 : 12}
              lg={viewMode === 'grid' ? 3 : 12}
              key={recommendation.id}
            >
              <RecommendationCard
                recommendation={recommendation}
                onComplete={handleRecommendationComplete}
                onBookmark={handleRecommendationBookmark}
                onPriorityChange={handleRecommendationPriorityChange}
                showDetails={viewMode === 'list'}
                onClick={() => handleRecommendationClick(recommendation.id)}
              />
            </Grid>
          ))}
        </Grid>
        
        {/* Paginering */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary" 
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        )}
      </Box>
      
      {/* Detail dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedRecommendation && (
            <RecommendationDetail
              recommendation={selectedRecommendation}
              onStepComplete={handleStepComplete}
              onActionPerformed={handleActionPerformed}
              onBack={handleCloseDetailDialog}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ display: isMobile ? 'flex' : 'none' }}>
          <Button onClick={handleCloseDetailDialog}>Sluiten</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

RecommendationsList.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string,
      priority: PropTypes.oneOf(['high', 'medium', 'low']),
      impactCategory: PropTypes.oneOf(['high', 'medium', 'low']),
      effortCategory: PropTypes.oneOf(['high', 'medium', 'low', 'quick_win']),
      implementationTime: PropTypes.oneOf(['immediate', 'days', 'weeks', 'months', 'quarters']),
      steps: PropTypes.arrayOf(PropTypes.string),
      completedSteps: PropTypes.arrayOf(PropTypes.number),
      completed: PropTypes.bool,
      bookmarked: PropTypes.bool,
      assignee: PropTypes.string,
      dueDate: PropTypes.string,
      createdAt: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func,
  onRecommendationAction: PropTypes.func,
  onRecommendationUpdate: PropTypes.func
};

export default RecommendationsList;
