import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Constanten voor filter- en sorteeropties
const CATEGORIES = [
  { value: 'all', label: 'Alle categorieën' },
  { value: 'content', label: 'Content' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'product', label: 'Product' },
  { value: 'pricing', label: 'Prijsstrategie' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'strategic', label: 'Strategisch' }
];

const PRIORITIES = [
  { value: 'high', label: 'Hoog' },
  { value: 'medium', label: 'Gemiddeld' },
  { value: 'low', label: 'Laag' }
];

const EFFORT_LEVELS = [
  { value: 'quick_win', label: 'Quick Win' },
  { value: 'low', label: 'Laag' },
  { value: 'medium', label: 'Gemiddeld' },
  { value: 'high', label: 'Hoog' }
];

const IMPACT_LEVELS = [
  { value: 'high', label: 'Hoog' },
  { value: 'medium', label: 'Gemiddeld' },
  { value: 'low', label: 'Laag' }
];

const TIME_FRAMES = [
  { value: 'immediate', label: 'Direct' },
  { value: 'days', label: 'Dagen' },
  { value: 'weeks', label: 'Weken' },
  { value: 'months', label: 'Maanden' },
  { value: 'quarters', label: 'Kwartalen' }
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Prioriteit' },
  { value: 'impact', label: 'Impact' },
  { value: 'effort', label: 'Inspanning' },
  { value: 'date', label: 'Datum' },
  { value: 'category', label: 'Categorie' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle statussen' },
  { value: 'completed', label: 'Voltooid' },
  { value: 'in_progress', label: 'In uitvoering' },
  { value: 'pending', label: 'Nog te starten' },
  { value: 'scheduled', label: 'Gepland' },
  { value: 'assigned', label: 'Toegewezen' }
];

/**
 * Component voor het filteren en sorteren van aanbevelingen
 */
const RecommendationFilters = ({
  onFilterChange,
  onSortChange,
  onSearch,
  onReset
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State voor filters
  const [filters, setFilters] = useState({
    categories: [],
    priorities: [],
    effortLevels: [],
    impactLevels: [],
    timeFrames: [],
    status: 'all',
    search: ''
  });
  
  // State voor sorteren
  const [sortBy, setSortBy] = useState('priority');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State voor uitklappen van filters
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);
  
  // Handler voor filter wijzigingen
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  // Handler voor multi-select filters
  const handleMultiSelectChange = (filterType, event) => {
    const value = event.target.value;
    handleFilterChange(filterType, typeof value === 'string' ? value.split(',') : value);
  };
  
  // Handler voor sorteren
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    
    if (onSortChange) {
      onSortChange({ sortBy: event.target.value, sortDirection });
    }
  };
  
  // Handler voor sorteerrichting
  const handleSortDirectionChange = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    if (onSortChange) {
      onSortChange({ sortBy, sortDirection: newDirection });
    }
  };
  
  // Handler voor zoeken
  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setFilters({ ...filters, search: searchValue });
    
    if (onSearch) {
      onSearch(searchValue);
    }
  };
  
  // Handler voor filters resetten
  const handleResetFilters = () => {
    const resetFilters = {
      categories: [],
      priorities: [],
      effortLevels: [],
      impactLevels: [],
      timeFrames: [],
      status: 'all',
      search: ''
    };
    
    setFilters(resetFilters);
    setSortBy('priority');
    setSortDirection('desc');
    
    if (onReset) {
      onReset();
    }
  };
  
  // Functie om geselecteerde filters weer te geven
  const renderSelectedFilters = () => {
    const selectedFilters = [];
    
    // Voeg categorieën toe
    filters.categories.forEach(category => {
      const categoryObj = CATEGORIES.find(c => c.value === category);
      if (categoryObj) {
        selectedFilters.push({
          key: `category-${category}`,
          label: categoryObj.label,
          onDelete: () => {
            handleFilterChange('categories', filters.categories.filter(c => c !== category));
          }
        });
      }
    });
    
    // Voeg prioriteiten toe
    filters.priorities.forEach(priority => {
      const priorityObj = PRIORITIES.find(p => p.value === priority);
      if (priorityObj) {
        selectedFilters.push({
          key: `priority-${priority}`,
          label: `Prioriteit: ${priorityObj.label}`,
          onDelete: () => {
            handleFilterChange('priorities', filters.priorities.filter(p => p !== priority));
          }
        });
      }
    });
    
    // Voeg inspanningsniveaus toe
    filters.effortLevels.forEach(effort => {
      const effortObj = EFFORT_LEVELS.find(e => e.value === effort);
      if (effortObj) {
        selectedFilters.push({
          key: `effort-${effort}`,
          label: `Inspanning: ${effortObj.label}`,
          onDelete: () => {
            handleFilterChange('effortLevels', filters.effortLevels.filter(e => e !== effort));
          }
        });
      }
    });
    
    // Voeg impactniveaus toe
    filters.impactLevels.forEach(impact => {
      const impactObj = IMPACT_LEVELS.find(i => i.value === impact);
      if (impactObj) {
        selectedFilters.push({
          key: `impact-${impact}`,
          label: `Impact: ${impactObj.label}`,
          onDelete: () => {
            handleFilterChange('impactLevels', filters.impactLevels.filter(i => i !== impact));
          }
        });
      }
    });
    
    // Voeg tijdsperiodes toe
    filters.timeFrames.forEach(timeFrame => {
      const timeFrameObj = TIME_FRAMES.find(t => t.value === timeFrame);
      if (timeFrameObj) {
        selectedFilters.push({
          key: `timeFrame-${timeFrame}`,
          label: `Tijdsbestek: ${timeFrameObj.label}`,
          onDelete: () => {
            handleFilterChange('timeFrames', filters.timeFrames.filter(t => t !== timeFrame));
          }
        });
      }
    });
    
    // Voeg status toe als het niet 'all' is
    if (filters.status !== 'all') {
      const statusObj = STATUS_OPTIONS.find(s => s.value === filters.status);
      if (statusObj) {
        selectedFilters.push({
          key: `status-${filters.status}`,
          label: `Status: ${statusObj.label}`,
          onDelete: () => {
            handleFilterChange('status', 'all');
          }
        });
      }
    }
    
    if (selectedFilters.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {selectedFilters.map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            onDelete={filter.onDelete}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
        
        {selectedFilters.length > 0 && (
          <Chip
            label="Alles wissen"
            onDelete={handleResetFilters}
            deleteIcon={<ClearIcon />}
            size="small"
            color="default"
          />
        )}
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Header met titel en uitklap-knop */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Aanbevelingen filteren
        </Typography>
        
        <Box>
          <Tooltip title={filtersExpanded ? "Filters inklappen" : "Filters uitklappen"}>
            <IconButton onClick={() => setFiltersExpanded(!filtersExpanded)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filters resetten">
            <IconButton onClick={handleResetFilters}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Zoekbalk - altijd zichtbaar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Zoek in aanbevelingen..."
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: filters.search ? (
              <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }}
          size="small"
        />
      </Box>
      
      {/* Uitklapbare filters */}
      {filtersExpanded && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {/* Categorieën */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="categories-label">Categorieën</InputLabel>
                <Select
                  labelId="categories-label"
                  id="categories"
                  multiple
                  value={filters.categories}
                  onChange={(e) => handleMultiSelectChange('categories', e)}
                  input={<OutlinedInput label="Categorieën" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const category = CATEGORIES.find(c => c.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={category ? category.label : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {CATEGORIES.filter(c => c.value !== 'all').map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Checkbox checked={filters.categories.indexOf(category.value) > -1} />
                      <ListItemText primary={category.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Prioriteiten */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="priorities-label">Prioriteit</InputLabel>
                <Select
                  labelId="priorities-label"
                  id="priorities"
                  multiple
                  value={filters.priorities}
                  onChange={(e) => handleMultiSelectChange('priorities', e)}
                  input={<OutlinedInput label="Prioriteit" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const priority = PRIORITIES.find(p => p.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={priority ? priority.label : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {PRIORITIES.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Checkbox checked={filters.priorities.indexOf(priority.value) > -1} />
                      <ListItemText primary={priority.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Status */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Inspanning */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="effort-label">Inspanning</InputLabel>
                <Select
                  labelId="effort-label"
                  id="effort"
                  multiple
                  value={filters.effortLevels}
                  onChange={(e) => handleMultiSelectChange('effortLevels', e)}
                  input={<OutlinedInput label="Inspanning" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const effort = EFFORT_LEVELS.find(e => e.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={effort ? effort.label : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {EFFORT_LEVELS.map((effort) => (
                    <MenuItem key={effort.value} value={effort.value}>
                      <Checkbox checked={filters.effortLevels.indexOf(effort.value) > -1} />
                      <ListItemText primary={effort.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Impact */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="impact-label">Impact</InputLabel>
                <Select
                  labelId="impact-label"
                  id="impact"
                  multiple
                  value={filters.impactLevels}
                  onChange={(e) => handleMultiSelectChange('impactLevels', e)}
                  input={<OutlinedInput label="Impact" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const impact = IMPACT_LEVELS.find(i => i.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={impact ? impact.label : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {IMPACT_LEVELS.map((impact) => (
                    <MenuItem key={impact.value} value={impact.value}>
                      <Checkbox checked={filters.impactLevels.indexOf(impact.value) > -1} />
                      <ListItemText primary={impact.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Tijdsbestek */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="timeframe-label">Tijdsbestek</InputLabel>
                <Select
                  labelId="timeframe-label"
                  id="timeframe"
                  multiple
                  value={filters.timeFrames}
                  onChange={(e) => handleMultiSelectChange('timeFrames', e)}
                  input={<OutlinedInput label="Tijdsbestek" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const timeFrame = TIME_FRAMES.find(t => t.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={timeFrame ? timeFrame.label : value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {TIME_FRAMES.map((timeFrame) => (
                    <MenuItem key={timeFrame.value} value={timeFrame.value}>
                      <Checkbox checked={filters.timeFrames.indexOf(timeFrame.value) > -1} />
                      <ListItemText primary={timeFrame.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Sorteren */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="sort-label">Sorteren op</InputLabel>
                  <Select
                    labelId="sort-label"
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sorteren op"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Tooltip title={sortDirection === 'asc' ? "Oplopend" : "Aflopend"}>
                  <IconButton onClick={handleSortDirectionChange}>
                    <SortIcon 
                      sx={{ 
                        transform: sortDirection === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: theme.transitions.create('transform')
                      }} 
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Geselecteerde filters */}
      {renderSelectedFilters()}
    </Paper>
  );
};

RecommendationFilters.propTypes = {
  onFilterChange: PropTypes.func,
  onSortChange: PropTypes.func,
  onSearch: PropTypes.func,
  onReset: PropTypes.func
};

export default RecommendationFilters;
