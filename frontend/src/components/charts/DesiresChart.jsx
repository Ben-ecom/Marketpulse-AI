import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid, Card, CardContent, CardHeader, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from '@mui/icons-material';

/**
 * Component voor het visualiseren van verlangens data van verschillende platforms
 * @param {Object} props Component properties
 * @param {string} props.platform Geselecteerd platform (all, reddit, amazon, instagram, tiktok)
 * @param {Object} props.data Audience insights data object
 * @param {number} props.height Hoogte van de grafiek in pixels
 */
const DesiresChart = ({ platform = 'all', data = {}, height = 400 }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('bar');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Handle chart type change
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  // Haal de juiste data op basis van het geselecteerde platform
  const getPlatformData = () => {
    if (!data || !data.platforms) return [];
    
    if (platform === 'all') {
      // Combineer data van alle platforms
      return data.platforms.reduce((acc, platformData) => {
        if (platformData.desires && platformData.desires.byCategory) {
          Object.entries(platformData.desires.byCategory).forEach(([category, items]) => {
            const existingCategory = acc.find(item => item.category === category);
            if (existingCategory) {
              existingCategory.count += items.length;
            } else {
              acc.push({
                category,
                count: items.length,
                platform: platformData.platform
              });
            }
          });
        }
        return acc;
      }, []);
    } else {
      // Haal data van specifiek platform
      const platformData = data.platforms.find(p => p.platform === platform);
      if (!platformData || !platformData.desires || !platformData.desires.byCategory) return [];
      
      return Object.entries(platformData.desires.byCategory).map(([category, items]) => ({
        category,
        count: items.length,
        platform
      }));
    }
  };
  
  // Bereid data voor voor weergave
  const chartData = getPlatformData()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Bereid data voor voor pie chart
  const pieData = chartData.map(item => ({
    name: item.category,
    value: item.count,
    platform: item.platform
  }));

  if (chartData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Geen verlangens data beschikbaar voor {platform === 'all' ? 'alle platforms' : platform}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start een nieuwe analyse om inzichten te verzamelen
        </Typography>
      </Box>
    );
  }

  // Krijg kleur op basis van platform
  const getPlatformColor = (platformName) => {
    const colors = {
      reddit: theme.palette.error.main,
      amazon: theme.palette.warning.main,
      instagram: theme.palette.secondary.main,
      tiktok: theme.palette.info.main,
      all: theme.palette.primary.main
    };
    return colors[platformName] || theme.palette.primary.main;
  };
  
  // Bereken kleur voor bar chart
  const getBarColor = (item) => {
    if (platform === 'all') {
      return getPlatformColor(item.platform);
    }
    return theme.palette.primary.main;
  };
  
  // Pie chart active shape
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} items`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  // Handle pie sector hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          Verlangens per Categorie {platform !== 'all' ? `(${platform})` : ''}
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="pie" aria-label="pie chart">
            <PieChartIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 'dataMax + 2']} />
            <YAxis 
              dataKey="category" 
              type="category" 
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name, props) => [`Aantal: ${value}`, 'Aantal verlangens']}
              labelFormatter={(label) => `Categorie: ${label}`}
            />
            <Legend />
            <Bar dataKey="count" name="Aantal verlangens" radius={[0, 4, 4, 0]} fill={theme.palette.primary.main}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={theme.palette.primary.main}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={platform === 'all' ? getPlatformColor(entry.platform) : theme.palette.primary.main} 
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
      
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Top Verlangens" 
              titleTypographyProps={{ variant: 'subtitle1' }} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {chartData.slice(0, 5).map((item, index) => (
                <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {index + 1}. {item.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.count} items
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Verdeling per Platform" 
              titleTypographyProps={{ variant: 'subtitle1' }} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {platform === 'all' ? (
                data.platforms.map((platformData, index) => {
                  const desiresCount = platformData.desires?.all?.length || 0;
                  return (
                    <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        {platformData.platform}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {desiresCount} verlangens
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2">
                  Totaal aantal verlangens voor {platform}: {chartData.reduce((sum, item) => sum + item.count, 0)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesiresChart;
