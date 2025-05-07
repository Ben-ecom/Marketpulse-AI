import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Description as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import ExportButton from '../export/ExportButton';
import IntegratedHelpSystem from '../help/IntegratedHelpSystem';
import ContextualTooltip from '../help/ContextualTooltip';
import { 
  generateExecutiveSummary,
  generateDetailedReport
} from '../../utils/reports/topicAwarenessReportUtils';

/**
 * TopicAwarenessReport Component
 * 
 * Deze component genereert en exporteert gedetailleerde rapporten over topic awareness analyse.
 * Het integreert data van trending topics en awareness fasen om een uitgebreid rapport te creëren
 * dat kan worden aangepast en geëxporteerd in verschillende formaten.
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessReport
 *   topicsByPhase={topicsByPhase}
 *   awarenessDistribution={awarenessDistribution}
 *   contentRecommendations={contentRecommendations}
 *   trendingTopics={trendingTopics}
 *   projectName="MarketPulse AI"
 *   isLoading={false}
 * />
 * ```
 */
const TopicAwarenessReport = ({ 
  topicsByPhase = {},
  awarenessDistribution = [],
  contentRecommendations = {},
  trendingTopics = [],
  projectName = '',
  isLoading = false
}) => {
  const theme = useTheme();
  
  /**
   * State voor rapport configuratie opties
   * @type {Object}
   * @property {string} productName - Naam van het product/service voor personalisatie
   * @property {string} industrie - Industrie/niche voor personalisatie
   * @property {boolean} includeExecutiveSummary - Of de executive summary moet worden opgenomen
   * @property {boolean} includeTopicDetails - Of topic details per fase moeten worden opgenomen
   * @property {boolean} includeContentRecommendations - Of content aanbevelingen moeten worden opgenomen
   * @property {boolean} includeStrategicRecommendations - Of strategische aanbevelingen moeten worden opgenomen
   */
  const [reportOptions, setReportOptions] = useState({
    productName: '',
    industrie: '',
    includeExecutiveSummary: true,
    includeTopicDetails: true,
    includeContentRecommendations: true,
    includeStrategicRecommendations: true
  });
  
  /**
   * State voor preview functionaliteit
   * @type {boolean} showPreview - Of de preview modal moet worden weergegeven
   * @type {string} previewContent - Markdown content voor de preview
   */
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  /**
   * Genereert een gedetailleerd rapport object op basis van de trending topics en awareness data
   * Gebruikt memoization om onnodige herberekeningen te voorkomen
   * 
   * @returns {Object|null} Het gegenereerde rapport object of null als de data nog niet beschikbaar is
   */
  const report = useMemo(() => {
    // Controleer of alle benodigde data beschikbaar is
    if (isLoading || 
        !topicsByPhase || Object.keys(topicsByPhase).length === 0 || 
        !awarenessDistribution || awarenessDistribution.length === 0) {
      return null;
    }
    
    // Genereer het rapport met de utility functie
    return generateDetailedReport(
      topicsByPhase,
      awarenessDistribution,
      contentRecommendations,
      trendingTopics,
      {
        ...reportOptions,
        projectName
      }
    );
  }, [
    topicsByPhase, 
    awarenessDistribution, 
    contentRecommendations, 
    trendingTopics, 
    reportOptions,
    projectName,
    isLoading
  ]);
  
  /**
   * Verwerkt wijzigingen in de rapport configuratie opties
   * 
   * @param {string} name - De naam van de optie die wordt gewijzigd
   * @param {any} value - De nieuwe waarde voor de optie
   */
  const handleOptionChange = (name, value) => {
    setReportOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Toont een preview van de executive summary in een modal venster.
   * 
   * Deze functie zoekt de 'Executive Summary' sectie in het gegenereerde rapport en toont de inhoud
   * in een modal venster. Dit stelt gebruikers in staat om snel een overzicht te krijgen van de belangrijkste
   * inzichten zonder het volledige rapport te hoeven exporteren. De preview wordt getoond in markdown formaat
   * voor betere leesbaarheid.
   * 
   * @function
   * @returns {void} - Stelt de previewContent state in en opent de preview modal
   */
  const handlePreview = () => {
    if (!report) return;
    
    const executiveSummary = report.sections.find(section => section.title === 'Executive Summary');
    
    if (executiveSummary) {
      setPreviewContent(executiveSummary.content);
      setShowPreview(true);
    }
  };
  
  /**
   * Genereert de export configuratie voor de ExportButton component
   * Gebruikt memoization om onnodige herberekeningen te voorkomen
   * 
   * @returns {Object|null} De export configuratie met opties voor PDF en Excel export,
   *                        of null als het rapport nog niet beschikbaar is
   */
  const exportConfig = useMemo(() => {
    if (!report) return null;
    
    // Transformeer secties naar het juiste formaat voor PDF export
    const transformedSections = report.sections.map(section => {
      if (section.type === 'text') {
        return {
          title: section.title,
          content: section.content,
          type: 'text'
        };
      } else if (section.type === 'chart') {
        return {
          title: section.title,
          chartData: section.chartData,
          type: 'chart'
        };
      } else if (section.type === 'table') {
        return {
          title: section.title,
          tableData: section.tableData,
          type: 'table'
        };
      } else if (section.type === 'strategic') {
        return {
          title: section.title,
          content: `## Dominante Fase: ${section.content.dominantPhase}\n\n### Aanbevelingen\n${section.content.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}`,
          type: 'markdown'
        };
      }
      return section;
    });
    
    // Filter secties op basis van gebruiker selecties
    const filteredSections = transformedSections.filter(section => {
      if (section.title === 'Executive Summary' && !reportOptions.includeExecutiveSummary) {
        return false;
      }
      if (section.title === 'Topic Details per Fase' && !reportOptions.includeTopicDetails) {
        return false;
      }
      if (section.title === 'Content Aanbevelingen' && !reportOptions.includeContentRecommendations) {
        return false;
      }
      if (section.title === 'Strategische Aanbevelingen' && !reportOptions.includeStrategicRecommendations) {
        return false;
      }
      return true;
    });
    
    // Maak overzicht werkblad
    const overviewSheet = {
      name: 'Overzicht',
      data: [
        ['Topic Awareness Analyse Rapport'],
        ['Gegenereerd op', new Date().toLocaleDateString()],
        ['Project', projectName],
        [],
        ['Dit rapport bevat de volgende secties:'],
        ...report.sections.map(section => [section.title])
      ]
    };
    
    return {
      // Bestandsnaam voor exports, met projectnaam en zonder spaties
      filename: `Topic_Awareness_Rapport_${projectName.replace(/\s+/g, '_')}`,
      
      // Configuratie voor PDF export
      pdfOptions: {
        title: report.title,
        sections: filteredSections
      },
      
      // Configuratie voor Excel export
      excelOptions: {
        sheets: [overviewSheet]
      }
    };
  }, [report, projectName, reportOptions, topicsByPhase, awarenessDistribution, contentRecommendations]);
  
  return (
    <IntegratedHelpSystem activeView="report" userRole="marketeer" experienceLevel="intermediate">
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ContextualTooltip
            title="Topic Awareness Rapport"
            content="Dit rapport geeft een gedetailleerd overzicht van de awareness fasen van uw doelgroep. Het helpt u te begrijpen in welke fase uw potentiële klanten zich bevinden en welke content het meest effectief is voor elke fase."
            videoUrl="https://example.com/videos/topic-awareness-overview.mp4"
            learnMoreUrl="https://docs.example.com/topic-awareness/overview"
          >
            <Typography variant="h5" component="h1">
              <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {projectName ? `${projectName} - Topic Awareness Rapport` : 'Topic Awareness Rapport'}
            </Typography>
          </ContextualTooltip>
          <Tooltip title="Hulp bij topic awareness rapport">
            <IconButton color="primary" aria-label="help">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      
        <Typography variant="body2" color="text.secondary" paragraph>
        Genereer een gedetailleerd rapport van de topic awareness analyse. Dit rapport bevat inzichten in de awareness fasen van uw doelgroep, trending topics per fase, en strategische aanbevelingen voor uw content marketing.
      </Typography>
      
      {isLoading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={200}
          role="status"
          aria-live="polite"
        >
          <CircularProgress aria-label="Rapport wordt geladen" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Rapport wordt gegenereerd...
          </Typography>
        </Box>
      ) : !topicsByPhase ? (
        <Alert 
          severity="error" 
          sx={{ my: 2 }} 
          role="alert" 
          aria-live="assertive"
        >
          Er is een fout opgetreden bij het laden van de topic data. Probeer de pagina te vernieuwen of neem contact op met support.
        </Alert>
      ) : Object.keys(topicsByPhase).length === 0 ? (
        <Alert 
          severity="warning" 
          sx={{ my: 2 }} 
          role="alert" 
          aria-live="polite"
        >
          Geen topics gevonden. Voer eerst een topic analyse uit of pas de zoekparameters aan.
        </Alert>
      ) : !awarenessDistribution ? (
        <Alert 
          severity="error" 
          sx={{ my: 2 }} 
          role="alert" 
          aria-live="assertive"
        >
          Er is een fout opgetreden bij het laden van de awareness distributie data. Probeer de pagina te vernieuwen.
        </Alert>
      ) : awarenessDistribution.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ my: 2 }} 
          role="alert" 
          aria-live="polite"
        >
          Onvoldoende data beschikbaar om een awareness distributie te genereren. Voer eerst een topic awareness analyse uit.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Rapport Opties */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <ContextualTooltip
                  title="Rapport Opties"
                  content="Pas de rapport opties aan om het rapport te personaliseren. Kies welke secties u wilt opnemen en pas de naam van uw product of service aan. Deze opties beïnvloeden de inhoud en structuur van het gegenereerde rapport."
                  videoUrl="https://example.com/videos/report-options.mp4"
                  learnMoreUrl="https://docs.example.com/topic-awareness/report-options"
                >
                  <Typography variant="h6" component="h2" gutterBottom id="rapport-opties-label">
                    Rapport Opties
                    <InfoIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                  </Typography>
                </ContextualTooltip>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Product/Service Naam"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={reportOptions.productName}
                      onChange={(e) => handleOptionChange('productName', e.target.value)}
                      placeholder="Bijv. MarketPulse AI"
                      margin="normal"
                      id="product-name-input"
                      aria-describedby="product-name-helper-text"
                      inputProps={{
                        'aria-label': 'Product of service naam voor in het rapport',
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      id="product-name-helper-text" 
                      color="text.secondary"
                    >
                      De naam van uw product of service die in het rapport wordt gebruikt
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Industrie/Niche"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={reportOptions.industrie}
                      onChange={(e) => handleOptionChange('industrie', e.target.value)}
                      placeholder="Bijv. e-commerce"
                      margin="normal"
                      id="industrie-input"
                      aria-describedby="industrie-helper-text"
                      inputProps={{
                        'aria-label': 'Industrie of niche voor in het rapport',
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      id="industrie-helper-text" 
                      color="text.secondary"
                    >
                      De industrie of niche van uw product voor contextuele aanbevelingen
                    </Typography>
                  </Grid>
                </Grid>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }} id="rapport-secties-label">
                Rapport Secties
              </Typography>
              
              <FormGroup aria-labelledby="rapport-secties-label" role="group">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportOptions.includeExecutiveSummary}
                      onChange={(e) => handleOptionChange('includeExecutiveSummary', e.target.checked)}
                      id="checkbox-executive-summary"
                      aria-describedby="executive-summary-description"
                      disabled={!report}
                      aria-label="Rapport exporteren naar PDF of Excel"
                    />
                  }
                  label="Inclusief Executive Summary"
                />
              </FormGroup>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} id="report-generation-description">
                Het rapport wordt gegenereerd op basis van de huidige topic awareness analyse en de geselecteerde opties. U kunt het rapport exporteren als PDF of Excel bestand.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Rapport Preview & Export */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <ContextualTooltip
                title="Rapport Preview & Export"
                content="Bekijk een preview van het rapport voordat u het exporteert. U kunt het rapport exporteren naar PDF of Excel formaat voor verdere analyse of om te delen met uw team."
                videoUrl="https://example.com/videos/report-export.mp4"
                learnMoreUrl="https://docs.example.com/topic-awareness/export-options"
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Rapport Preview & Export
                  <InfoIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Typography>
              </ContextualTooltip>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <ContextualTooltip
                  title="Preview Rapport"
                  content="Bekijk een preview van de executive summary van het rapport. Dit geeft u een snel overzicht van de belangrijkste bevindingen voordat u het volledige rapport exporteert."
                  placement="top"
                >
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    disabled={!report || !reportOptions.includeExecutiveSummary}
                    sx={{ mr: 2 }}
                    aria-label="Preview rapport"
                  >
                    Preview
                  </Button>
                </ContextualTooltip>
                
                {report && exportConfig && (
                  <ContextualTooltip
                    title="Exporteer Rapport"
                    content="Exporteer het rapport naar PDF of Excel formaat. Het PDF formaat is geschikt voor presentaties en het delen van inzichten, terwijl het Excel formaat handig is voor verdere data-analyse."
                    placement="top"
                  >
                    <ExportButton
                      config={exportConfig}
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      aria-label="Exporteer rapport"
                    >
                      Exporteren
                    </ExportButton>
                  </ContextualTooltip>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Het rapport kan worden geëxporteerd als PDF (voor presentaties) of Excel (voor data-analyse). De preview toont alleen de executive summary.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Preview */}
        {showPreview && (
          <Grid item xs={12}>
            <Accordion 
              defaultExpanded
              id="executive-summary-preview"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon aria-hidden="true" />}
                aria-controls="executive-summary-preview-content"
                id="executive-summary-preview-header"
              >
                <ContextualTooltip
                  title="Executive Summary"
                  content="De executive summary geeft een beknopt overzicht van de belangrijkste bevindingen en aanbevelingen uit het rapport. Het is ontworpen om snel inzicht te geven in de awareness status van uw doelgroep."
                  placement="bottom"
                >
                  <Typography variant="h6" component="h3">
                    <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
                    Executive Summary Preview
                    <InfoIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                  </Typography>
                </ContextualTooltip>
              </AccordionSummary>
              <AccordionDetails id="executive-summary-preview-content">
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    maxHeight: 500,
                    overflow: 'auto'
                  }}
                  role="region"
                  aria-label="Executive summary inhoud"
                  tabIndex={0}
                >
                  <ReactMarkdown components={{
                    // Zorg ervoor dat headings de juiste hiërarchie hebben
                    h1: ({node, ...props}) => <Typography variant="h4" component="h4" gutterBottom {...props} />,
                    h2: ({node, ...props}) => <Typography variant="h5" component="h5" gutterBottom {...props} />,
                    h3: ({node, ...props}) => <ContextualTooltip
                title="Trending Topics"
                content="Deze sectie toont de topics die het snelst in populariteit stijgen. Gebruik deze inzichten om in te spelen op opkomende trends in je markt."
                videoUrl="https://example.com/videos/trending-topics.mp4"
                learnMoreUrl="https://docs.example.com/topic-awareness/trending"
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  Trending Topics
                </Typography>
              </ContextualTooltip>,
                    // Zorg ervoor dat lijsten toegankelijk zijn
                    ul: ({node, ...props}) => <ul role="list" {...props} />,
                    ol: ({node, ...props}) => <ol role="list" {...props} />,
                    // Zorg ervoor dat links toegankelijk zijn
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                  }}>
                    {previewContent}
                  </ReactMarkdown>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        
        {/* Preview Button */}
        {!showPreview && (
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handlePreview}
              startIcon={<PreviewIcon aria-hidden="true" />}
              disabled={!report || !reportOptions.includeExecutiveSummary}
              sx={{ mr: 2 }}
              aria-describedby="preview-button-description"
              aria-label="Toon preview van executive summary"
            >
              Preview
            </Button>
            <span id="preview-button-description" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
              Toont een preview van de executive summary in een popup venster
            </span>
          </Grid>
        )}
        </Grid>
      )}
      </Paper>
    </IntegratedHelpSystem>
  );
};

TopicAwarenessReport.propTypes = {
  /**
   * Object met topics gegroepeerd per awareness fase. De sleutels zijn de awareness fase IDs
   * (unaware, problem_aware, solution_aware, product_aware, most_aware) en de waarden zijn arrays
   * van topic objecten die relevant zijn voor die fase.
   * 
   * @type {Object.<string, Array.<{name: string, relevance: number, frequency: number, growth: number, sentiment: number}>>}
   * @example { 
   *   "unaware": [
   *     {name: "topic1", relevance: 0.8, frequency: 120, growth: 0.05, sentiment: 0.2}, 
   *     {name: "topic2", relevance: 0.7, frequency: 90, growth: -0.02, sentiment: -0.1}
   *   ], 
   *   "problem_aware": [...], 
   *   ... 
   * }
   */
  topicsByPhase: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        /** Naam van het topic */
        name: PropTypes.string.isRequired,
        /** Relevantie score van het topic (0-1) */
        relevance: PropTypes.number.isRequired,
        /** Aantal keer dat het topic voorkomt in de dataset */
        frequency: PropTypes.number,
        /** Groeipercentage van het topic over tijd (-1 tot 1) */
        growth: PropTypes.number,
        /** Sentiment score van het topic (-1 tot 1) */
        sentiment: PropTypes.number
      })
    )
  ),
  
  /**
   * Array met awareness distributie data. Bevat informatie over de verdeling van content
   * over de verschillende awareness fasen, inclusief percentages en absolute aantallen.
   * 
   * @type {Array.<{phase: string, phaseId: string, awareness: number, count: number, color: string}>}
   * @example [
   *   { phaseId: "unaware", phase: "Unaware", awareness: 0.25, count: 120, color: "#9CA3AF" }, 
   *   { phaseId: "problem_aware", phase: "Problem Aware", awareness: 0.35, count: 168, color: "#60A5FA" },
   *   ...
   * ]
   */
  awarenessDistribution: PropTypes.arrayOf(
    PropTypes.shape({
      /** ID van de awareness fase (unaware, problem_aware, etc.) */
      phaseId: PropTypes.string,
      /** Naam van de awareness fase (Unaware, Problem Aware, etc.) */
      phase: PropTypes.string.isRequired,
      /** Percentage van content in deze fase (0-1) */
      awareness: PropTypes.number.isRequired,
      /** Aantal items in deze fase */
      count: PropTypes.number.isRequired,
      /** Kleur geassocieerd met deze fase (hex code) */
      color: PropTypes.string
    })
  ),
  
  /**
   * Object met content aanbevelingen per awareness fase. De sleutels zijn de awareness fase IDs
   * en de waarden zijn arrays van aanbevelingsobjecten specifiek voor die fase.
   * 
   * @type {Object.<string, Array.<{phase: string, contentIdeas: Array.<string>, channels: Array.<string>, callToAction: string, contentTypes: Array.<string>, tone: string}>>}
   * @example { 
   *   "unaware": [
   *     { 
   *       phase: "Unaware", 
   *       contentIdeas: ["Blogpost over industrie trends", "Infographic over marktstatistieken"], 
   *       channels: ["Social media", "Blog"], 
   *       callToAction: "Lees meer",
   *       contentTypes: ["Blog", "Infographic"],
   *       tone: "Informatief"
   *     }
   *   ], 
   *   "problem_aware": [...], 
   *   ... 
   * }
   */
  contentRecommendations: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        /** Naam van de awareness fase */
        phase: PropTypes.string.isRequired,
        /** Lijst met content ideeën voor deze fase */
        contentIdeas: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Lijst met aanbevolen kanalen voor deze fase */
        channels: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Aanbevolen call-to-action voor deze fase */
        callToAction: PropTypes.string.isRequired,
        /** Lijst met aanbevolen content types voor deze fase */
        contentTypes: PropTypes.arrayOf(PropTypes.string),
        /** Aanbevolen tone-of-voice voor deze fase */
        tone: PropTypes.string
      })
    )
  ),
  
  /**
   * Array met trending topics data. Bevat informatie over de meest trending topics
   * in de dataset, inclusief scores en groeipercentages.
   * 
   * @type {Array.<{topic: string, trendingScore: number, frequency: number, growth: number, relevantPhases: Array.<string>}>}
   * @example [
   *   { 
   *     topic: "topic1", 
   *     trendingScore: 0.9, 
   *     frequency: 250, 
   *     growth: 0.15,
   *     relevantPhases: ["problem_aware", "solution_aware"]
   *   }, 
   *   ...
   * ]
   */
  trendingTopics: PropTypes.arrayOf(
    PropTypes.shape({
      /** Naam van het topic */
      topic: PropTypes.string.isRequired,
      /** Trending score van het topic (0-1) */
      trendingScore: PropTypes.number.isRequired,
      /** Aantal keer dat het topic voorkomt in de dataset */
      frequency: PropTypes.number,
      /** Groeipercentage van het topic over tijd (-1 tot 1) */
      growth: PropTypes.number,
      /** Lijst met awareness fasen waarin dit topic relevant is */
      relevantPhases: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  
  /** 
   * Naam van het project waarvoor het rapport wordt gegenereerd 
   * @type {string}
   */
  projectName: PropTypes.string,
  
  /** 
   * Geeft aan of de data nog wordt geladen 
   * @type {boolean}
   * @default false
   */
  isLoading: PropTypes.bool,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het rapport is gegenereerd
   * @type {Function}
   * @param {Object} report - Het gegenereerde rapport object
   */
  onReportGenerated: PropTypes.func,
  
  /**
   * Datum waarop de data is verzameld, gebruikt voor het rapport
   * @type {string|Date}
   */
  dataCollectionDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ])
};

export default TopicAwarenessReport;
