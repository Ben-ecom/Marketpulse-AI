import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import TextGradient from '../../ui/TextGradient';
import GradientBackground from '../../ui/GradientBackground';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { 
  SentimentSatisfied as SentimentPositiveIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentDissatisfied as SentimentNegativeIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

/**
 * SentimentInsights Component
 * Visualiseert sentiment inzichten uit de Decodo API scraping resultaten
 */
const SentimentInsights = forwardRef(function SentimentInsights({ insights, platforms }, ref) {
  // Als er geen inzichten zijn, toon een placeholder
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" align="center">
            Geen sentiment inzichten beschikbaar
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Vind het algemene sentiment inzicht (zonder platform)
  const overallInsight = insights.find(insight => !insight.platform);
  
  // Vind platform-specifieke inzichten
  const platformInsights = insights.filter(insight => insight.platform);

  // Kleuren voor sentiment categorieën
  const SENTIMENT_COLORS = {
    positive: '#4caf50',
    neutral: '#9e9e9e',
    negative: '#f44336'
  };

  // Bereid data voor voor de sentiment distributie grafiek
  const prepareSentimentDistributionData = (sentimentData) => {
    if (!sentimentData) return [];
    
    return [
      { name: 'Positief', value: sentimentData.positive.count, percentage: sentimentData.positive.percentage },
      { name: 'Neutraal', value: sentimentData.neutral.count, percentage: sentimentData.neutral.percentage },
      { name: 'Negatief', value: sentimentData.negative.count, percentage: sentimentData.negative.percentage }
    ];
  };

  // Bereid data voor voor de platform vergelijking grafiek
  const preparePlatformComparisonData = () => {
    if (!overallInsight || !overallInsight.data.platform_comparison) return [];
    
    return overallInsight.data.platform_comparison.map(item => ({
      platform: item.platform,
      positief: item.sentiment.positive.percentage,
      neutraal: item.sentiment.neutral.percentage,
      negatief: item.sentiment.negative.percentage
    }));
  };

  // Formatteert een datum voor weergave
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  // Rendert een sentiment icoon op basis van de gemiddelde score
  const renderSentimentIcon = (averageScore) => {
    if (averageScore > 0.2) {
      return <SentimentPositiveIcon style={{ color: SENTIMENT_COLORS.positive }} />;
    } else if (averageScore < -0.2) {
      return <SentimentNegativeIcon style={{ color: SENTIMENT_COLORS.negative }} />;
    } else {
      return <SentimentNeutralIcon style={{ color: SENTIMENT_COLORS.neutral }} />;
    }
  };

  // Rendert een label op basis van de gemiddelde score
  const getSentimentLabel = (averageScore) => {
    if (averageScore > 0.2) {
      return 'Positief';
    } else if (averageScore < -0.2) {
      return 'Negatief';
    } else {
      return 'Neutraal';
    }
  };

  // Custom tooltip voor de pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="body2">{`${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage.toFixed(1)}%)`}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Algemeen overzicht */}
      {overallInsight && (
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <GradientBackground>
            <CardHeader 
              title={<TextGradient variant="h6">Algemeen Sentiment</TextGradient>} 
              subheader={`${formatDate(overallInsight.period_start)} - ${formatDate(overallInsight.period_end)}`}
              sx={{ p: 3 }}
            />
            <Divider />
          </GradientBackground>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              {renderSentimentIcon(overallInsight.data.average_score)}
              <TextGradient variant="h6" ml={1} animate={true}>
                {getSentimentLabel(overallInsight.data.average_score)}
              </TextGradient>
              <Chip 
                label={`Score: ${overallInsight.data.average_score.toFixed(2)}`}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              {overallInsight.description}
            </Typography>
            
            <Grid container spacing={3}>
              {/* Sentiment distributie pie chart */}
              <Grid item xs={12} md={6}>
                <TextGradient variant="subtitle1" align="center" gutterBottom>
                  Sentiment Distributie
                </TextGradient>
                <Box height={300} ref={ref}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareSentimentDistributionData(overallInsight.data)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        <Cell key="positive" fill={SENTIMENT_COLORS.positive} />
                        <Cell key="neutral" fill={SENTIMENT_COLORS.neutral} />
                        <Cell key="negative" fill={SENTIMENT_COLORS.negative} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              {/* Platform vergelijking bar chart */}
              <Grid item xs={12} md={6}>
                <TextGradient variant="subtitle1" align="center" gutterBottom>
                  Sentiment per Platform
                </TextGradient>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={preparePlatformComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`]} />
                      <Legend />
                      <Bar dataKey="positief" name="Positief" stackId="a" fill={SENTIMENT_COLORS.positive} />
                      <Bar dataKey="neutraal" name="Neutraal" stackId="a" fill={SENTIMENT_COLORS.neutral} />
                      <Bar dataKey="negatief" name="Negatief" stackId="a" fill={SENTIMENT_COLORS.negative} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Platform-specifieke sentiment */}
      {platformInsights.length > 0 && (
        <Card>
          <CardHeader 
            title={<TextGradient variant="h6">Platform Sentiment</TextGradient>} 
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {platformInsights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardHeader 
                      title={`${insight.platform} Sentiment`}
                      avatar={renderSentimentIcon(insight.data.average_score)}
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body2" paragraph>
                        {insight.description}
                      </Typography>
                      
                      {/* Platform sentiment pie chart */}
                      <Box height={200} mt={2}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareSentimentDistributionData(insight.data)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                            >
                              <Cell key="positive" fill={SENTIMENT_COLORS.positive} />
                              <Cell key="neutral" fill={SENTIMENT_COLORS.neutral} />
                              <Cell key="negative" fill={SENTIMENT_COLORS.negative} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
});

SentimentInsights.propTypes = {
  insights: PropTypes.array.isRequired,
  platforms: PropTypes.array
};

SentimentInsights.defaultProps = {
  platforms: []
};

export default SentimentInsights;
