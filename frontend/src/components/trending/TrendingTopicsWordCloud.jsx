import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Tooltip,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as d3 from 'd3';
import d3Cloud from 'd3-cloud';

/**
 * Word Cloud component voor het visualiseren van trending topics
 */
const TrendingTopicsWordCloud = ({ 
  topics = [], 
  width = 600, 
  height = 400, 
  maxTopics = 100,
  colorScheme = 'schemeBlues',
  onTopicClick = null,
  isLoading = false
}) => {
  const theme = useTheme();
  const svgRef = useRef(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Effect voor het tekenen van de word cloud
  useEffect(() => {
    if (isLoading || !topics || topics.length === 0 || !svgRef.current) {
      return;
    }
    
    // Bereid data voor
    const data = topics
      .slice(0, maxTopics)
      .map(topic => ({
        text: topic.topic,
        value: Math.max(10, Math.log(topic.frequency) * 10),
        frequency: topic.frequency,
        growth: topic.growth,
        trendingScore: topic.trendingScore,
        isNew: topic.isNew
      }));
    
    // Maak kleurenschaal
    const color = d3.scaleOrdinal(d3[colorScheme][9]);
    
    // Maak layout
    const layout = d3Cloud()
      .size([width, height])
      .words(data)
      .padding(5)
      .rotate(() => 0)
      .fontSize(d => d.value * 2)
      .on('end', draw);
    
    // Start layout berekening
    layout.start();
    
    // Teken word cloud
    function draw(words) {
      // Clear bestaande content
      d3.select(svgRef.current).selectAll('*').remove();
      
      // Teken woorden
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
      
      svg.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Inter, sans-serif')
        .style('font-weight', d => d.isNew ? 'bold' : 'normal')
        .style('fill', (d, i) => d.isNew ? theme.palette.secondary.main : color(i))
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('font-size', `${d.size * 1.2}px`)
            .style('font-weight', 'bold');
          
          setTooltipContent({
            topic: d.text,
            frequency: d.frequency,
            growth: d.growth,
            trendingScore: d.trendingScore,
            isNew: d.isNew
          });
          
          setTooltipPosition({
            x: event.pageX,
            y: event.pageY
          });
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('font-size', `${d.size}px`)
            .style('font-weight', d.isNew ? 'bold' : 'normal');
          
          setTooltipContent(null);
        })
        .on('click', function(event, d) {
          setSelectedTopic(d.text);
          
          if (onTopicClick) {
            onTopicClick(d.text);
          }
        });
    }
  }, [topics, width, height, maxTopics, colorScheme, isLoading, theme, onTopicClick]);
  
  return (
    <Paper elevation={0} sx={{ p: 2, height: '100%', position: 'relative' }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : topics.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body2" color="text.secondary">
            Geen trending topics gevonden
          </Typography>
        </Box>
      ) : (
        <Box height="100%" display="flex" flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" gutterBottom>
              Trending Topics Word Cloud
            </Typography>
            
            {selectedTopic && (
              <Chip 
                label={selectedTopic} 
                color="primary" 
                onDelete={() => {
                  setSelectedTopic(null);
                  if (onTopicClick) onTopicClick(null);
                }} 
              />
            )}
          </Box>
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <svg ref={svgRef} width={width} height={height} />
          </Box>
          
          {/* Tooltip */}
          {tooltipContent && (
            <Box
              sx={{
                position: 'fixed',
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 1,
                p: 1,
                zIndex: 9999,
                maxWidth: 200
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                {tooltipContent.topic}
                {tooltipContent.isNew && (
                  <Chip 
                    label="Nieuw" 
                    color="secondary" 
                    size="small" 
                    sx={{ ml: 1, height: 20 }} 
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frequentie: {tooltipContent.frequency}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Groei: {tooltipContent.growth}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trending Score: {tooltipContent.trendingScore}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

TrendingTopicsWordCloud.propTypes = {
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      topic: PropTypes.string.isRequired,
      frequency: PropTypes.number.isRequired,
      growth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      trendingScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      isNew: PropTypes.bool
    })
  ),
  width: PropTypes.number,
  height: PropTypes.number,
  maxTopics: PropTypes.number,
  colorScheme: PropTypes.string,
  onTopicClick: PropTypes.func,
  isLoading: PropTypes.bool
};

export default TrendingTopicsWordCloud;
