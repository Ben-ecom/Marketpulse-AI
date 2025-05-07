/**
 * FilterConfigTab.jsx
 * 
 * Component voor het beheren van opgeslagen filters voor het dashboard.
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
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

/**
 * FilterConfigTab component
 * @component
 */
const FilterConfigTab = ({ 
  savedFilters, 
  defaultFilter, 
  onSaveFilter, 
  onDeleteFilter, 
  onSetDefaultFilter 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterConfig, setFilterConfig] = useState({
    dateRange: {
      preset: 'last30days',
      start: null,
      end: null
    },
    userRoles: [],
    experienceLevels: []
  });
  
  // Handler voor openen van filter dialoog
  const handleOpenDialog = (filter = null) => {
    if (filter) {
      setEditingFilter(filter);
      setFilterName(filter.name);
      setFilterConfig(filter.config);
    } else {
      setEditingFilter(null);
      setFilterName('');
      setFilterConfig({
        dateRange: {
          preset: 'last30days',
          start: null,
          end: null
        },
        userRoles: [],
        experienceLevels: []
      });
    }
    
    setOpenDialog(true);
  };
  
  // Handler voor sluiten van filter dialoog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handler voor opslaan van filter
  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    
    const filter = {
      name: filterName.trim(),
      config: filterConfig,
      createdAt: editingFilter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      await onSaveFilter(filter);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };
  
  // Handler voor verwijderen van filter
  const handleDeleteFilter = async (filterName) => {
    try {
      await onDeleteFilter(filterName);
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  };
  
  // Handler voor instellen van standaard filter
  const handleSetDefaultFilter = async (filterName) => {
    try {
      await onSetDefaultFilter(filterName);
    } catch (error) {
      console.error('Error setting default filter:', error);
    }
  };
  
  // Formatteert de filter configuratie voor weergave
  const formatFilterConfig = (config) => {
    const parts = [];
    
    // Datumbereik
    if (config.dateRange) {
      if (config.dateRange.preset === 'custom') {
        parts.push(`Aangepaste datum: ${config.dateRange.start} - ${config.dateRange.end}`);
      } else if (config.dateRange.preset === 'last7days') {
        parts.push('Laatste 7 dagen');
      } else if (config.dateRange.preset === 'last30days') {
        parts.push('Laatste 30 dagen');
      } else if (config.dateRange.preset === 'thisMonth') {
        parts.push('Deze maand');
      } else if (config.dateRange.preset === 'lastMonth') {
        parts.push('Vorige maand');
      }
    }
    
    // Gebruikersrollen
    if (config.userRoles && config.userRoles.length > 0) {
      parts.push(`Rollen: ${config.userRoles.join(', ')}`);
    }
    
    // Ervaringsniveaus
    if (config.experienceLevels && config.experienceLevels.length > 0) {
      parts.push(`Niveaus: ${config.experienceLevels.join(', ')}`);
    }
    
    return parts.join(' | ');
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Opgeslagen Filters
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Beheer je opgeslagen filters voor het dashboard. Sla veelgebruikte filtercombinaties op voor snelle toegang.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nieuwe Filter
        </Button>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        {savedFilters.length === 0 ? (
          <Alert severity="info">
            Je hebt nog geen filters opgeslagen. Klik op 'Nieuwe Filter' om een filter op te slaan.
          </Alert>
        ) : (
          <List>
            {savedFilters.map((filter, index) => (
              <React.Fragment key={filter.name}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {filter.name}
                        {defaultFilter === filter.name && (
                          <Tooltip title="Standaard filter">
                            <StarIcon color="warning" sx={{ ml: 1 }} fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={formatFilterConfig(filter.config)}
                    primaryTypographyProps={{ fontWeight: defaultFilter === filter.name ? 'bold' : 'normal' }}
                  />
                  <ListItemSecondaryAction>
                    {defaultFilter !== filter.name && (
                      <Tooltip title="Als standaard instellen">
                        <IconButton 
                          edge="end" 
                          aria-label="set-default" 
                          onClick={() => handleSetDefaultFilter(filter.name)}
                          sx={{ mr: 1 }}
                        >
                          <StarBorderIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Bewerken">
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpenDialog(filter)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verwijderen">
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDeleteFilter(filter.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < savedFilters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Filter dialoog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFilter ? 'Filter Bewerken' : 'Nieuwe Filter'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Filter Naam"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              fullWidth
              required
              error={!filterName.trim()}
              helperText={!filterName.trim() ? 'Filter naam is verplicht' : ''}
            />
          </Box>
          
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Datumbereik</FormLabel>
            <RadioGroup
              value={filterConfig.dateRange.preset}
              onChange={(e) => setFilterConfig({
                ...filterConfig,
                dateRange: {
                  ...filterConfig.dateRange,
                  preset: e.target.value
                }
              })}
            >
              <FormControlLabel value="last7days" control={<Radio />} label="Laatste 7 dagen" />
              <FormControlLabel value="last30days" control={<Radio />} label="Laatste 30 dagen" />
              <FormControlLabel value="thisMonth" control={<Radio />} label="Deze maand" />
              <FormControlLabel value="lastMonth" control={<Radio />} label="Vorige maand" />
              <FormControlLabel value="custom" control={<Radio />} label="Aangepaste datum" />
            </RadioGroup>
          </FormControl>
          
          {/* Hier kunnen we meer filter opties toevoegen zoals gebruikersrollen en ervaringsniveaus */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Meer filteropties zoals gebruikersrollen en ervaringsniveaus kunnen hier worden toegevoegd.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button 
            onClick={handleSaveFilter} 
            variant="contained" 
            disabled={!filterName.trim()}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

FilterConfigTab.propTypes = {
  /**
   * Lijst van opgeslagen filters
   */
  savedFilters: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  })).isRequired,
  
  /**
   * Naam van de standaard filter
   */
  defaultFilter: PropTypes.string,
  
  /**
   * Functie voor het opslaan van een filter
   */
  onSaveFilter: PropTypes.func.isRequired,
  
  /**
   * Functie voor het verwijderen van een filter
   */
  onDeleteFilter: PropTypes.func.isRequired,
  
  /**
   * Functie voor het instellen van een standaard filter
   */
  onSetDefaultFilter: PropTypes.func.isRequired
};

export default FilterConfigTab;