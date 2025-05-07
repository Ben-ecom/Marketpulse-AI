import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * Component voor het weergeven en bewerken van de gegenereerde configuratie
 * @param {Object} props - Component properties
 * @param {Object} props.config - De gegenereerde configuratie
 * @param {Function} props.onSave - Functie om wijzigingen op te slaan
 * @param {boolean} props.readOnly - Indien true, is de configuratie alleen-lezen
 */
const ConfigurationViewer = ({ config, onSave, readOnly = false }) => {
  const [editedConfig, setEditedConfig] = useState(config);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogData, setDialogData] = useState({});
  const [newItem, setNewItem] = useState('');
  
  // Functie om wijzigingen op te slaan
  const handleSave = () => {
    onSave(editedConfig);
  };
  
  // Functie om een dialoog te openen
  const openEditDialog = (type, data) => {
    setDialogType(type);
    setDialogData(data);
    setOpenDialog(true);
  };
  
  // Functie om een dialoog te sluiten
  const closeDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setDialogData({});
    setNewItem('');
  };
  
  // Functie om een item toe te voegen aan een lijst
  const addItemToList = (platform, listName) => {
    if (!newItem.trim()) return;
    
    setEditedConfig(prev => {
      const updatedConfig = { ...prev };
      
      if (!updatedConfig.platforms[platform][listName]) {
        updatedConfig.platforms[platform][listName] = [];
      }
      
      updatedConfig.platforms[platform][listName] = [
        ...updatedConfig.platforms[platform][listName],
        newItem.trim()
      ];
      
      return updatedConfig;
    });
    
    setNewItem('');
    closeDialog();
  };
  
  // Functie om een item te verwijderen uit een lijst
  const removeItemFromList = (platform, listName, index) => {
    setEditedConfig(prev => {
      const updatedConfig = { ...prev };
      
      updatedConfig.platforms[platform][listName] = [
        ...updatedConfig.platforms[platform][listName].slice(0, index),
        ...updatedConfig.platforms[platform][listName].slice(index + 1)
      ];
      
      return updatedConfig;
    });
  };
  
  // Functie om een filter te wijzigen
  const updateFilter = (platform, filterName, value) => {
    setEditedConfig(prev => {
      const updatedConfig = { ...prev };
      
      if (!updatedConfig.platforms[platform].filters) {
        updatedConfig.platforms[platform].filters = {};
      }
      
      updatedConfig.platforms[platform].filters[filterName] = value;
      
      return updatedConfig;
    });
  };
  
  // Render de dialoog op basis van het type
  const renderDialog = () => {
    switch (dialogType) {
      case 'addSubreddit':
        return (
          <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Subreddit toevoegen</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Subreddit naam"
                fullWidth
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Annuleren</Button>
              <Button 
                onClick={() => addItemToList('reddit', 'subreddits')}
                variant="contained"
                color="primary"
              >
                Toevoegen
              </Button>
            </DialogActions>
          </Dialog>
        );
        
      case 'addProduct':
        return (
          <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Product URL toevoegen</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Product URL"
                fullWidth
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Annuleren</Button>
              <Button 
                onClick={() => addItemToList('amazon', 'products')}
                variant="contained"
                color="primary"
              >
                Toevoegen
              </Button>
            </DialogActions>
          </Dialog>
        );
        
      case 'addHashtag':
        return (
          <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Hashtag toevoegen</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Hashtag (zonder #)"
                fullWidth
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Annuleren</Button>
              <Button 
                onClick={() => {
                  // Voeg # toe als die ontbreekt
                  if (!newItem.startsWith('#')) {
                    setNewItem('#' + newItem);
                  }
                  addItemToList('social_media', 'hashtags');
                }}
                variant="contained"
                color="primary"
              >
                Toevoegen
              </Button>
            </DialogActions>
          </Dialog>
        );
        
      case 'editFilter':
        return (
          <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Filter bewerken</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={dialogData.label || dialogData.name}
                fullWidth
                value={dialogData.value !== undefined ? dialogData.value : ''}
                onChange={(e) => {
                  // Converteer naar nummer indien nodig
                  const value = dialogData.isNumeric 
                    ? parseInt(e.target.value, 10) 
                    : e.target.value;
                  
                  setDialogData({
                    ...dialogData,
                    value
                  });
                }}
                type={dialogData.isNumeric ? "number" : "text"}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Annuleren</Button>
              <Button 
                onClick={() => {
                  updateFilter(
                    dialogData.platform,
                    dialogData.name,
                    dialogData.value
                  );
                  closeDialog();
                }}
                variant="contained"
                color="primary"
              >
                Opslaan
              </Button>
            </DialogActions>
          </Dialog>
        );
        
      default:
        return null;
    }
  };
  
  // Render de keywords sectie
  const renderKeywords = () => {
    if (!editedConfig.keywords || editedConfig.keywords.length === 0) {
      return <Typography variant="body2">Geen keywords gevonden</Typography>;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Keywords
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {editedConfig.keywords.map((keyword, index) => (
            <Chip 
              key={index} 
              label={keyword} 
              color="primary" 
              variant="outlined"
              onDelete={!readOnly ? () => {
                setEditedConfig(prev => ({
                  ...prev,
                  keywords: prev.keywords.filter((_, i) => i !== index)
                }));
              } : undefined}
            />
          ))}
        </Box>
      </Box>
    );
  };
  
  // Render de Reddit configuratie
  const renderRedditConfig = () => {
    if (!editedConfig.platforms.reddit) return null;
    
    const { subreddits, filters } = editedConfig.platforms.reddit;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">Reddit Configuratie</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Subreddits</Typography>
            <List dense>
              {subreddits && subreddits.length > 0 ? (
                subreddits.map((subreddit, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={!readOnly && (
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => removeItemFromList('reddit', 'subreddits', index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  >
                    <ListItemText primary={`r/${subreddit}`} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Geen subreddits geconfigureerd" />
                </ListItem>
              )}
            </List>
            
            {!readOnly && (
              <Button 
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => openEditDialog('addSubreddit')}
              >
                Subreddit toevoegen
              </Button>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Filters</Typography>
            <List dense>
              {filters && Object.entries(filters).map(([name, value], index) => (
                <ListItem 
                  key={index}
                  secondaryAction={!readOnly && (
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => openEditDialog('editFilter', {
                        platform: 'reddit',
                        name,
                        value,
                        isNumeric: typeof value === 'number',
                        label: getFilterLabel(name)
                      })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                >
                  <ListItemText 
                    primary={getFilterLabel(name)}
                    secondary={formatFilterValue(name, value)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Render de Amazon configuratie
  const renderAmazonConfig = () => {
    if (!editedConfig.platforms.amazon) return null;
    
    const { products, categories, filters } = editedConfig.platforms.amazon;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">Amazon Configuratie</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Producten</Typography>
            <List dense>
              {products && products.length > 0 ? (
                products.map((product, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={!readOnly && (
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => removeItemFromList('amazon', 'products', index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  >
                    <ListItemText 
                      primary={product.length > 50 ? product.substring(0, 50) + '...' : product} 
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Geen producten geconfigureerd" />
                </ListItem>
              )}
            </List>
            
            {!readOnly && (
              <Button 
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => openEditDialog('addProduct')}
              >
                Product toevoegen
              </Button>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Categorieën</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <Chip 
                    key={index} 
                    label={category} 
                    color="primary" 
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2">Geen categorieën geconfigureerd</Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Filters</Typography>
            <List dense>
              {filters && Object.entries(filters).map(([name, value], index) => (
                <ListItem 
                  key={index}
                  secondaryAction={!readOnly && (
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => openEditDialog('editFilter', {
                        platform: 'amazon',
                        name,
                        value,
                        isNumeric: typeof value === 'number',
                        label: getFilterLabel(name)
                      })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                >
                  <ListItemText 
                    primary={getFilterLabel(name)}
                    secondary={formatFilterValue(name, value)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Render de Social Media configuratie
  const renderSocialMediaConfig = () => {
    if (!editedConfig.platforms.social_media) return null;
    
    const { hashtags, platforms: socialPlatforms, filters } = editedConfig.platforms.social_media;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">Social Media Configuratie</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Platforms</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {socialPlatforms && socialPlatforms.length > 0 ? (
                socialPlatforms.map((platform, index) => (
                  <Chip 
                    key={index} 
                    label={platform} 
                    color="primary" 
                  />
                ))
              ) : (
                <Typography variant="body2">Geen platforms geconfigureerd</Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Hashtags</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {hashtags && hashtags.length > 0 ? (
                hashtags.map((hashtag, index) => (
                  <Chip 
                    key={index} 
                    label={hashtag} 
                    color="secondary" 
                    variant="outlined"
                    onDelete={!readOnly ? () => removeItemFromList('social_media', 'hashtags', index) : undefined}
                  />
                ))
              ) : (
                <Typography variant="body2">Geen hashtags geconfigureerd</Typography>
              )}
            </Box>
            
            {!readOnly && (
              <Button 
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => openEditDialog('addHashtag')}
              >
                Hashtag toevoegen
              </Button>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Filters</Typography>
            <List dense>
              {filters && Object.entries(filters).map(([name, value], index) => (
                <ListItem 
                  key={index}
                  secondaryAction={!readOnly && (
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => openEditDialog('editFilter', {
                        platform: 'social_media',
                        name,
                        value,
                        isNumeric: typeof value === 'number',
                        label: getFilterLabel(name)
                      })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                >
                  <ListItemText 
                    primary={getFilterLabel(name)}
                    secondary={formatFilterValue(name, value)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Render de Market Analysis configuratie
  const renderMarketAnalysisConfig = () => {
    if (!editedConfig.platforms.market_analysis) return null;
    
    const { sectors, subsectors, filters } = editedConfig.platforms.market_analysis;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">Marktanalyse Configuratie</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">Sectoren</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {sectors && sectors.length > 0 ? (
                    sectors.map((sector, index) => (
                      <Chip 
                        key={index} 
                        label={sector} 
                        color="primary" 
                      />
                    ))
                  ) : (
                    <Typography variant="body2">Geen sectoren geconfigureerd</Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">Subsectoren</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {subsectors && subsectors.length > 0 ? (
                    subsectors.map((subsector, index) => (
                      <Chip 
                        key={index} 
                        label={subsector} 
                        color="secondary" 
                      />
                    ))
                  ) : (
                    <Typography variant="body2">Geen subsectoren geconfigureerd</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold">Filters</Typography>
            <List dense>
              {filters && Object.entries(filters).map(([name, value], index) => (
                <ListItem 
                  key={index}
                  secondaryAction={!readOnly && (
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => openEditDialog('editFilter', {
                        platform: 'market_analysis',
                        name,
                        value,
                        isNumeric: typeof value === 'boolean' ? false : typeof value === 'number',
                        label: getFilterLabel(name)
                      })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                >
                  <ListItemText 
                    primary={getFilterLabel(name)}
                    secondary={formatFilterValue(name, value)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Helper functie om een gebruiksvriendelijke label te genereren voor een filter
  const getFilterLabel = (filterName) => {
    const labels = {
      // Reddit filters
      time_period: 'Tijdsperiode',
      sort_by: 'Sorteren op',
      min_upvotes: 'Minimum upvotes',
      min_comments: 'Minimum comments',
      include_comments: 'Comments includeren',
      min_data_points: 'Minimum datapunten',
      
      // Amazon filters
      min_reviews: 'Minimum reviews',
      min_rating: 'Minimum rating',
      max_rating: 'Maximum rating',
      include_q_and_a: 'Q&A includeren',
      
      // Social Media filters
      content_type: 'Content type',
      min_likes: 'Minimum likes',
      include_captions: 'Captions includeren',
      
      // Market Analysis filters
      include_trends: 'Trends includeren',
      include_market_size: 'Marktgrootte includeren',
      include_growth_rate: 'Groeipercentage includeren',
      include_segments: 'Segmenten includeren',
      include_competitors: 'Concurrenten includeren'
    };
    
    return labels[filterName] || filterName;
  };
  
  // Helper functie om een filterwaarde te formatteren
  const formatFilterValue = (filterName, value) => {
    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nee';
    }
    
    if (filterName === 'time_period') {
      const periods = {
        day: 'Dag',
        week: 'Week',
        month: 'Maand',
        year: 'Jaar',
        all: 'Alle tijd'
      };
      
      return periods[value] || value;
    }
    
    if (filterName === 'sort_by') {
      const sortOptions = {
        top: 'Populairste',
        new: 'Nieuwste',
        hot: 'Trending',
        relevance: 'Relevantie'
      };
      
      return sortOptions[value] || value;
    }
    
    return value.toString();
  };
  
  // Controleer of er een geldige configuratie is
  if (!editedConfig || !editedConfig.platforms) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" color="error">
          Geen geldige configuratie beschikbaar
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Scraping Configuratie</Typography>
        
        {!readOnly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Wijzigingen opslaan
          </Button>
        )}
      </Box>
      
      {renderKeywords()}
      
      <Box sx={{ mt: 3 }}>
        {renderRedditConfig()}
        {renderAmazonConfig()}
        {renderSocialMediaConfig()}
        {renderMarketAnalysisConfig()}
      </Box>
      
      {renderDialog()}
    </Paper>
  );
};

export default ConfigurationViewer;
