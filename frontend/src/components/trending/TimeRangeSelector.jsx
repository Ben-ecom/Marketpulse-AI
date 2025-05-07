import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Paper, Typography, Slider, Button, ButtonGroup, FormControl,
  InputLabel, Select, MenuItem, TextField, IconButton, Tooltip, useTheme
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

/**
 * Component voor het selecteren van een tijdsbereik met zoom- en panfunctionaliteit
 */
const TimeRangeSelector = ({
  timePoints = [],
  rawTimePoints = [],
  initialStartIndex = 0,
  initialEndIndex = null,
  onRangeChange,
  onTimeframeChange
}) => {
  const theme = useTheme();
  
  // Bereken standaard eindindex
  const defaultEndIndex = initialEndIndex !== null 
    ? initialEndIndex 
    : Math.min(initialStartIndex + 20, timePoints.length - 1);
  
  // State voor tijdsbereik
  const [range, setRange] = useState([initialStartIndex, defaultEndIndex]);
  const [timeframe, setTimeframe] = useState('custom');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Bereken zichtbare datums
  const visibleDates = range.map(index => {
    if (index < 0 || index >= timePoints.length) return '';
    return timePoints[index];
  });
  
  // Effect om range te updaten wanneer timePoints verandert
  useEffect(() => {
    if (timePoints.length > 0) {
      const endIndex = Math.min(initialStartIndex + 20, timePoints.length - 1);
      setRange([initialStartIndex, endIndex]);
    }
  }, [timePoints, initialStartIndex]);
  
  // Handler voor range wijziging
  const handleRangeChange = (event, newValue) => {
    setRange(newValue);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newValue[0],
        endIndex: newValue[1],
        startDate: rawTimePoints[newValue[0]],
        endDate: rawTimePoints[newValue[1]]
      });
    }
  };
  
  // Handler voor timeframe wijziging
  const handleTimeframeChange = (event) => {
    const value = event.target.value;
    setTimeframe(value);
    
    // Bereken nieuwe range op basis van timeframe
    let newStartIndex = 0;
    let newEndIndex = timePoints.length - 1;
    
    switch (value) {
      case 'day':
        newEndIndex = timePoints.length - 1;
        newStartIndex = Math.max(0, newEndIndex - 24); // Laatste 24 uur (bij uursintervallen)
        break;
      case 'week':
        newEndIndex = timePoints.length - 1;
        newStartIndex = Math.max(0, newEndIndex - 7); // Laatste 7 dagen
        break;
      case 'month':
        newEndIndex = timePoints.length - 1;
        newStartIndex = Math.max(0, newEndIndex - 30); // Laatste 30 dagen
        break;
      case 'quarter':
        newEndIndex = timePoints.length - 1;
        newStartIndex = Math.max(0, newEndIndex - 90); // Laatste 90 dagen
        break;
      case 'year':
        newEndIndex = timePoints.length - 1;
        newStartIndex = Math.max(0, newEndIndex - 365); // Laatste 365 dagen
        break;
      case 'all':
        newStartIndex = 0;
        newEndIndex = timePoints.length - 1;
        break;
      default:
        // 'custom' - behoud huidige range
        return;
    }
    
    setRange([newStartIndex, newEndIndex]);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
    
    if (onTimeframeChange) {
      onTimeframeChange(value);
    }
  };
  
  // Handler voor zoom in
  const handleZoomIn = () => {
    const currentWidth = range[1] - range[0];
    const newWidth = Math.max(5, Math.floor(currentWidth * 0.7)); // Zoom in met 30%
    const center = Math.floor((range[0] + range[1]) / 2);
    
    const newStartIndex = Math.max(0, center - Math.floor(newWidth / 2));
    const newEndIndex = Math.min(timePoints.length - 1, newStartIndex + newWidth);
    
    setRange([newStartIndex, newEndIndex]);
    setZoomLevel(zoomLevel + 1);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
  };
  
  // Handler voor zoom out
  const handleZoomOut = () => {
    const currentWidth = range[1] - range[0];
    const newWidth = Math.min(timePoints.length - 1, Math.floor(currentWidth * 1.5)); // Zoom out met 50%
    const center = Math.floor((range[0] + range[1]) / 2);
    
    const newStartIndex = Math.max(0, center - Math.floor(newWidth / 2));
    const newEndIndex = Math.min(timePoints.length - 1, newStartIndex + newWidth);
    
    setRange([newStartIndex, newEndIndex]);
    setZoomLevel(Math.max(1, zoomLevel - 1));
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
  };
  
  // Handler voor pan links
  const handlePanLeft = () => {
    const currentWidth = range[1] - range[0];
    const panAmount = Math.max(1, Math.floor(currentWidth * 0.3)); // Pan met 30% van huidige breedte
    
    const newStartIndex = Math.max(0, range[0] - panAmount);
    const newEndIndex = newStartIndex + currentWidth;
    
    setRange([newStartIndex, newEndIndex]);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
  };
  
  // Handler voor pan rechts
  const handlePanRight = () => {
    const currentWidth = range[1] - range[0];
    const panAmount = Math.max(1, Math.floor(currentWidth * 0.3)); // Pan met 30% van huidige breedte
    
    const newEndIndex = Math.min(timePoints.length - 1, range[1] + panAmount);
    const newStartIndex = Math.max(0, newEndIndex - currentWidth);
    
    setRange([newStartIndex, newEndIndex]);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
  };
  
  // Handler voor reset
  const handleReset = () => {
    const newEndIndex = timePoints.length - 1;
    const newStartIndex = 0;
    
    setRange([newStartIndex, newEndIndex]);
    setTimeframe('all');
    setZoomLevel(1);
    
    if (onRangeChange) {
      onRangeChange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
        startDate: rawTimePoints[newStartIndex],
        endDate: rawTimePoints[newEndIndex]
      });
    }
    
    if (onTimeframeChange) {
      onTimeframeChange('all');
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Tijdsbereik
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="timeframe-label">Periode</InputLabel>
          <Select
            labelId="timeframe-label"
            id="timeframe-select"
            value={timeframe}
            label="Periode"
            onChange={handleTimeframeChange}
          >
            <MenuItem value="day">Dag</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Maand</MenuItem>
            <MenuItem value="quarter">Kwartaal</MenuItem>
            <MenuItem value="year">Jaar</MenuItem>
            <MenuItem value="all">Alles</MenuItem>
            <MenuItem value="custom">Aangepast</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ px: 2, mb: 2 }}>
        <Slider
          value={range}
          onChange={handleRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={timePoints.length - 1}
          valueLabelFormat={(index) => timePoints[index] || ''}
          disabled={timePoints.length <= 1}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Van: {visibleDates[0]}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Tot: {visibleDates[1]}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <ButtonGroup size="small">
          <Tooltip title="Pan links">
            <Button onClick={handlePanLeft} disabled={range[0] <= 0}>
              <ArrowBackIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="Pan rechts">
            <Button onClick={handlePanRight} disabled={range[1] >= timePoints.length - 1}>
              <ArrowForwardIcon fontSize="small" />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="small">
          <Tooltip title="Zoom in">
            <Button onClick={handleZoomIn} disabled={range[1] - range[0] <= 5}>
              <ZoomInIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="Zoom out">
            <Button onClick={handleZoomOut} disabled={range[1] - range[0] >= timePoints.length - 1}>
              <ZoomOutIcon fontSize="small" />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <Tooltip title="Reset bereik">
          <Button size="small" onClick={handleReset} startIcon={<RefreshIcon />}>
            Reset
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
};

TimeRangeSelector.propTypes = {
  timePoints: PropTypes.array.isRequired,
  rawTimePoints: PropTypes.array,
  initialStartIndex: PropTypes.number,
  initialEndIndex: PropTypes.number,
  onRangeChange: PropTypes.func,
  onTimeframeChange: PropTypes.func
};

export default TimeRangeSelector;
