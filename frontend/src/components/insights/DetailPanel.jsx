import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Reddit as RedditIcon,
  Instagram as InstagramIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon,
  Category as CategoryIcon,
  Comment as CommentIcon,
  Tag as TagIcon
} from '@mui/icons-material';

/**
 * Component voor het tonen van details van een geselecteerd item
 * @param {Object} props Component properties
 * @param {Object} props.item Geselecteerd item
 * @param {string} props.type Type van het item (painPoint, desire, term)
 * @param {Function} props.onClose Functie om het panel te sluiten
 */
const DetailPanel = ({ item, type, onClose }) => {
  if (!item) return null;

  // Platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'reddit':
        return <RedditIcon fontSize="small" />;
      case 'amazon':
        return <ShoppingCartIcon fontSize="small" />;
      case 'instagram':
        return <InstagramIcon fontSize="small" />;
      case 'tiktok':
        return <VideocamIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Platform color
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'reddit':
        return 'error';
      case 'amazon':
        return 'warning';
      case 'instagram':
        return 'secondary';
      case 'tiktok':
        return 'info';
      default:
        return 'primary';
    }
  };

  // Render content based on type
  const renderContent = () => {
    switch (type) {
      case 'painPoint':
        return renderPainPointDetails();
      case 'desire':
        return renderDesireDetails();
      case 'term':
        return renderTermDetails();
      default:
        return <Typography>Geen details beschikbaar</Typography>;
    }
  };

  // Render pain point details
  const renderPainPointDetails = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {item.text}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip 
          icon={<CategoryIcon />} 
          label={item.category} 
          color="primary" 
          variant="outlined" 
          sx={{ mr: 1 }} 
        />
        {item.platform && (
          <Chip 
            icon={getPlatformIcon(item.platform)} 
            label={item.platform} 
            color={getPlatformColor(item.platform)} 
            size="small" 
            variant="outlined" 
          />
        )}
      </Box>
      
      {item.description && (
        <Typography variant="body2" paragraph>
          {item.description}
        </Typography>
      )}
      
      {item.examples && item.examples.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Voorbeelden
          </Typography>
          <List dense>
            {item.examples.map((example, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CommentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={example} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );

  // Render desire details
  const renderDesireDetails = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {item.text}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip 
          icon={<CategoryIcon />} 
          label={item.category} 
          color="primary" 
          variant="outlined" 
          sx={{ mr: 1 }} 
        />
        {item.platform && (
          <Chip 
            icon={getPlatformIcon(item.platform)} 
            label={item.platform} 
            color={getPlatformColor(item.platform)} 
            size="small" 
            variant="outlined" 
          />
        )}
      </Box>
      
      {item.description && (
        <Typography variant="body2" paragraph>
          {item.description}
        </Typography>
      )}
      
      {item.examples && item.examples.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Voorbeelden
          </Typography>
          <List dense>
            {item.examples.map((example, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CommentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={example} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );

  // Render term details
  const renderTermDetails = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {item.text || item.term}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {item.platforms && item.platforms.map(platform => (
          <Chip 
            key={platform}
            icon={getPlatformIcon(platform)} 
            label={platform} 
            color={getPlatformColor(platform)} 
            size="small" 
            variant="outlined" 
          />
        ))}
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Frequentie: {item.value || item.totalFrequency}
      </Typography>
      
      {item.context && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Context
          </Typography>
          <Typography variant="body2" paragraph>
            {item.context}
          </Typography>
        </>
      )}
      
      {item.occurrences && item.occurrences.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Voorkomens per platform
          </Typography>
          <List dense>
            {item.occurrences.map((occurrence, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getPlatformIcon(occurrence.platform)}
                </ListItemIcon>
                <ListItemText 
                  primary={`${occurrence.platform}: ${occurrence.frequency} keer`} 
                  secondary={occurrence.context} 
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Details"
        action={
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default DetailPanel;
