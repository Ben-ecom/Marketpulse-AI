import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Grid,
  Button,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import { FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
import ContextualTooltip from '../help/ContextualTooltip';

/**
 * FeedbackFilters Component
 * 
 * Component voor het filteren van feedback data in het analytics dashboard.
 * Biedt filters voor datumbereik, pagina's, gebruikersrollen, ervaringsniveaus en feedbacktypes.
 */
const FeedbackFilters = ({ filters, onFilterChange }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Beschikbare pagina's in de applicatie
  const availablePages = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'report', label: 'Topic Awareness Report' },
    { value: 'sentiment', label: 'Sentiment Analysis' },
    { value: 'trends', label: 'Market Trends' },
    { value: 'awareness', label: 'Awareness Phases' },
    { value: 'market-insights', label: 'Market Insights' }
  ];
  
  // Beschikbare gebruikersrollen
  const availableUserRoles = [
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'market_analyst', label: 'Market Analyst' },
    { value: 'content_creator', label: 'Content Creator' },
    { value: 'executive', label: 'Executive' },
    { value: 'product_manager', label: 'Product Manager' }
  ];
  
  // Beschikbare ervaringsniveaus
  const availableExperienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Gemiddeld' },
    { value: 'advanced', label: 'Gevorderd' },
    { value: 'expert', label: 'Expert' }
  ];
  
  // Beschikbare datumbereiken
  const availableDateRanges = [
    { value: 'today', label: 'Vandaag' },
    { value: 'last7days', label: 'Laatste 7 dagen' },
    { value: 'last30days', label: 'Laatste 30 dagen' },
    { value: 'last90days', label: 'Laatste 90 dagen' },
    { value: 'lastYear', label: 'Laatste jaar' }
  ];
  
  // Beschikbare feedbacktypes
  const availableFeedbackTypes = [
    { value: 'positive', label: 'Positief' },
    { value: 'negative', label: 'Negatief' }
  ];
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Update filter voor datumbereik
  const handleDateRangeChange = (event) => {
    onFilterChange({ dateRange: event.target.value });
  };
  
  // Update filter voor pagina's
  const handlePagesChange = (event) => {
    onFilterChange({ pages: event.target.value });
  };
  
  // Update filter voor gebruikersrollen
  const handleUserRolesChange = (event) => {
    onFilterChange({ userRoles: event.target.value });
  };
  
  // Update filter voor ervaringsniveaus
  const handleExperienceLevelsChange = (event) => {
    onFilterChange({ experienceLevels: event.target.value });
  };
  
  // Update filter voor feedbacktypes
  const handleFeedbackTypesChange = (event) => {
    onFilterChange({ feedbackTypes: event.target.value });
  };
  
  // Reset alle filters
  const handleResetFilters = () => {
    onFilterChange({
      dateRange: 'last30days',
      pages: [],
      userRoles: [],
      experienceLevels: [],
      feedbackTypes: ['positive', 'negative']
    });
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          <ContextualTooltip
            content="Gebruik deze filters om de feedback data te filteren op basis van datum, pagina, gebruikersrol, ervaringsniveau en feedbacktype."
            placement="right"
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <ExpandMore fontSize="small" />
            </IconButton>
          </ContextualTooltip>
        </Box>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Datumbereik filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="date-range-label">Datumbereik</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                label="Datumbereik"
              >
                {availableDateRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Pagina's filter */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="pages-label">Pagina's</InputLabel>
              <Select
                labelId="pages-label"
                id="pages"
                multiple
                value={filters.pages}
                onChange={handlePagesChange}
                input={<OutlinedInput label="Pagina's" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const page = availablePages.find(p => p.value === value);
                      return (
                        <Chip key={value} label={page ? page.label : value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {availablePages.map((page) => (
                  <MenuItem key={page.value} value={page.value}>
                    <Checkbox checked={filters.pages.indexOf(page.value) > -1} />
                    <ListItemText primary={page.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Gebruikersrollen filter */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="user-roles-label">Gebruikersrollen</InputLabel>
              <Select
                labelId="user-roles-label"
                id="user-roles"
                multiple
                value={filters.userRoles}
                onChange={handleUserRolesChange}
                input={<OutlinedInput label="Gebruikersrollen" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = availableUserRoles.find(r => r.value === value);
                      return (
                        <Chip key={value} label={role ? role.label : value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {availableUserRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Checkbox checked={filters.userRoles.indexOf(role.value) > -1} />
                    <ListItemText primary={role.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Ervaringsniveaus filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="experience-levels-label">Ervaringsniveaus</InputLabel>
              <Select
                labelId="experience-levels-label"
                id="experience-levels"
                multiple
                value={filters.experienceLevels}
                onChange={handleExperienceLevelsChange}
                input={<OutlinedInput label="Ervaringsniveaus" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const level = availableExperienceLevels.find(l => l.value === value);
                      return (
                        <Chip key={value} label={level ? level.label : value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {availableExperienceLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Checkbox checked={filters.experienceLevels.indexOf(level.value) > -1} />
                    <ListItemText primary={level.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Feedbacktypes filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="feedback-types-label">Feedbacktypes</InputLabel>
              <Select
                labelId="feedback-types-label"
                id="feedback-types"
                multiple
                value={filters.feedbackTypes}
                onChange={handleFeedbackTypesChange}
                input={<OutlinedInput label="Feedbacktypes" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const type = availableFeedbackTypes.find(t => t.value === value);
                      return (
                        <Chip key={value} label={type ? type.label : value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {availableFeedbackTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Checkbox checked={filters.feedbackTypes.indexOf(type.value) > -1} />
                    <ListItemText primary={type.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleResetFilters}
            size="small"
          >
            Filters resetten
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FeedbackFilters;