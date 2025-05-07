import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, 
  Grid, Tabs, Tab, TextField, InputAdornment,
  Chip, List, ListItem, ListItemText, ListItemIcon,
  IconButton, Divider, Paper, Button, Menu, MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Link as LinkIcon,
  Reddit as RedditIcon,
  Instagram as InstagramIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon,
  Science as ScienceIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { getScientificSources } from '../services/pubmedService';
import { getRedditSources } from '../services/redditService';
import { getSocialMediaSources } from '../services/socialMediaService';
import { getAmazonSources } from '../services/amazonService';

/**
 * Component voor het weergeven van alle bronnen (wetenschappelijk, social media, etc.)
 */
const SourceLibrary = () => {
  const { projectId } = useParams();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    types: [],
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState('date-desc');

  // Haal bronnen op wanneer component mount of projectId verandert
  useEffect(() => {
    const fetchSources = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Haal bronnen op van verschillende services
        const [pubmedResponse, redditResponse, socialMediaResponse, amazonResponse] = await Promise.all([
          getScientificSources(projectId),
          getRedditSources(projectId),
          getSocialMediaSources(projectId),
          getAmazonSources(projectId)
        ]);

        // Combineer alle bronnen
        const allSources = [
          ...(pubmedResponse?.success ? pubmedResponse.sources.map(source => ({ ...source, platform: 'pubmed' })) : []),
          ...(redditResponse?.success ? redditResponse.sources.map(source => ({ ...source, platform: 'reddit' })) : []),
          ...(socialMediaResponse?.success ? socialMediaResponse.sources.map(source => ({ ...source, platform: 'social-media' })) : []),
          ...(amazonResponse?.success ? amazonResponse.sources.map(source => ({ ...source, platform: 'amazon' })) : [])
        ];

        setSources(allSources);
      } catch (err) {
        console.error('Error fetching sources:', err);
        setError(err.message || 'Er is een fout opgetreden bij het ophalen van bronnen');
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
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle sort menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    const newTypes = [...filters.types];
    const index = newTypes.indexOf(type);
    
    if (index === -1) {
      newTypes.push(type);
    } else {
      newTypes.splice(index, 1);
    }
    
    setFilters({
      ...filters,
      types: newTypes
    });
  };

  // Handle date range filter
  const handleDateRangeChange = (range) => {
    setFilters({
      ...filters,
      dateRange: range
    });
    handleFilterClose();
  };

  // Handle sort change
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };

  // Filter sources based on active tab, search term, and filters
  const getFilteredSources = () => {
    let filtered = [...sources];
    
    // Filter by platform (tab)
    if (activeTab === 1) {
      filtered = filtered.filter(source => source.platform === 'pubmed');
    } else if (activeTab === 2) {
      filtered = filtered.filter(source => source.platform === 'reddit');
    } else if (activeTab === 3) {
      filtered = filtered.filter(source => source.platform === 'social-media');
    } else if (activeTab === 4) {
      filtered = filtered.filter(source => source.platform === 'amazon');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(source => 
        source.title?.toLowerCase().includes(term) || 
        source.url?.toLowerCase().includes(term)
      );
    }
    
    // Filter by type
    if (filters.types.length > 0) {
      filtered = filtered.filter(source => filters.types.includes(source.type));
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (filters.dateRange === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.dateRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (filters.dateRange === 'year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(source => {
        if (!source.date) return true;
        const sourceDate = new Date(source.date);
        return sourceDate >= cutoffDate;
      });
    }
    
    // Sort sources
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      });
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
    } else if (sortBy === 'relevance') {
      filtered.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    } else if (sortBy === 'platform') {
      filtered.sort((a, b) => a.platform.localeCompare(b.platform));
    }
    
    return filtered;
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'pubmed':
        return <ScienceIcon />;
      case 'reddit':
        return <RedditIcon />;
      case 'social-media':
        return <InstagramIcon />;
      case 'amazon':
        return <ShoppingCartIcon />;
      default:
        return <LinkIcon />;
    }
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      pubmed: 'success',
      reddit: 'error',
      'social-media': 'secondary',
      amazon: 'warning'
    };
    return colors[platform] || 'primary';
  };

  // Export sources as CSV
  const exportSourcesAsCSV = () => {
    const filteredSources = getFilteredSources();
    const headers = ['Platform', 'Type', 'Title', 'URL', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredSources.map(source => [
        source.platform,
        source.type,
        `"${source.title?.replace(/"/g, '""') || ''}"`,
        `"${source.url || ''}"`,
        source.date || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bronnen-${projectId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSources = getFilteredSources();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Bronnenbibliotheek
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="source tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Alle Bronnen" />
          <Tab label="Wetenschappelijk" icon={<ScienceIcon />} iconPosition="start" />
          <Tab label="Reddit" icon={<RedditIcon />} iconPosition="start" />
          <Tab label="Social Media" icon={<InstagramIcon />} iconPosition="start" />
          <Tab label="Amazon" icon={<ShoppingCartIcon />} iconPosition="start" />
        </Tabs>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportSourcesAsCSV}
          sx={{ ml: 2 }}
        >
          Exporteren
        </Button>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Zoeken..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        <IconButton onClick={handleFilterClick} color={filters.types.length > 0 || filters.dateRange !== 'all' ? 'primary' : 'default'}>
          <FilterIcon />
        </IconButton>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Type Filter</Typography>
          </MenuItem>
          <MenuItem>
            <Chip
              label="Wetenschappelijk"
              icon={<ScienceIcon />}
              clickable
              color={filters.types.includes('scientific') ? 'primary' : 'default'}
              onClick={() => handleFilterChange('scientific')}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Social Media Post"
              icon={<InstagramIcon />}
              clickable
              color={filters.types.includes('post') ? 'primary' : 'default'}
              onClick={() => handleFilterChange('post')}
            />
          </MenuItem>
          <MenuItem>
            <Chip
              label="Review"
              icon={<StarIcon />}
              clickable
              color={filters.types.includes('review') ? 'primary' : 'default'}
              onClick={() => handleFilterChange('review')}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Forum Thread"
              icon={<RedditIcon />}
              clickable
              color={filters.types.includes('thread') ? 'primary' : 'default'}
              onClick={() => handleFilterChange('thread')}
            />
          </MenuItem>
          <Divider />
          <MenuItem disabled>
            <Typography variant="subtitle2">Datum Filter</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleDateRangeChange('all')}>
            Alle tijd
          </MenuItem>
          <MenuItem onClick={() => handleDateRangeChange('week')}>
            Afgelopen week
          </MenuItem>
          <MenuItem onClick={() => handleDateRangeChange('month')}>
            Afgelopen maand
          </MenuItem>
          <MenuItem onClick={() => handleDateRangeChange('year')}>
            Afgelopen jaar
          </MenuItem>
        </Menu>
        
        <IconButton onClick={handleSortClick}>
          <SortIcon />
        </IconButton>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem onClick={() => handleSortChange('date-desc')}>
            Nieuwste eerst
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('date-asc')}>
            Oudste eerst
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('relevance')}>
            Relevantie
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('platform')}>
            Platform
          </MenuItem>
        </Menu>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Bronnen laden...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : filteredSources.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Geen bronnen gevonden</Typography>
        </Box>
      ) : (
        <List>
          {filteredSources.map((source, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <Chip
                    icon={getPlatformIcon(source.platform)}
                    label={source.platform === 'pubmed' ? 'Wetenschappelijk' : 
                           source.platform === 'reddit' ? 'Reddit' :
                           source.platform === 'social-media' ? 'Social Media' : 'Amazon'}
                    color={getPlatformColor(source.platform)}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {source.title || 'Geen titel'}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {source.description || 'Geen beschrijving'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton size="small" href={source.url} target="_blank">
                          <LinkIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {source.date ? new Date(source.date).toLocaleDateString() : 'Geen datum'}
                        </Typography>
                        {source.type && (
                          <Chip
                            label={source.type}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < filteredSources.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SourceLibrary;
