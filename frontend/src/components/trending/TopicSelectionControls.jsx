import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
  Chip, OutlinedInput, Checkbox, ListItemText, Button, IconButton,
  Tooltip, Divider, useTheme, alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

/**
 * Component voor het selecteren en filteren van topics voor visualisatie
 */
const TopicSelectionControls = ({
  availableTopics = [],
  selectedTopics = [],
  topicColors = {},
  maxSelections = 10,
  onSelectionChange,
  onSortChange,
  onRefresh
}) => {
  const theme = useTheme();
  
  // State voor topic selectie
  const [selection, setSelection] = useState(selectedTopics);
  
  // State voor sortering
  const [sortBy, setSortBy] = useState('frequency');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State voor filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Update selection wanneer selectedTopics verandert
  useEffect(() => {
    setSelection(selectedTopics);
  }, [selectedTopics]);
  
  // Sorteer beschikbare topics
  const sortedTopics = [...availableTopics].sort((a, b) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'frequency':
        return directionMultiplier * (b.frequency - a.frequency);
      case 'alphabetical':
        return directionMultiplier * a.topic.localeCompare(b.topic);
      case 'trend':
        return directionMultiplier * (b.trend - a.trend);
      default:
        return 0;
    }
  });
  
  // Filter topics op basis van zoekterm
  const filteredTopics = sortedTopics.filter(topic => {
    if (!searchTerm) return true;
    return topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handler voor topic selectie
  const handleTopicChange = (event) => {
    const value = event.target.value;
    
    // Beperk aantal selecties
    const newSelection = value.slice(0, maxSelections);
    setSelection(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };
  
  // Handler voor sortering
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    
    if (onSortChange) {
      onSortChange({ sortBy: event.target.value, sortDirection });
    }
  };
  
  // Handler voor sorteerrichting
  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    if (onSortChange) {
      onSortChange({ sortBy, sortDirection: newDirection });
    }
  };
  
  // Handler voor selectie wissen
  const handleClearSelection = () => {
    setSelection([]);
    
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };
  
  // Handler voor selectie van alle topics
  const handleSelectAll = () => {
    const allTopics = filteredTopics.slice(0, maxSelections).map(topic => topic.topic);
    setSelection(allTopics);
    
    if (onSelectionChange) {
      onSelectionChange(allTopics);
    }
  };
  
  // Handler voor vernieuwen
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Topic Selectie
        </Typography>
        
        <Box>
          <Tooltip title="Toon filters">
            <IconButton 
              size="small" 
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? "primary" : "default"}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Vernieuwen">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {/* Sorteren */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-label">Sorteren op</InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                value={sortBy}
                label="Sorteren op"
                onChange={handleSortChange}
              >
                <MenuItem value="frequency">Frequentie</MenuItem>
                <MenuItem value="alphabetical">Alfabetisch</MenuItem>
                <MenuItem value="trend">Trend</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title={sortDirection === 'asc' ? "Oplopend" : "Aflopend"}>
              <IconButton size="small" onClick={handleSortDirectionToggle}>
                {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Zoeken */}
            <OutlinedInput
              size="small"
              placeholder="Zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              endAdornment={
                searchTerm ? (
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }
            />
          </Box>
          
          {/* Actieknoppen */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={handleSelectAll}
              disabled={filteredTopics.length === 0}
              startIcon={<CheckIcon />}
            >
              Selecteer alle
            </Button>
            
            <Button 
              size="small" 
              variant="outlined"
              onClick={handleClearSelection}
              disabled={selection.length === 0}
              startIcon={<ClearIcon />}
            >
              Wis selectie
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
        </Box>
      )}
      
      {/* Topic selectie */}
      <FormControl fullWidth>
        <InputLabel id="topics-select-label">Geselecteerde Topics</InputLabel>
        <Select
          labelId="topics-select-label"
          id="topics-select"
          multiple
          value={selection}
          onChange={handleTopicChange}
          input={<OutlinedInput label="Geselecteerde Topics" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={value} 
                  size="small" 
                  sx={{ 
                    backgroundColor: alpha(topicColors[value] || theme.palette.primary.main, 0.1),
                    color: topicColors[value] || theme.palette.primary.main,
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
        >
          {filteredTopics.map((topicItem) => (
            <MenuItem key={topicItem.topic} value={topicItem.topic}>
              <Checkbox checked={selection.indexOf(topicItem.topic) > -1} />
              <ListItemText 
                primary={topicItem.topic} 
                secondary={`Frequentie: ${topicItem.frequency || 0}`} 
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Selectie info */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {selection.length} van {maxSelections} topics geselecteerd
      </Typography>
    </Paper>
  );
};

TopicSelectionControls.propTypes = {
  availableTopics: PropTypes.arrayOf(
    PropTypes.shape({
      topic: PropTypes.string.isRequired,
      frequency: PropTypes.number,
      trend: PropTypes.number
    })
  ),
  selectedTopics: PropTypes.arrayOf(PropTypes.string),
  topicColors: PropTypes.object,
  maxSelections: PropTypes.number,
  onSelectionChange: PropTypes.func,
  onSortChange: PropTypes.func,
  onRefresh: PropTypes.func
};

export default TopicSelectionControls;
