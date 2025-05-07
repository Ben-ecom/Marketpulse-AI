import React from 'react';
import PropTypes from 'prop-types';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Tooltip, 
  IconButton,
  Typography
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

/**
 * DataSourceSelector Component
 * 
 * Een component voor het selecteren van een databron voor analyses en rapporten.
 * Biedt een dropdown menu met verschillende databronnen en tooltips met uitleg.
 * 
 * @component
 * @example
 * ```jsx
 * <DataSourceSelector 
 *   value="all" 
 *   onChange={handleDataSourceChange}
 *   aria-label="Selecteer databron"
 * />
 * ```
 */
const DataSourceSelector = ({ 
  value, 
  onChange, 
  disabled = false,
  ...props 
}) => {
  // Beschikbare databronnen met metadata
  const dataSources = [
    { id: 'all', name: 'Alle bronnen', description: 'Combineer data van alle beschikbare bronnen' },
    { id: 'social', name: 'Social media', description: 'Data van sociale media platforms (Twitter, Facebook, Instagram, LinkedIn)' },
    { id: 'blog', name: 'Blogs & artikelen', description: 'Data van blogs, nieuwssites en online publicaties' },
    { id: 'forum', name: 'Forums & communities', description: 'Data van online forums, Reddit en andere community platforms' },
    { id: 'review', name: 'Reviews & ratings', description: 'Data van product reviews en beoordelingen' },
    { id: 'custom', name: 'Custom dataset', description: 'Gebruik een aangepaste dataset die je hebt geüpload' }
  ];
  
  // Handler voor verandering van databron
  const handleChange = (event) => {
    onChange(event.target.value);
  };
  
  return (
    <Box sx={{ minWidth: 200, display: 'flex', alignItems: 'center' }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="data-source-label">Databron</InputLabel>
        <Select
          labelId="data-source-label"
          id="data-source-select"
          value={value}
          label="Databron"
          onChange={handleChange}
          {...props}
        >
          {dataSources.map((source) => (
            <MenuItem key={source.id} value={source.id}>
              <Typography>{source.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Tooltip 
        title={
          <Box>
            <Typography variant="subtitle2" gutterBottom>Databronnen</Typography>
            <Typography variant="body2" paragraph>
              Selecteer de databron die gebruikt moet worden voor de analyse.
            </Typography>
            {dataSources.map((source) => (
              <Box key={source.id} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{source.name}</Typography>
                <Typography variant="body2">{source.description}</Typography>
              </Box>
            ))}
          </Box>
        }
        arrow
      >
        <IconButton size="small" sx={{ ml: 1 }} aria-label="Meer informatie over databronnen">
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

DataSourceSelector.propTypes = {
  /**
   * De huidige geselecteerde waarde
   */
  value: PropTypes.string.isRequired,
  
  /**
   * Callback functie die wordt aangeroepen wanneer de selectie verandert
   * @param {string} newValue - De nieuwe geselecteerde waarde
   */
  onChange: PropTypes.func.isRequired,
  
  /**
   * Of de selector uitgeschakeld moet worden
   */
  disabled: PropTypes.bool
};

export default DataSourceSelector;
