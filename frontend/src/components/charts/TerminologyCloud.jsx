import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  Grid, List, ListItem, ListItemText, ListItemIcon,
  Chip, Divider, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { 
  Cloud as CloudIcon, 
  List as ListIcon,
  Reddit as RedditIcon,
  Instagram as InstagramIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';
import { TagCloud } from 'react-tagcloud';

/**
 * Component voor het visualiseren van terminologie data van verschillende platforms
 * @param {Object} props Component properties
 * @param {string} props.platform Geselecteerd platform (all, reddit, amazon, instagram, tiktok)
 * @param {Object} props.data Audience insights data object
 * @param {number} props.height Hoogte van de grafiek in pixels
 */
const TerminologyCloud = ({ platform = 'all', data = {}, height = 400 }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('cloud');
  
  // Handle view type change
  const handleViewTypeChange = (event, newType) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };
  
  // Haal de juiste data op basis van het geselecteerde platform
  const getPlatformData = () => {
    if (!data || !data.platforms) return [];
    
    if (platform === 'all') {
      // Combineer data van alle platforms
      const allTerms = {};
      
      data.platforms.forEach(platformData => {
        if (platformData.terminology && platformData.terminology.all) {
          platformData.terminology.all.forEach(term => {
            if (allTerms[term.term]) {
              allTerms[term.term].value += term.frequency;
              allTerms[term.term].platforms.add(platformData.platform);
            } else {
              allTerms[term.term] = {
                value: term.frequency,
                text: term.term,
                platforms: new Set([platformData.platform])
              };
            }
          });
        }
      });
      
      return Object.values(allTerms).map(term => ({
        ...term,
        platforms: Array.from(term.platforms)
      }));
    } else {
      // Haal data van specifiek platform
      const platformData = data.platforms.find(p => p.platform === platform);
      if (!platformData || !platformData.terminology || !platformData.terminology.all) return [];
      
      return platformData.terminology.all.map(term => ({
        text: term.term,
        value: term.frequency,
        platforms: [platform],
        context: term.context
      }));
    }
  };
  
  // Bereid data voor voor weergave
  const terminologyData = getPlatformData()
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
  
  // Bereid data voor voor tag cloud
  const cloudData = terminologyData.map(item => ({
    value: item.value,
    text: item.text,
    count: item.value // Voor react-tagcloud
  }));
  
  // Krijg kleur op basis van platform
  const getPlatformColor = (platformName) => {
    const colors = {
      reddit: theme.palette.error.main,
      amazon: theme.palette.warning.main,
      instagram: theme.palette.secondary.main,
      tiktok: theme.palette.info.main,
      all: theme.palette.primary.main
    };
    return colors[platformName] || theme.palette.primary.main;
  };
  
  // Krijg icon op basis van platform
  const getPlatformIcon = (platformName) => {
    switch (platformName) {
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
  
  // Custom renderer voor tag cloud
  const customRenderer = (tag, size, color) => {
    const fontSize = Math.log2(tag.count) * 2 + 12; // Logaritmische schaal voor de grootte
    
    return (
      <span
        key={tag.text}
        style={{
          fontSize: `${fontSize}px`,
          margin: '3px',
          padding: '3px',
          display: 'inline-block',
          color: platform === 'all' && tag.platforms ? 
            getPlatformColor(tag.platforms[0]) : 
            theme.palette.text.primary,
          cursor: 'pointer'
        }}
        title={`${tag.text} (${tag.count} keer genoemd)`}
      >
        {tag.text}
      </span>
    );
  };

  if (terminologyData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Geen terminologie data beschikbaar voor {platform === 'all' ? 'alle platforms' : platform}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start een nieuwe analyse om inzichten te verzamelen
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          Terminologie {platform !== 'all' ? `(${platform})` : ''}
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          size="small"
        >
          <ToggleButton value="cloud" aria-label="word cloud">
            <CloudIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {viewType === 'cloud' ? (
        <Box 
          sx={{ 
            height, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            p: 2
          }}
        >
          <TagCloud
            minSize={12}
            maxSize={35}
            tags={cloudData}
            renderer={customRenderer}
            shuffle={false}
          />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader 
                title="Meest Gebruikte Termen" 
                titleTypographyProps={{ variant: 'subtitle1' }} 
                sx={{ pb: 0 }}
              />
              <CardContent>
                <List dense>
                  {terminologyData.slice(0, 15).map((term, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip 
                          label={`${index + 1}`} 
                          size="small" 
                          variant="outlined" 
                          color={platform === 'all' && term.platforms ? 
                            term.platforms[0] === 'reddit' ? 'error' :
                            term.platforms[0] === 'amazon' ? 'warning' :
                            term.platforms[0] === 'instagram' ? 'secondary' :
                            term.platforms[0] === 'tiktok' ? 'info' : 'primary'
                            : 'primary'
                          }
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={term.text} 
                        secondary={`Frequentie: ${term.value}`} 
                      />
                      {platform === 'all' && term.platforms && term.platforms.map((p, i) => (
                        <Chip 
                          key={i}
                          icon={getPlatformIcon(p)}
                          label={p}
                          size="small"
                          sx={{ ml: 0.5 }}
                          variant="outlined"
                        />
                      ))}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader 
                title="Terminologie per Platform" 
                titleTypographyProps={{ variant: 'subtitle1' }} 
                sx={{ pb: 0 }}
              />
              <CardContent>
                {platform === 'all' ? (
                  data.platforms.map((platformData, index) => {
                    const termCount = platformData.terminology?.all?.length || 0;
                    return (
                      <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center">
                          {getPlatformIcon(platformData.platform)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {platformData.platform}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {termCount} unieke termen
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Box>
                    <Typography variant="body2">
                      Totaal aantal unieke termen voor {platform}: {terminologyData.length}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Voorbeeldcontext:
                    </Typography>
                    {terminologyData.slice(0, 3).map((term, index) => (
                      <Box key={index} mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                          "{term.text}":
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          {term.context || "Geen context beschikbaar"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          * Terminologie is geëxtraheerd uit posts, comments en reviews op basis van domein-specifieke patronen.
        </Typography>
      </Box>
    </Box>
  );
};

export default TerminologyCloud;
