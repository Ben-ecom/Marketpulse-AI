/**
 * InteractionsByTypeChart.jsx
 * 
 * Component voor het visualiseren van help interacties per type.
 * Gebruikt een donut chart om de verdeling van interacties over verschillende types weer te geven.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * InteractionsByTypeChart Component
 * 
 * Visualiseert de verdeling van help interacties per type met een donut chart.
 * 
 * @component
 */
const InteractionsByTypeChart = ({ data, loading }) => {
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
    name: formatInteractionType(key),
    value: value
  }));
  
  // Sorteer de data op waarde (aflopend)
  chartData.sort((a, b) => b.value - a.value);
  
  // Kleuren voor de chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    // Meer kleuren voor als er meer types zijn
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.error.light,
    theme.palette.info.light,
  ];
  
  // Helper functie voor het formatteren van interactie types
  function formatInteractionType(type) {
    // Map van interactie types naar gebruiksvriendelijke labels
    const typeMap = {
      'view': 'Bekeken',
      'open_help': 'Help geopend',
      'close_help': 'Help gesloten',
      'view_help_point': 'Help punt bekeken',
      'close_help_point': 'Help punt gesloten',
      'view_video': 'Video bekeken',
      'learn_more': 'Meer info bekeken',
      'search': 'Zoekopdracht',
      'navigate': 'Navigatie',
      'feedback': 'Feedback gegeven'
    };
    
    return typeMap[type] || type;
  }
  
  // Custom tooltip voor de chart
  const CustomTooltip = ({ active, payload }) => {
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
            <strong>{payload[0].name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aantal: {payload[0].value}
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

InteractionsByTypeChart.propTypes = {
  /**
   * Data voor de chart
   */
  data: PropTypes.object,
  
  /**
   * Loading state
   */
  loading: PropTypes.bool
};

InteractionsByTypeChart.defaultProps = {
  loading: false
};

export default InteractionsByTypeChart;
