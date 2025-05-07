import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

/**
 * Component voor het visualiseren van markttrends data
 * @param {Object} props Component properties
 * @param {Array} props.data Array van markttrends objecten
 * @param {number} props.height Hoogte van de grafiek in pixels
 */
const MarketTrendsChart = ({ data = [], height = 300 }) => {
  const theme = useTheme();
  
  // Bereid data voor voor de grafiek
  // We gebruiken de growth_rate en relevance_score voor de lijnen
  const chartData = [...data]
    .sort((a, b) => a.relevance_score - b.relevance_score)
    .slice(0, 8)
    .map(trend => ({
      name: trend.name.length > 20 ? `${trend.name.substring(0, 20)}...` : trend.name,
      fullName: trend.name,
      growthRate: trend.growth_rate,
      relevanceScore: trend.relevance_score,
      description: trend.description,
      implications: trend.implications
    }));

  if (chartData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Geen markttrends data beschikbaar
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          yAxisId="left"
          label={{ 
            value: 'Groeisnelheid (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }} 
          domain={[0, 100]}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          label={{ 
            value: 'Relevantie Score', 
            angle: 90, 
            position: 'insideRight',
            style: { textAnchor: 'middle' }
          }}
          domain={[0, 100]}
        />
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'Groeisnelheid') return [`${value}%`, name];
            return [value, name];
          }}
          labelFormatter={(label) => {
            const item = chartData.find(d => d.name === label);
            return item ? item.fullName : label;
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const trend = chartData.find(d => d.name === label);
              return (
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: 1,
                    maxWidth: 300
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {trend?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {trend?.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Groeisnelheid:</strong> {trend?.growthRate}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Relevantie:</strong> {trend?.relevanceScore}/100
                    </Typography>
                  </Box>
                </Box>
              );
            }
            return null;
          }}
        />
        <Legend />
        <ReferenceLine yAxisId="left" y={50} stroke={theme.palette.warning.main} strokeDasharray="3 3" />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="growthRate"
          name="Groeisnelheid"
          stroke={theme.palette.primary.main}
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="relevanceScore"
          name="Relevantie Score"
          stroke={theme.palette.secondary.main}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MarketTrendsChart;
