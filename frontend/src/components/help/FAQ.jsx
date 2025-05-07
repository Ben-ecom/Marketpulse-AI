import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Paper,
  Button,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';

/**
 * FAQ Component
 * 
 * Een component dat veelgestelde vragen en antwoorden toont met zoek- en filterfunctionaliteit.
 * 
 * @component
 * @example
 * ```jsx
 * <FAQ
 *   title="Veelgestelde vragen"
 *   faqItems={faqData}
 *   onFeedback={(questionId, helpful) => console.log(questionId, helpful)}
 * />
 * ```
 */
const FAQ = ({
  title = 'Veelgestelde vragen',
  faqItems = [],
  categories = [],
  showSearch = true,
  showCategories = true,
  showFeedback = true,
  onFeedback,
  maxHeight = 600
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  const [feedbackGiven, setFeedbackGiven] = useState({});
  
  // Filter FAQ items op basis van zoekopdracht en categorie
  const filteredFaqItems = useMemo(() => {
    return faqItems.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqItems, searchQuery, selectedCategory]);
  
  // Unieke categorieën uit faqItems
  const uniqueCategories = useMemo(() => {
    const categoriesFromItems = faqItems
      .map(item => item.category)
      .filter((value, index, self) => value && self.indexOf(value) === index);
    
    return categories.length > 0 ? categories : categoriesFromItems;
  }, [faqItems, categories]);
  
  // Handler voor het wijzigen van de zoekopdracht
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handler voor het wijzigen van de categorie
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // Handler voor het uitklappen/inklappen van een FAQ item
  const handleAccordionChange = (itemId) => (event, isExpanded) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: isExpanded
    }));
  };
  
  // Handler voor feedback
  const handleFeedback = (itemId) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [itemId]: true
    }));
    
    if (onFeedback) {
      onFeedback(itemId);
    }
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        maxHeight: maxHeight,
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      {showSearch && (
        <TextField
          fullWidth
          placeholder="Zoek in veelgestelde vragen..."
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
      
      <Divider sx={{ mb: 2 }} />
      
      {filteredFaqItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <QuestionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Geen veelgestelde vragen gevonden voor "{searchQuery}".
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
        filteredFaqItems.map((item, index) => (
          <Accordion
            key={item.id || index}
            expanded={expandedItems[item.id || index] || false}
            onChange={handleAccordionChange(item.id || index)}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px !important',
              overflow: 'hidden'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-${item.id || index}-content`}
              id={`faq-${item.id || index}-header`}
              sx={{
                backgroundColor: theme.palette.background.default,
                '&.Mui-expanded': {
                  minHeight: 48,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestionIcon
                  sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }}
                />
                <Typography variant="subtitle1">{item.question}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                {item.answer}
              </Typography>
              
              {showFeedback && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  {feedbackGiven[item.id || index] ? (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FeedbackIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Bedankt voor je feedback!
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<FeedbackIcon />}
                      onClick={() => handleFeedback(item.id || index)}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Geef feedback
                    </Button>
                  )}
                </Box>
              )}
              
              {item.category && (
                <Chip
                  label={item.category}
                  size="small"
                  sx={{ mt: 1 }}
                  color="primary"
                  variant="outlined"
                />
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

FAQ.propTypes = {
  /**
   * De titel van de FAQ sectie
   */
  title: PropTypes.string,
  
  /**
   * De lijst met FAQ items
   */
  faqItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      question: PropTypes.string.isRequired,
      answer: PropTypes.node.isRequired,
      category: PropTypes.string
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
   * Of de feedback functionaliteit moet worden getoond
   */
  showFeedback: PropTypes.bool,
  
  /**
   * Callback functie die wordt aangeroepen wanneer feedback wordt gegeven
   */
  onFeedback: PropTypes.func,
  
  /**
   * De maximale hoogte van de FAQ component
   */
  maxHeight: PropTypes.number
};

export default FAQ;
