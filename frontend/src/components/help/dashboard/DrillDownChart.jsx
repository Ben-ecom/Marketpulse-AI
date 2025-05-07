/**
 * DrillDownChart.jsx
 * 
 * Interactieve grafiek component met drill-down functionaliteit.
 * Stelt gebruikers in staat om dieper in de gegevens te duiken door op grafiekelements te klikken.
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button,
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowBack, ZoomIn } from '@mui/icons-material';

// Kleuren voor de grafieken
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'
];

/**
 * DrillDownChart Component
 * 
 * @component
 */
const DrillDownChart = ({ data, loading, title, type = 'bar', drilldownKey = 'children' }) => {
  // State voor drill-down navigatie
  const [drillPath, setDrillPath] = useState([]);
  const [currentData, setCurrentData] = useState(data);
  
  // Update data wanneer de prop verandert
  React.useEffect(() => {
    if (drillPath.length === 0) {
      setCurrentData(data);
    } else {
      // Navigeer naar het huidige pad in de data
      let tempData = data;
      drillPath.forEach(path => {
        tempData = tempData.find(item => item.name === path.name)[drilldownKey];
      });
      setCurrentData(tempData);
    }
  }, [data, drillPath, drilldownKey]);
  
  // Handler voor drill-down
  const handleDrillDown = useCallback((item) => {
    if (item && item[drilldownKey] && item[drilldownKey].length > 0) {
      setDrillPath(prev => [...prev, { name: item.name, data: item }]);
    }
  }, [drilldownKey]);
  
  // Handler voor navigatie terug
  const handleBack = useCallback(() => {
    setDrillPath(prev => prev.slice(0, -1));
  }, []);
  
  // Handler voor reset naar hoofdniveau
  const handleReset = useCallback(() => {
    setDrillPath([]);
  }, []);
  
  // Handler voor breadcrumb navigatie
  const handleBreadcrumbClick = useCallback((index) => {
    setDrillPath(prev => prev.slice(0, index));
  }, []);
  
  // Bereken huidige titel
  const currentTitle = useMemo(() => {
    if (drillPath.length === 0) {
      return title;
    }
    return `${title} - ${drillPath[drillPath.length - 1].name}`;
  }, [title, drillPath]);
  
  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    if (drillPath.length === 0) return null;
    
    return (
      <Breadcrumbs aria-label="drill-down-path" sx={{ mb: 2 }}>
        <Link 
          component="button" 
          underline="hover" 
          color="inherit" 
          onClick={handleReset}
        >
          {title}
        </Link>
        
        {drillPath.map((path, index) => {
          const isLast = index === drillPath.length - 1;
          
          return isLast ? (
            <Typography color="text.primary" key={`path-${index}`}>
              {path.name}
            </Typography>
          ) : (
            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => handleBreadcrumbClick(index + 1)}
              key={`path-${index}`}
            >
              {path.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  // Render bar chart
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={currentData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70} 
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#8884d8" 
            onClick={handleDrillDown}
            cursor={item => item[drilldownKey] && item[drilldownKey].length > 0 ? 'pointer' : 'default'}
          >
            {currentData && currentData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render pie chart
  const renderPieChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={currentData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            onClick={handleDrillDown}
            cursor={item => item[drilldownKey] && item[drilldownKey].length > 0 ? 'pointer' : 'default'}
          >
            {currentData && currentData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render no data state
  if (!currentData || currentData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Geen gegevens beschikbaar
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {currentTitle}
        </Typography>
        
        {drillPath.length > 0 && (
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
            size="small"
            variant="outlined"
          >
            Terug
          </Button>
        )}
      </Box>
      
      {renderBreadcrumbs()}
      
      <Box sx={{ position: 'relative' }}>
        {type === 'bar' ? renderBarChart() : renderPieChart()}
        
        <Box sx={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '4px',
          borderRadius: '4px'
        }}>
          <Tooltip title="Klik op een item om in te zoomen">
            <ZoomIn fontSize="small" color="action" />
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

DrillDownChart.propTypes = {
  /**
   * De data voor de grafiek
   */
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    children: PropTypes.array
  })),
  
  /**
   * Geeft aan of de data wordt geladen
   */
  loading: PropTypes.bool,
  
  /**
   * De titel van de grafiek
   */
  title: PropTypes.string.isRequired,
  
  /**
   * Het type grafiek ('bar' of 'pie')
   */
  type: PropTypes.oneOf(['bar', 'pie']),
  
  /**
   * De key in de data objecten die de drill-down data bevat
   */
  drilldownKey: PropTypes.string
};

export default DrillDownChart;
