import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  Grid, Tabs, Tab, Paper, Divider, Button, 
  Chip, List, ListItem, ListItemText, ListItemIcon,
  Avatar, TextField, InputAdornment, IconButton,
  Menu, MenuItem, Tooltip, LinearProgress
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  Science as ScienceIcon,
  Reddit as RedditIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Language as WebIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { getSourceLibrary } from '../../services/pubmedService';

/**
 * SourceLibrary Component
 * Displays all sources including scientific research, Reddit, and social media
 */
const SourceLibrary = () => {
  const { projectId } = useParams();
  
  // State
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getSourceLibrary(projectId);
        
        if (response.success) {
          setSources(response.sources || []);
        } else {
          setError('Er is een fout opgetreden bij het ophalen van bronnen');
        }
      } catch (err) {
        console.error('Error fetching sources:', err);
        setError(err.message || 'Er is een fout opgetreden');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSources();
  }, [projectId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, source) => {
    setAnchorEl(event.currentTarget);
    setSelectedSource(source);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSource(null);
  };
  
  // Handle copy citation
  const handleCopyCitation = () => {
    if (!selectedSource) return;
    
    let citation = '';
    
    if (selectedSource.type === 'pubmed') {
      // Format academic citation
      citation = `${selectedSource.authors.join(', ')}. (${new Date(selectedSource.date).getFullYear()}). ${selectedSource.title}. ${selectedSource.journal}, ${selectedSource.volume}(${selectedSource.issue}), ${selectedSource.pages}. doi: ${selectedSource.doi}`;
    } else {
      // Format web citation
      citation = `${selectedSource.title}. Retrieved from ${selectedSource.url} on ${new Date().toLocaleDateString()}`;
    }
    
    navigator.clipboard.writeText(citation);
    handleMenuClose();
  };
  
  // Handle copy link
  const handleCopyLink = () => {
    if (!selectedSource) return;
    
    navigator.clipboard.writeText(selectedSource.url);
    handleMenuClose();
  };
  
  // Filter sources based on active tab and search query
  const filteredSources = sources.filter(source => {
    // Filter by tab
    if (activeTab !== 'all' && source.type !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        source.title.toLowerCase().includes(query) ||
        (source.description && source.description.toLowerCase().includes(query)) ||
        (source.authors && source.authors.join(', ').toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Sort sources
  const sortedSources = [...filteredSources].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'date':
        valueA = new Date(a.date);
        valueB = new Date(b.date);
        break;
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'relevance':
        valueA = a.relevanceScore || 0;
        valueB = b.relevanceScore || 0;
        break;
      default:
        valueA = new Date(a.date);
        valueB = new Date(b.date);
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  // Get source icon based on type
  const getSourceIcon = (type) => {
    switch (type) {
      case 'pubmed':
        return <ScienceIcon />;
      case 'reddit':
        return <RedditIcon />;
      case 'facebook':
        return <FacebookIcon />;
      case 'twitter':
        return <TwitterIcon />;
      case 'instagram':
        return <InstagramIcon />;
      default:
        return <WebIcon />;
    }
  };
  
  // Get source color based on type
  const getSourceColor = (type) => {
    switch (type) {
      case 'pubmed':
        return 'success';
      case 'reddit':
        return 'error';
      case 'facebook':
        return 'primary';
      case 'twitter':
        return 'info';
      case 'instagram':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card>
      <CardHeader
        title="Bronnenbibliotheek"
        subheader={`${sources.length} bronnen gevonden`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Exporteer bronnen">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Zoek in bronnen..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('date')}
                  color={sortBy === 'date' ? 'primary' : 'inherit'}
                  size="small"
                >
                  Datum {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('title')}
                  color={sortBy === 'title' ? 'primary' : 'inherit'}
                  size="small"
                >
                  Titel {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('relevance')}
                  color={sortBy === 'relevance' ? 'primary' : 'inherit'}
                  size="small"
                >
                  Relevantie {sortBy === 'relevance' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="source tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Alle Bronnen" value="all" />
          <Tab 
            label="Wetenschappelijk" 
            value="pubmed" 
            icon={<ScienceIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Reddit" 
            value="reddit" 
            icon={<RedditIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Social Media" 
            value="social" 
            icon={<FacebookIcon fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : sortedSources.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            Geen bronnen gevonden. Pas je filters aan of voer een nieuwe zoekopdracht uit.
          </Typography>
        ) : (
          <List>
            {sortedSources.map((source, index) => (
              <React.Fragment key={source.id || index}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getSourceColor(source.type)}.light`,
                        color: `${getSourceColor(source.type)}.dark`
                      }}
                    >
                      {getSourceIcon(source.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" component="div">
                          {source.title}
                        </Typography>
                        <Box>
                          <Chip 
                            label={source.type === 'pubmed' ? 'Wetenschappelijk' : 
                                  source.type === 'reddit' ? 'Reddit' : 
                                  'Social Media'}
                            size="small"
                            color={getSourceColor(source.type)}
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, source)}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                          {source.description || source.abstract || 'Geen beschrijving beschikbaar'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                          {source.type === 'pubmed' && (
                            <>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                <strong>Auteurs:</strong> {source.authors ? source.authors.join(', ') : 'Onbekend'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                <strong>Journal:</strong> {source.journal || 'Onbekend'}
                              </Typography>
                              {source.doi && (
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                  <strong>DOI:</strong> {source.doi}
                                </Typography>
                              )}
                            </>
                          )}
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                            <strong>Datum:</strong> {formatDate(source.date)}
                          </Typography>
                          
                          {source.relevanceScore !== undefined && (
                            <Chip 
                              label={`Relevantie: ${Math.round(source.relevanceScore * 100)}%`}
                              size="small"
                              color={
                                source.relevanceScore > 0.8 ? 'success' :
                                source.relevanceScore > 0.5 ? 'warning' : 'default'
                              }
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            startIcon={<LinkIcon fontSize="small" />}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Bekijk bron
                          </Button>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < sortedSources.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        {/* Source actions menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleCopyCitation}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Kopieer citatie</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Kopieer link</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download PDF</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default SourceLibrary;
