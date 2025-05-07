/**
 * InteractionsByPageChart.jsx
 * 
 * Component voor het visualiseren van help interacties per pagina.
 * Gebruikt een bar chart om de verdeling van interacties over verschillende pagina's weer te geven.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * InteractionsByPageChart Component
 * 
 * Visualiseert de verdeling van help interacties per pagina met een bar chart.
 * 
 * @component
 */
const InteractionsByPageChart = ({ data, loading }) => {
  const theme = useTheme();
  
  // Als er geen data is of als we aan het laden zijn, toon een skeleton
  if (loading || !data) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Box>
    );
  }
  
  // Transformeer de data naar een formaat dat Recharts kan gebruiken
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: formatPageName(key),
    value: value
  }));
  
  // Sorteer de data op waarde (aflopend)
  chartData.sort((a, b) => b.value - a.value);
  
  // Beperk het aantal pagina's tot de top 10
  const topData = chartData.slice(0, 10);
  
  // Helper functie voor het formatteren van pagina namen
  function formatPageName(page) {
    // Map van pagina namen naar gebruiksvriendelijke labels
    const pageMap = {
      'dashboard': 'Dashboard',
      'report': 'Rapportage',
      'sentiment': 'Sentiment Analyse',
      'trends': 'Trends',
      'awareness': 'Topic Awareness',
      'market-insights': 'Markt Inzichten'
    };
    
    return pageMap[page] || page;
  }
  
  // Custom tooltip voor de chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="body2" color="text.primary">
            <strong>{label}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aantal interacties: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    
    return null;
  };
  
  // Als er geen data is, toon een melding
  if (chartData.length === 0) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen interactie data beschikbaar voor de geselecteerde filters.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Interacties">
            {topData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={theme.palette.primary.main} 
                fillOpacity={1 - (index * 0.1)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

InteractionsByPageChart.propTypes = {
  /**
   * Data voor de chart
   */
  data: PropTypes.object,
  
  /**
   * Loading state
   */
  loading: PropTypes.bool
};

InteractionsByPageChart.defaultProps = {
  loading: false
};

export default InteractionsByPageChart;
