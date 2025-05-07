import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert } from '@mui/material';
import { prepareTopicTrendsData } from '../../utils/trending/trendVisualization';
import { getTopicTimeseries } from '../../utils/trending/topicExtraction';
import { normalizeTimeseries } from '../../utils/trending/topicNormalization';
import { addEventAnnotations } from '../../utils/trending/eventAnnotation';

/**
 * Component die data verwerkt en beschikbaar maakt voor de TrendingTopicsTimeline
 * Handelt data fetching, transformatie en normalisatie
 */
const TopicTrendsDataProvider = ({
  rawData = [],
  eventsData = [],
  timeframe = 'all',
  options = {},
  children,
  onDataProcessed = null
}) => {
  // State voor verwerkte data
  const [processedData, setProcessedData] = useState(null);
  const [processedEvents, setProcessedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Opties voor data verwerking
  const {
    topicField = 'topic',
    timestampField = 'timestamp',
    normalize = true,
    smoothing = true,
    includeEvents = true,
    topN = 20,
    selectedTopics = []
  } = options;
  
  // Functie om data te verwerken
  const processData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      if (!rawData || rawData.length === 0) {
        setProcessedData(null);
        setLoading(false);
        return;
      }
      
      // Bepaal tijdsperiode op basis van timeframe
      const now = new Date();
      let startDate = null;
      let endDate = now;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          // 'all' - gebruik alle data
          startDate = null;
      }
      
      // Genereer tijdreeksdata
      const interval = timeframe === 'day' ? 'hour' : 
                      timeframe === 'week' ? 'day' : 
                      timeframe === 'month' ? 'day' : 
                      timeframe === 'quarter' ? 'week' : 
                      timeframe === 'year' ? 'month' : 'day';
      
      const timeseriesOptions = {
        startDate,
        endDate,
        interval,
        topicField,
        timestampField,
        topics: selectedTopics.length > 0 ? selectedTopics : [],
        topN: selectedTopics.length > 0 ? selectedTopics.length : topN
      };
      
      let timeseriesData = getTopicTimeseries(rawData, timeseriesOptions);
      
      // Normaliseer data indien nodig
      if (normalize || smoothing) {
        const normalizeOptions = {
          windowSize: smoothing ? 3 : 0,
          removeOutliers: smoothing
        };
        
        timeseriesData = normalizeTimeseries(timeseriesData, normalizeOptions);
        
        // Gebruik genormaliseerde series indien beschikbaar
        if (timeseriesData.normalizedSeries) {
          timeseriesData.series = timeseriesData.normalizedSeries;
          delete timeseriesData.normalizedSeries;
        }
      }
      
      // Voeg event annotaties toe indien nodig
      if (includeEvents && eventsData && eventsData.length > 0) {
        timeseriesData = addEventAnnotations(timeseriesData, eventsData);
      }
      
      // Bereid data voor voor visualisatie
      const visualizationOptions = {
        timeframe,
        topN,
        selectedTopics,
        normalize
      };
      
      const preparedData = prepareTopicTrendsData(timeseriesData, visualizationOptions);
      
      // Verwerk events
      const processedEventsData = eventsData.map(event => ({
        ...event,
        date: new Date(event.date || event.timestamp)
      }));
      
      // Update state
      setProcessedData(timeseriesData);
      setProcessedEvents(processedEventsData);
      
      // Callback met verwerkte data
      if (onDataProcessed) {
        onDataProcessed({
          timeseriesData,
          preparedData,
          events: processedEventsData
        });
      }
    } catch (err) {
      console.error('Error processing topic trends data:', err);
      setError('Er is een fout opgetreden bij het verwerken van de trending topics data.');
    } finally {
      setLoading(false);
    }
  }, [rawData, eventsData, timeframe, options, topicField, timestampField, normalize, smoothing, includeEvents, topN, selectedTopics, onDataProcessed]);
  
  // Verwerk data bij wijzigingen
  useEffect(() => {
    processData();
  }, [processData]);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }
  
  // Render children met data props
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        topicsData: processedData,
        eventsData: processedEvents,
        loading,
        error
      });
    }
    return child;
  });
};

TopicTrendsDataProvider.propTypes = {
  rawData: PropTypes.array,
  eventsData: PropTypes.array,
  timeframe: PropTypes.oneOf(['day', 'week', 'month', 'quarter', 'year', 'all']),
  options: PropTypes.shape({
    topicField: PropTypes.string,
    timestampField: PropTypes.string,
    normalize: PropTypes.bool,
    smoothing: PropTypes.bool,
    includeEvents: PropTypes.bool,
    topN: PropTypes.number,
    selectedTopics: PropTypes.array
  }),
  children: PropTypes.node.isRequired,
  onDataProcessed: PropTypes.func
};

export default TopicTrendsDataProvider;
