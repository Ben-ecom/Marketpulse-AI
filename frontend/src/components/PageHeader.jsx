import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * PageHeader component voor consistente pagina headers
 * @param {object} props - Component properties
 * @param {string} props.title - Titel van de pagina
 * @param {string} props.description - Beschrijving van de pagina
 * @param {function} props.onBack - Functie om terug te navigeren
 * @param {array} props.breadcrumbs - Array met breadcrumb items (optioneel)
 * @returns {JSX.Element} PageHeader component
 */
const PageHeader = ({ title, description, onBack, breadcrumbs }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={crumb.link}
              color={index === breadcrumbs.length - 1 ? 'primary' : 'inherit'}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {onBack && (
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack} 
            sx={{ mr: 2 }}
          >
            Terug
          </Button>
        )}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      
      {description && (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
