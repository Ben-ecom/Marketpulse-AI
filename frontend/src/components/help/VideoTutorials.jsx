import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

/**
 * VideoTutorials Component
 * 
 * Een component dat videotutorials toont met zoek- en filterfunctionaliteit.
 * 
 * @component
 * @example
 * ```jsx
 * <VideoTutorials
 *   title="Videotutorials"
 *   videos={videoData}
 *   onVideoView={(videoId) => console.log('Video bekeken:', videoId)}
 * />
 * ```
 */
const VideoTutorials = ({
  title = 'Videotutorials',
  videos = [],
  categories = [],
  showSearch = true,
  showCategories = true,
  onVideoView,
  onBookmark
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState({});
  
  // Filter videos op basis van zoekopdracht en categorie
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        video.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, selectedCategory]);
  
  // Unieke categorieën uit videos
  const uniqueCategories = useMemo(() => {
    const categoriesFromVideos = videos
      .map(video => video.category)
      .filter((value, index, self) => value && self.indexOf(value) === index);
    
    return categories.length > 0 ? categories : categoriesFromVideos;
  }, [videos, categories]);
  
  // Handler voor het wijzigen van de zoekopdracht
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handler voor het wijzigen van de categorie
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // Handler voor het openen van een video
  const handleOpenVideo = (video) => {
    setSelectedVideo(video);
    
    if (onVideoView) {
      onVideoView(video.id);
    }
  };
  
  // Handler voor het sluiten van een video
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };
  
  // Handler voor het bookmarken van een video
  const handleBookmark = (videoId) => {
    const newBookmarkedVideos = {
      ...bookmarkedVideos,
      [videoId]: !bookmarkedVideos[videoId]
    };
    
    setBookmarkedVideos(newBookmarkedVideos);
    
    if (onBookmark) {
      onBookmark(videoId, newBookmarkedVideos[videoId]);
    }
  };
  
  // Formatteren van de video duur
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {showSearch && (
          <TextField
            fullWidth
            placeholder="Zoek in videotutorials..."
            value={searchQuery}
            onChange={handleSearchChange}
            margin="normal"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
        
        {showCategories && uniqueCategories.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Alle categorieën"
              clickable
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              onClick={() => handleCategoryChange('all')}
              icon={<CategoryIcon />}
            />
            {uniqueCategories.map(category => (
              <Chip
                key={category}
                label={category}
                clickable
                color={selectedCategory === category ? 'primary' : 'default'}
                onClick={() => handleCategoryChange(category)}
              />
            ))}
          </Box>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {filteredVideos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PlayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Geen videotutorials gevonden voor "{searchQuery}".
          </Typography>
          {searchQuery && (
            <Button
              variant="text"
              color="primary"
              onClick={() => setSearchQuery('')}
              sx={{ mt: 1 }}
            >
              Wis zoekopdracht
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <CardActionArea onClick={() => handleOpenVideo(video)}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={video.thumbnail}
                      alt={video.title}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <PlayIcon sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    {video.duration && (
                      <Chip
                        label={formatDuration(video.duration)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                        icon={<TimeIcon sx={{ color: 'white !important', fontSize: '0.8rem !important' }} />}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom noWrap>
                      {video.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1
                      }}
                    >
                      {video.description}
                    </Typography>
                    {video.category && (
                      <Chip
                        label={video.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </CardContent>
                </CardActionArea>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(video.id);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  aria-label={bookmarkedVideos[video.id] ? "Verwijder bladwijzer" : "Voeg bladwijzer toe"}
                >
                  {bookmarkedVideos[video.id] ? (
                    <BookmarkIcon color="primary" />
                  ) : (
                    <BookmarkBorderIcon />
                  )}
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Video Dialog */}
      <Dialog
        open={!!selectedVideo}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedVideo && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                {selectedVideo.title}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseVideo}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ position: 'relative', pb: '56.25%', height: 0, mb: 2 }}>
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px'
                  }}
                />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedVideo.description}
              </Typography>
              {selectedVideo.category && (
                <Chip
                  label={selectedVideo.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
              )}
              {selectedVideo.duration && (
                <Chip
                  label={`Duur: ${formatDuration(selectedVideo.duration)}`}
                  size="small"
                  icon={<TimeIcon />}
                  variant="outlined"
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={bookmarkedVideos[selectedVideo.id] ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={() => handleBookmark(selectedVideo.id)}
                color="primary"
              >
                {bookmarkedVideos[selectedVideo.id] ? "Verwijder bladwijzer" : "Voeg bladwijzer toe"}
              </Button>
              <Button onClick={handleCloseVideo} color="primary">
                Sluiten
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

VideoTutorials.propTypes = {
  /**
   * De titel van de videotutorials sectie
   */
  title: PropTypes.string,
  
  /**
   * De lijst met videotutorials
   */
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      videoUrl: PropTypes.string.isRequired,
      category: PropTypes.string,
      duration: PropTypes.number // in seconden
    })
  ),
  
  /**
   * De lijst met categorieën
   */
  categories: PropTypes.arrayOf(PropTypes.string),
  
  /**
   * Of de zoekfunctionaliteit moet worden getoond
   */
  showSearch: PropTypes.bool,
  
  /**
   * Of de categorieën moeten worden getoond
   */
  showCategories: PropTypes.bool,
  
  /**
   * Callback functie die wordt aangeroepen wanneer een video wordt bekeken
   */
  onVideoView: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer een video wordt gebookmarkt
   */
  onBookmark: PropTypes.func
};

export default VideoTutorials;
