import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as d3 from 'd3';

/**
 * Bar Chart component voor het visualiseren van trending topics
 */
const TrendingTopicsBarChart = ({ 
  topics = [], 
  width = 600, 
  height = 400, 
  maxTopics = 20,
  onTopicClick = null,
  isLoading = false
}) => {
  const theme = useTheme();
  const svgRef = useRef(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sortBy, setSortBy] = useState('trendingScore');
  
  // Effect voor het tekenen van de bar chart
  useEffect(() => {
    if (isLoading || !topics || topics.length === 0 || !svgRef.current) {
      return;
    }
    
    // Bereid data voor
    const data = [...topics]
      .sort((a, b) => {
        if (sortBy === 'frequency') {
          return b.frequency - a.frequency;
        } else if (sortBy === 'growth') {
          return parseFloat(b.growth) - parseFloat(a.growth);
        } else {
          return parseFloat(b.trendingScore) - parseFloat(a.trendingScore);
        }
      })
      .slice(0, maxTopics);
    
    // Clear bestaande content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Maak SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Definieer marges
    const margin = { top: 20, right: 30, bottom: 90, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Maak scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.topic))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => {
        if (sortBy === 'frequency') {
          return d.frequency;
        } else if (sortBy === 'growth') {
          return parseFloat(d.growth);
        } else {
          return parseFloat(d.trendingScore);
        }
      }) * 1.1])
      .range([innerHeight, 0]);
    
    // Maak groep voor de inhoud
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Teken x-as
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '10px');
    
    // Teken y-as
    g.append('g')
      .call(d3.axisLeft(y));
    
    // Teken y-as label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(sortBy === 'frequency' ? 'Frequentie' : 
            sortBy === 'growth' ? 'Groei (%)' : 
            'Trending Score');
    
    // Teken bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.topic))
      .attr('y', d => {
        const value = sortBy === 'frequency' ? d.frequency : 
                     sortBy === 'growth' ? parseFloat(d.growth) : 
                     parseFloat(d.trendingScore);
        return y(value);
      })
      .attr('width', x.bandwidth())
      .attr('height', d => {
        const value = sortBy === 'frequency' ? d.frequency : 
                     sortBy === 'growth' ? parseFloat(d.growth) : 
                     parseFloat(d.trendingScore);
        return innerHeight - y(value);
      })
      .attr('fill', d => {
        if (d.isNew) {
          return theme.palette.secondary.main;
        } else if (d.topic === selectedTopic) {
          return theme.palette.primary.main;
        } else {
          return theme.palette.primary.light;
        }
      })
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', theme.palette.primary.dark);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d.isNew ? theme.palette.secondary.main : 
                        d.topic === selectedTopic ? theme.palette.primary.main : 
                        theme.palette.primary.light);
      })
      .on('click', function(event, d) {
        setSelectedTopic(d.topic === selectedTopic ? null : d.topic);
        
        if (onTopicClick) {
          onTopicClick(d.topic === selectedTopic ? null : d.topic);
        }
      });
    
    // Teken labels op bars
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.topic) + x.bandwidth() / 2)
      .attr('y', d => {
        const value = sortBy === 'frequency' ? d.frequency : 
                     sortBy === 'growth' ? parseFloat(d.growth) : 
                     parseFloat(d.trendingScore);
        return y(value) - 5;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text(d => {
        const value = sortBy === 'frequency' ? d.frequency : 
                     sortBy === 'growth' ? `${parseFloat(d.growth).toFixed(0)}%` : 
                     parseFloat(d.trendingScore).toFixed(1);
        return value;
      });
    
    // Teken "Nieuw" labels voor nieuwe topics
    g.selectAll('.new-label')
      .data(data.filter(d => d.isNew))
      .enter()
      .append('text')
      .attr('class', 'new-label')
      .attr('x', d => x(d.topic) + x.bandwidth() / 2)
      .attr('y', d => {
        const value = sortBy === 'frequency' ? d.frequency : 
                     sortBy === 'growth' ? parseFloat(d.growth) : 
                     parseFloat(d.trendingScore);
        return y(value) - 20;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', theme.palette.secondary.main)
      .style('font-weight', 'bold')
      .text('Nieuw');
    
  }, [topics, width, height, maxTopics, sortBy, selectedTopic, isLoading, theme, onTopicClick]);
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
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
            <Typography variant="subtitle1">
              Top Trending Topics
            </Typography>
            
            <Box display="flex" alignItems="center">
              {selectedTopic && (
                <Chip 
                  label={selectedTopic} 
                  color="primary" 
                  size="small"
                  onDelete={() => {
                    setSelectedTopic(null);
                    if (onTopicClick) onTopicClick(null);
                  }}
                  sx={{ mr: 2 }}
                />
              )}
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-select-label">Sorteren op</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={sortBy}
                  label="Sorteren op"
                  onChange={handleSortChange}
                >
                  <MenuItem value="trendingScore">Trending Score</MenuItem>
                  <MenuItem value="frequency">Frequentie</MenuItem>
                  <MenuItem value="growth">Groei</MenuItem>
                </Select>
              </FormControl>
            </Box>
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
        </Box>
      )}
    </Paper>
  );
};

TrendingTopicsBarChart.propTypes = {
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
  onTopicClick: PropTypes.func,
  isLoading: PropTypes.bool
};

export default TrendingTopicsBarChart;
