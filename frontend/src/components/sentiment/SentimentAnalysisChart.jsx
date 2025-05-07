import { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  FilterAlt as FilterIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import ExportButton from '../export/ExportButton';
import {
  categorizeSentiment,
  transformForPieChart,
  transformForTrendChart,
  calculateSentimentStats
} from '../../utils/sentiment/sentimentUtils';

/**
 * SentimentAnalysisChart Component
 * 
 * Deze component visualiseert sentiment analyse data in verschillende formaten (pie chart, trend chart)
 * en biedt interactieve filtering op platform en tijdsinterval. De component toont ook statistieken
 * over de sentiment verdeling en biedt export functionaliteit voor rapporten.
 * 
 * De component berekent automatisch sentiment categorieën (positief, neutraal, negatief) op basis
 * van de sentiment scores in de data en visualiseert deze in de gekozen grafiek. Gebruikers kunnen
 * filteren op specifieke platforms en tijdsintervallen om dieper inzicht te krijgen in de data.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array met sentiment data objecten
 * @param {String} props.title - Titel van de chart die wordt weergegeven in de header
 * @param {Array} props.platforms - Array met beschikbare platforms voor filtering
 * @param {Function} props.onFilterChange - Callback functie voor filter wijzigingen
 * @param {String} props.projectName - Naam van het project voor export functionaliteit
 * 
 * @example
 * ```jsx
 * <SentimentAnalysisChart
 *   data={sentimentData}
 *   title="Klantfeedback Sentiment Analyse"
 *   platforms={["twitter", "reddit", "trustpilot"]}
 *   onFilterChange={handleFilterChange}
 *   projectName="MarketPulse AI"
 * />
 * ```
 */
const SentimentAnalysisChart = ({ data = [], title = 'Sentiment Analyse', platforms = [], onFilterChange, projectName }) => {
  const [chartType, setChartType] = useState('pie');
  const [timeInterval, setTimeInterval] = useState('day');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  // Ref voor chart export
  const chartRef = useRef(null);

  // Filter data op basis van geselecteerd platform
  const filteredData = useMemo(() => {
    if (selectedPlatform === 'all') return data;
    return data.filter(item => item.platform === selectedPlatform);
  }, [data, selectedPlatform]);

  // Bereken sentiment categorieën
  const sentimentCategories = useMemo(() => 
    categorizeSentiment(filteredData),
  [filteredData]);

  // Transformeer data voor pie chart
  const pieChartData = useMemo(() => 
    transformForPieChart(sentimentCategories),
  [sentimentCategories]);

  // Transformeer data voor trend chart
  const trendChartData = useMemo(() => 
    transformForTrendChart(filteredData, timeInterval),
  [filteredData, timeInterval]);

  // Bereken sentiment statistieken
  const stats = useMemo(() => 
    calculateSentimentStats(filteredData),
  [filteredData]);

  // Handle chart type change
  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Handle time interval change
  const handleTimeIntervalChange = (event) => {
    setTimeInterval(event.target.value);
  };

  // Handle platform change
  const handlePlatformChange = (event) => {
    const platform = event.target.value;
    setSelectedPlatform(platform);
    if (onFilterChange) {
      onFilterChange({ platform });
    }
  };

  // Render sentiment statistieken
  const renderStats = () => {
    if (!filteredData.length) return null;

    return (
      <Box 
        sx={{ mt: 2 }}
        role="region"
        aria-label="Sentiment statistieken"
      >
        <Typography variant="subtitle2" gutterBottom id="sentiment-stats-heading">
          Sentiment Statistieken
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Positief
                </Typography>
                <Typography variant="h6" color="success.main">
                  {stats.positivePercentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Neutraal
                </Typography>
                <Typography variant="h6" color="info.main">
                  {stats.neutralPercentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Negatief
                </Typography>
                <Typography variant="h6" color="error.main">
                  {stats.negativePercentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Gemiddelde Score
                </Typography>
                <Typography variant="h6">
                  {stats.average.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render pie chart
  const renderPieChart = () => {
    if (!filteredData.length) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={300}
          role="status"
          aria-live="polite"
        >
          <Typography variant="body2" color="text.secondary">
            Geen data beschikbaar voor visualisatie
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} items`, 'Aantal']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render trend chart
  const renderTrendChart = () => {
    if (!trendChartData.length) return <Typography>Geen data beschikbaar</Typography>;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={trendChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#10b981" name="Positief" />
          <Line type="monotone" dataKey="neutral" stroke="#3b82f6" name="Neutraal" />
          <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negatief" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="Grafiek type selectie"
              size="small"
            >
              <ToggleButton 
                value="pie" 
                aria-label="Cirkeldiagram" 
                aria-pressed={chartType === 'pie'}
                aria-describedby="pie-chart-description"
              >
                <PieChartIcon />
                <span id="pie-chart-description" className="visually-hidden">Toon sentiment verdeling als cirkeldiagram</span>
              </ToggleButton>
              <ToggleButton 
                value="trend" 
                aria-label="Trendgrafiek" 
                aria-pressed={chartType === 'trend'}
                aria-describedby="trend-chart-description"
              >
                <LineChartIcon />
                <span id="trend-chart-description" className="visually-hidden">Toon sentiment ontwikkeling over tijd</span>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ExportButton
              data={filteredData}
              projectName={projectName}
              contentType="sentiment-analysis"
              title=""
              pdfTitle={`${title} - MarketPulse AI`}
              variant="outlined"
              size="small"
              chartRef={chartRef}
              customSections={[
                {
                  id: 'summary',
                  title: 'Sentiment Analyse Samenvatting',
                  type: 'text',
                  content: `Deze analyse toont sentiment verdeling over ${filteredData.length} items. ` +
                    `Positief: ${stats.positivePercentage.toFixed(1)}%, ` +
                    `Neutraal: ${stats.neutralPercentage.toFixed(1)}%, ` +
                    `Negatief: ${stats.negativePercentage.toFixed(1)}%. ` +
                    `Gemiddelde sentiment score: ${stats.average.toFixed(2)}.`
                },
                {
                  id: 'sentimentData',
                  title: 'Sentiment Categorieën',
                  type: 'table',
                  data: pieChartData,
                  headers: ['Categorie', 'Aantal', 'Percentage']
                }
              ]}
            />
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {/* Filters */}
        <Box 
          sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}
          role="group"
          aria-label="Filter opties"
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="platform-select-label">Platform</InputLabel>
            <Select
              labelId="platform-select-label"
              id="platform-select"
              value={selectedPlatform}
              label="Platform"
              onChange={handlePlatformChange}
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} aria-hidden="true" />}
              aria-describedby="platform-select-description"
            >
              <MenuItem value="all">Alle platforms</MenuItem>
              {platforms.map(platform => (
                <MenuItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </MenuItem>
              ))}
            </Select>
            <span id="platform-select-description" className="visually-hidden">
              Filter sentiment data op specifiek platform
            </span>
          </FormControl>

          {chartType === 'trend' && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="time-interval-label">Tijdsinterval</InputLabel>
              <Select
                labelId="time-interval-label"
                id="time-interval-select"
                value={timeInterval}
                label="Tijdsinterval"
                onChange={handleTimeIntervalChange}
                aria-describedby="time-interval-description"
              >
                <MenuItem value="day">Per dag</MenuItem>
                <MenuItem value="week">Per week</MenuItem>
                <MenuItem value="month">Per maand</MenuItem>
              </Select>
              <span id="time-interval-description" className="visually-hidden">
                Selecteer tijdsinterval voor de trendgrafiek
              </span>
            </FormControl>
          )}
        </Box>

        {/* Data summary */}
        <Box 
          sx={{ mb: 2 }}
          aria-live="polite"
        >
          <Typography variant="body2" color="text.secondary">
            Totaal aantal items: <Chip size="small" label={filteredData.length} aria-label={`${filteredData.length} items in totaal`} />
          </Typography>
        </Box>

        {/* Charts */}
        <div 
          ref={chartRef}
          role="figure"
          aria-label={chartType === 'pie' ? 'Cirkeldiagram van sentiment verdeling' : 'Trendgrafiek van sentiment over tijd'}
        >
          {chartType === 'pie' ? renderPieChart() : renderTrendChart()}
        </div>

        {/* Stats */}
        {renderStats()}
      </CardContent>
    </Card>
  );
};

SentimentAnalysisChart.propTypes = {
  /**
   * Array met sentiment data objecten. Elk object moet minimaal een sentiment score
   * en een timestamp bevatten. Optioneel kan ook een platform property worden meegegeven.
   * 
   * @type {Array.<{sentiment: number, timestamp: string|Date, platform: string, text: string}>}
   * @example [
   *   { sentiment: 0.75, timestamp: "2023-05-01T12:00:00Z", platform: "twitter", text: "Positieve feedback" },
   *   { sentiment: -0.3, timestamp: "2023-05-02T14:30:00Z", platform: "reddit", text: "Negatieve feedback" }
   * ]
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /** Sentiment score tussen -1 (zeer negatief) en 1 (zeer positief) */
      sentiment: PropTypes.number.isRequired,
      /** Timestamp van het sentiment item (ISO string of Date object) */
      timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date)
      ]).isRequired,
      /** Platform waarvan het sentiment item afkomstig is */
      platform: PropTypes.string,
      /** Tekst of inhoud van het sentiment item */
      text: PropTypes.string
    })
  ),
  
  /**
   * Titel van de chart die wordt weergegeven in de header
   * @type {string}
   * @default "Sentiment Analyse"
   */
  title: PropTypes.string,
  
  /**
   * Array met beschikbare platforms voor filtering
   * @type {Array.<string>}
   * @example ["twitter", "reddit", "trustpilot"]
   */
  platforms: PropTypes.arrayOf(PropTypes.string),
  
  /**
   * Callback functie die wordt aangeroepen wanneer een filter wijzigt
   * @type {Function}
   * @param {Object} filters - Object met de geselecteerde filters
   * @param {string} filters.platform - Geselecteerd platform filter
   */
  onFilterChange: PropTypes.func,
  
  /**
   * Naam van het project voor export functionaliteit
   * @type {string}
   */
  projectName: PropTypes.string
};

export default SentimentAnalysisChart;
