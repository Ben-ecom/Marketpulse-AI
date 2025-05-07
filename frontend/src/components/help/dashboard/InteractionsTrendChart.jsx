/**
 * InteractionsTrendChart.jsx
 * 
 * Component voor het visualiseren van trends in help interacties over tijd.
 * Gebruikt een line chart om de ontwikkeling van interacties te tonen.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * InteractionsTrendChart Component
 * 
 * Visualiseert trends in help interacties over tijd met een line chart.
 * 
 * @component
 */
const InteractionsTrendChart = ({ data, loading }) => {
  const theme = useTheme();
  
  // Als er geen data is of als we aan het laden zijn, toon een skeleton
  if (loading || !data) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Box>
    );
  }
  
  // Als er geen data is, toon een melding
  if (data.length === 0) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen interactie trend data beschikbaar voor de geselecteerde filters.
        </Typography>
      </Box>
    );
  }
  
  // Transformeer de data voor de chart
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'dd MMM', { locale: nl })
  }));
  
  // Bereken het gemiddelde aantal interacties
  const averageInteractions = data.reduce((sum, item) => sum + item.count, 0) / data.length;
  
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
            {payload[0].value > averageInteractions 
              ? `${((payload[0].value / averageInteractions - 1) * 100).toFixed(1)}% boven gemiddelde` 
              : `${((1 - payload[0].value / averageInteractions) * 100).toFixed(1)}% onder gemiddelde`}
          </Typography>
        </Box>
      );
    }
    
    return null;
  };
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine 
            y={averageInteractions} 
            label="Gemiddelde" 
            stroke={theme.palette.info.main} 
            strokeDasharray="3 3" 
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Interacties"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

InteractionsTrendChart.propTypes = {
  /**
   * Data voor de chart
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired
    })
  ),
  
  /**
   * Loading state
   */
  loading: PropTypes.bool
};

InteractionsTrendChart.defaultProps = {
  loading: false
};

export default InteractionsTrendChart;
