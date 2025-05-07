import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  ButtonGroup, 
  Button, 
  Chip,
  Divider
} from '@mui/material';

/**
 * Component voor het filteren van reviews op type (product, service, alle)
 * Gebruikt de bestaande backend filtering functionaliteit
 */
const ReviewsFilter = ({ onFilterChange }) => {
  const [filterType, setFilterType] = useState('all');
  
  const handleFilterChange = (type) => {
    setFilterType(type);
    if (onFilterChange) {
      onFilterChange(type);
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Divider sx={{ mb: 2 }}>
        <Chip label="Filter Reviews" color="primary" />
      </Divider>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ButtonGroup variant="outlined" aria-label="review filter options">
          <Button 
            color={filterType === 'all' ? 'primary' : 'inherit'}
            variant={filterType === 'all' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('all')}
          >
            Alle Reviews
          </Button>
          <Button 
            color={filterType === 'product' ? 'primary' : 'inherit'}
            variant={filterType === 'product' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('product')}
          >
            Product Reviews
          </Button>
          <Button 
            color={filterType === 'service' ? 'primary' : 'inherit'}
            variant={filterType === 'service' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('service')}
          >
            Service Reviews
          </Button>
        </ButtonGroup>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        {filterType === 'all' ? 'Toont alle reviews' : 
         filterType === 'product' ? 'Toont alleen product-gerelateerde reviews' : 
         'Toont alleen service-gerelateerde reviews'}
      </Typography>
    </Box>
  );
};

export default ReviewsFilter;
