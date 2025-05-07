import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Rating, 
  Grid,
  Skeleton,
  Divider,
  Chip
} from '@mui/material';
import ReviewsFilter from './ReviewsFilter';

/**
 * Component voor het weergeven van reviews met filtering functionaliteit
 * Integreert met de bestaande backend API voor reviews
 */
const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simuleer het ophalen van reviews van de backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // In een echte implementatie zou dit een API call zijn
        // const response = await api.get(`/reviews/${productId}`);
        
        // Mock data voor demonstratie
        const mockReviews = [
          {
            id: 1,
            author: 'Jan Jansen',
            rating: 4,
            date: '2025-04-15',
            content: 'Goed product, werkt zoals verwacht. Snelle levering.',
            type: 'product'
          },
          {
            id: 2,
            author: 'Petra Peters',
            rating: 5,
            date: '2025-04-10',
            content: 'Uitstekende klantenservice! Mijn vraag werd snel beantwoord.',
            type: 'service'
          },
          {
            id: 3,
            author: 'Thomas Thomassen',
            rating: 3,
            date: '2025-04-05',
            content: 'Product is ok, maar niet zo duurzaam als ik had gehoopt.',
            type: 'product'
          },
          {
            id: 4,
            author: 'Lisa Linden',
            rating: 2,
            date: '2025-04-01',
            content: 'Levering duurde langer dan aangegeven, maar het product zelf is goed.',
            type: 'service'
          },
          {
            id: 5,
            author: 'Kees Karelsen',
            rating: 5,
            date: '2025-03-28',
            content: 'Fantastisch product! Precies wat ik nodig had.',
            type: 'product'
          }
        ];
        
        setReviews(mockReviews);
        setFilteredReviews(mockReviews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Er is een fout opgetreden bij het ophalen van reviews.');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId]);
  
  // Filter reviews op basis van type
  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.type === filterType));
    }
  };
  
  // Formatteren van datum
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };
  
  if (error) {
    return (
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Klantreviews
      </Typography>
      
      <ReviewsFilter onFilterChange={handleFilterChange} />
      
      {loading ? (
        // Skeleton loader tijdens het laden
        Array.from(new Array(3)).map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width={120} />
              </Box>
              <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </CardContent>
          </Card>
        ))
      ) : filteredReviews.length > 0 ? (
        <Grid container spacing={2}>
          {filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card sx={{ mb: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2 }}>{review.author.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{review.author}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.date)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Rating value={review.rating} readOnly precision={0.5} />
                  </Box>
                  
                  <Typography variant="body2">{review.content}</Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={review.type === 'product' ? 'Product' : 'Service'} 
                      color={review.type === 'product' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Geen reviews gevonden met de huidige filter.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReviewsList;
