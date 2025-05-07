import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  SentimentSatisfied as SentimentIcon,
  SentimentSatisfiedAlt as SentimentPositiveIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentDissatisfied as SentimentNegativeIcon,
  Category as CategoryIcon,
  Compare as CompareIcon,
  Lightbulb as LightbulbIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  Storage as CsvIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

// Aangepaste UI componenten
import Select from '../ui/Select';
import TextGradient from '../ui/TextGradient';
import GradientBackground from '../ui/GradientBackground';

// Services en utilities
import { supabase } from '../../utils/supabaseClient';
import { edgeFunctionsService } from '../../services/EdgeFunctionsService';
import exportUtils from '../../utils/exportUtils';

// Componenten
import TrendInsights from './insights/TrendInsights';
import SentimentInsights from './insights/SentimentInsights';
import InsightDetail from './insights/InsightDetail';
import MarketingRecommendations from './insights/MarketingRecommendations';

// Date picker
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { nl } from 'date-fns/locale';

// Styles
import '../../styles/decodoInsightsDashboard.css';
import '../../styles/select.css';
import '../../styles/advancedFilters.css';

/**
 * DecodoInsightsDashboard Component
 * Visualiseert inzichten uit de Decodo API scraping resultaten
 */
const DecodoInsightsDashboard = ({ 
  projectId, 
  projectName,
  onRefresh = null
}) => {
  const { id } = useParams();

  // Refs voor de charts voor export
  const trendChartRef = useRef(null);
  const sentimentChartRef = useRef(null);
  
  // State voor de UI
  const [activeTab, setActiveTab] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showInsightDetail, setShowInsightDetail] = useState(false);
  const [relatedInsights, setRelatedInsights] = useState([]);
  const [filters, setFilters] = useState({
    platform: 'all',
    insightType: 'all',
    sentiment: 'all',  // Nieuw: filter op sentiment (positief, neutraal, negatief)
    category: 'all',   // Nieuw: filter op inhoudscategorie (pijnpunten, verlangens, terminologie)
    periodStart: new Date(new Date().setDate(new Date().getDate() - 30)),
    periodEnd: new Date()
  });
  
  // Nieuw: sorteeropties
  const [sortOptions, setSortOptions] = useState({
    sortBy: 'date',         // 'relevance', 'date', 'sentiment', 'engagement'
    sortDirection: 'desc'   // 'asc', 'desc'
  });
  
  // Nieuw: zoekterm
  const [searchTerm, setSearchTerm] = useState('');
  
  // Beschikbare platforms en inzicht types
  const platformOptions = [
    { value: 'all', label: 'Alle platforms' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'trustpilot', label: 'Trustpilot' }
  ];
  
  const insightTypeOptions = [
    { value: 'all', label: 'Alle types' },
    { value: 'trend', label: 'Trends' },
    { value: 'sentiment', label: 'Sentiment' }
  ];
  
  // Nieuw: sentiment opties
  const sentimentOptions = [
    { value: 'all', label: 'Alle sentimenten' },
    { value: 'positive', label: 'Positief' },
    { value: 'neutral', label: 'Neutraal' },
    { value: 'negative', label: 'Negatief' }
  ];
  
  // Nieuw: inhoudscategorie opties
  const categoryOptions = [
    { value: 'all', label: 'Alle categorieën' },
    { value: 'pain_points', label: 'Pijnpunten' },
    { value: 'desires', label: 'Verlangens' },
    { value: 'terminology', label: 'Terminologie' }
  ];
  
  // Nieuw: sorteeropties
  const sortByOptions = [
    { value: 'date', label: 'Datum' },
    { value: 'relevance', label: 'Relevantie' },
    { value: 'sentiment', label: 'Sentiment score' },
    { value: 'engagement', label: 'Engagement' }
  ];
  
  // Bereken beschikbare platforms uit de inzichten
  const availablePlatforms = insights.length > 0 
    ? [...new Set(insights.filter(i => i.platform).map(i => i.platform))]
    : [];
    
  // Haal inzichten op uit de database
  const fetchInsights = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Haal inzichten op uit de database
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('project_id', projectId)
        .gte('created_at', filters.periodStart.toISOString())
        .lte('created_at', filters.periodEnd.toISOString());
      
      if (error) throw error;
      
      setInsights(data || []);
      
      // Trigger refresh callback indien aanwezig
      if (onRefresh) onRefresh();
      
    } catch (err) {
      console.error('Fout bij het ophalen van inzichten:', err);
      setError(`Fout bij het ophalen van inzichten: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Genereer nieuwe inzichten
  const generateInsights = async () => {
    if (!projectId) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Roep de Edge Function aan om inzichten te genereren
      const { data, error } = await edgeFunctionsService.invoke('generate-insights', {
        projectId,
        periodStart: filters.periodStart.toISOString(),
        periodEnd: filters.periodEnd.toISOString()
      });
      
      if (error) throw error;
      
      // Haal de gegenereerde inzichten op
      await fetchInsights();
      
    } catch (err) {
      console.error('Fout bij het genereren van inzichten:', err);
      setError(`Fout bij het genereren van inzichten: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Filter inzichten op basis van de geselecteerde filters
  const filteredInsights = insights.filter(insight => {
    // Filter op platform
    if (filters.platform !== 'all' && insight.platform !== filters.platform) {
      return false;
    }
    
    // Filter op inzicht type
    if (filters.insightType !== 'all' && insight.type !== filters.insightType) {
      return false;
    }
    
    // Nieuw: filter op sentiment
    if (filters.sentiment !== 'all') {
      // Controleer of het inzicht sentiment data heeft
      if (!insight.data || !insight.data.sentiment) {
        return false;
      }
      
      // Bepaal het dominante sentiment
      const sentimentData = insight.data.sentiment || {};
      const dominantSentiment = getDominantSentiment(sentimentData);
      
      if (dominantSentiment !== filters.sentiment) {
        return false;
      }
    }
    
    // Nieuw: filter op inhoudscategorie
    if (filters.category !== 'all') {
      // Controleer of het inzicht categoriedata heeft
      if (!insight.data || !insight.data.categories) {
        return false;
      }
      
      // Controleer of de geselecteerde categorie voorkomt in de categorieën van het inzicht
      const categories = insight.data.categories || [];
      if (!categories.includes(filters.category)) {
        return false;
      }
    }
    
    // Nieuw: filter op zoekterm
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.trim().toLowerCase();
      const matchesSearch = 
        (insight.title && insight.title.toLowerCase().includes(searchTermLower)) ||
        (insight.description && insight.description.toLowerCase().includes(searchTermLower)) ||
        (insight.data && insight.data.keywords && 
          insight.data.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTermLower)
          ));
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Nieuw: sorteer de gefilterde inzichten
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    const direction = sortOptions.sortDirection === 'asc' ? 1 : -1;
    
    switch (sortOptions.sortBy) {
      case 'date':
        return direction * (new Date(a.created_at) - new Date(b.created_at));
        
      case 'relevance':
        return direction * ((b.data?.relevance_score || 0) - (a.data?.relevance_score || 0));
        
      case 'sentiment':
        const sentimentA = a.data?.average_score || 0;
        const sentimentB = b.data?.average_score || 0;
        return direction * (sentimentB - sentimentA);
        
      case 'engagement':
        const engagementA = a.data?.engagement_score || 0;
        const engagementB = b.data?.engagement_score || 0;
        return direction * (engagementB - engagementA);
        
      default:
        return 0;
    }
  });
  
  // Handler voor filter wijzigingen
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
    
    // Nieuw: sla filtervoorkeuren op in localStorage
    saveFilterPreferences({
      ...filters,
      [filterName]: value
    });
  };
  
  // Nieuw: handler voor sorteeropties wijzigingen
  const handleSortChange = (sortByValue) => {
    setSortOptions(prevOptions => ({
      ...prevOptions,
      sortBy: sortByValue
    }));
    
    // Nieuw: sla sorteervoorkeuren op in localStorage
    saveSortPreferences({
      ...sortOptions,
      sortBy: sortByValue
    });
  };
  
  // Nieuw: handler voor sorteerrichting wijzigingen
  const toggleSortDirection = () => {
    setSortOptions(prevOptions => ({
      ...prevOptions,
      sortDirection: prevOptions.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
    
    // Nieuw: sla sorteervoorkeuren op in localStorage
    saveSortPreferences({
      ...sortOptions,
      sortDirection: sortOptions.sortDirection === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // Nieuw: handler voor zoekterm wijzigingen
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handler voor het openen van het exportdialoog
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
    setExportError(null);
    setExportSuccess(false);
  };
  
  // Handler voor het sluiten van het exportdialoog
  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
  };
  
  // Handler voor het exporteren van inzichten
  const handleExportInsights = async (format) => {
    try {
      setExportLoading(true);
      setExportError(null);
      
      // Haal projectnaam op
      const { data: projectData } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      const projectName = projectData?.name || 'Project';
      
      // Exporteer inzichten
      const blob = await exportUtils.exportInsights(filteredInsights, format, {
        title: 'Decodo Inzichten',
        projectName,
        dateRange: {
          start: filters.periodStart,
          end: filters.periodEnd
        },
        platforms: filters.platform === 'all' ? availablePlatforms : [filters.platform],
        filters: {
          sentiment: filters.sentiment,
          category: filters.category,
          insightType: filters.insightType
        }
      });
      
      // Maak download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `insights_export.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportDialogOpen(false);
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error.message);
    } finally {
      setExportLoading(false);
    }
  };
  
  // Nieuw: reset alle filters naar standaardwaarden
  const resetFilters = () => {
    const defaultFilters = {
      platform: 'all',
      insightType: 'all',
      sentiment: 'all',
      category: 'all',
      periodStart: new Date(new Date().setDate(new Date().getDate() - 30)),
      periodEnd: new Date()
    };
    
    setFilters(defaultFilters);
    setSearchTerm('');
    setSortOptions({
      sortBy: 'date',
      sortDirection: 'desc'
    });
    
    // Sla de standaardwaarden op in localStorage
    saveFilterPreferences(defaultFilters);
    saveSortPreferences({
      sortBy: 'date',
      sortDirection: 'desc'
    });
    
    // Haal inzichten op met de standaardfilters
    fetchInsights();
  };
  
  // Handler voor het selecteren van een inzicht
  const handleSelectInsight = async (insight) => {
    setSelectedInsight(insight);
    setShowInsightDetail(true);
    
    // Haal gerelateerde inzichten op
    try {
      // Zoek inzichten met vergelijkbare inhoud of categorie
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('project_id', projectId)
        .neq('id', insight.id)
        .or(`category.eq.${insight.category},sentiment.eq.${insight.sentiment}`)
        .limit(5);
      
      if (error) throw error;
      setRelatedInsights(data || []);
    } catch (error) {
      console.error('Error fetching related insights:', error);
      setRelatedInsights([]);
    }
  };
  
  // Handler voor het sluiten van het inzichtdetail
  const handleCloseInsightDetail = () => {
    setShowInsightDetail(false);
    setSelectedInsight(null);
  };
  
  // Handler voor het opslaan van een actie voor een inzicht
  const handleSaveAction = async (insightId, actionText) => {
    try {
      // Sla de actie op in de database
      const { data, error } = await supabase
        .from('insight_actions')
        .insert([
          { 
            insight_id: insightId, 
            text: actionText,
            created_at: new Date().toISOString(),
            user_id: supabase.auth.user()?.id || null
          }
        ]);
      
      if (error) throw error;
      
      // Update het geselecteerde inzicht met de nieuwe actie
      if (selectedInsight && selectedInsight.id === insightId) {
        const newAction = {
          text: actionText,
          created_at: new Date().toISOString()
        };
        
        setSelectedInsight(prev => ({
          ...prev,
          actions: [...(prev.actions || []), newAction]
        }));
      }
      
      // Toon een succesmelding
      setError(null);
    } catch (error) {
      console.error('Error saving action:', error);
      setError('Fout bij het opslaan van de actie: ' + error.message);
    }
  };
  
  // Handler voor het markeren van een inzicht als favoriet
  const handleMarkFavorite = async (insightId, isFavorite) => {
    try {
      // Update het inzicht in de database
      const { data, error } = await supabase
        .from('insights')
        .update({ is_favorite: isFavorite })
        .eq('id', insightId);
      
      if (error) throw error;
      
      // Update het geselecteerde inzicht
      if (selectedInsight && selectedInsight.id === insightId) {
        setSelectedInsight(prev => ({
          ...prev,
          is_favorite: isFavorite
        }));
      }
      
      // Update de inzichten lijst
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, is_favorite: isFavorite } : insight
      ));
      
      // Toon een succesmelding
      setError(null);
    } catch (error) {
      console.error('Error marking favorite:', error);
      setError('Fout bij het markeren als favoriet: ' + error.message);
    }
  };
  
  // Nieuw: bepaal het dominante sentiment
  const getDominantSentiment = (sentimentData) => {
    if (!sentimentData) return 'neutral';
    
    const { positive, neutral, negative } = sentimentData;
    
    if (!positive || !neutral || !negative) return 'neutral';
    
    const posCount = positive.count || 0;
    const neuCount = neutral.count || 0;
    const negCount = negative.count || 0;
    
    if (posCount > neuCount && posCount > negCount) return 'positive';
    if (negCount > posCount && negCount > neuCount) return 'negative';
    return 'neutral';
  };
  
  // Nieuw: sla filtervoorkeuren op in localStorage
  const saveFilterPreferences = (filterPrefs) => {
    try {
      localStorage.setItem('decodoFilterPreferences', JSON.stringify(filterPrefs));
    } catch (error) {
      console.error('Fout bij het opslaan van filtervoorkeuren:', error);
    }
  };
  
  // Nieuw: sla sorteervoorkeuren op in localStorage
  const saveSortPreferences = (sortPrefs) => {
    try {
      localStorage.setItem('decodoSortPreferences', JSON.stringify(sortPrefs));
    } catch (error) {
      console.error('Fout bij het opslaan van sorteervoorkeuren:', error);
    }
  };
  
  // Nieuw: laad filtervoorkeuren uit localStorage
  const loadFilterPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem('decodoFilterPreferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        // Converteer datumstrings terug naar Date objecten
        if (parsedPrefs.periodStart) {
          parsedPrefs.periodStart = new Date(parsedPrefs.periodStart);
        }
        if (parsedPrefs.periodEnd) {
          parsedPrefs.periodEnd = new Date(parsedPrefs.periodEnd);
        }
        setFilters(parsedPrefs);
      }
    } catch (error) {
      console.error('Fout bij het laden van filtervoorkeuren:', error);
    }
  };

  // Functie voor het uitvoeren van de database migratie
  const runDatabaseMigration = async () => {
    try {
      // SQL voor het toevoegen van de insight_actions tabel en is_favorite kolom
      const sql = `
        -- Controleer of de tabel al bestaat
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_actions') THEN
                -- Maak de insight_actions tabel
                CREATE TABLE public.insight_actions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    insight_id UUID NOT NULL REFERENCES public.insights(id) ON DELETE CASCADE,
                    text TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ,
                    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    due_date TIMESTAMPTZ,
                    priority VARCHAR(20) DEFAULT 'medium'
                );

                -- Voeg RLS-beleid toe voor de insight_actions tabel
                ALTER TABLE public.insight_actions ENABLE ROW LEVEL SECURITY;

                -- Maak beleid voor het lezen van insight_actions
                CREATE POLICY "Gebruikers kunnen insight_actions lezen" ON public.insight_actions
                    FOR SELECT USING (
                        auth.uid() IN (
                            SELECT user_id FROM public.project_members 
                            WHERE project_id = (
                                SELECT project_id FROM public.insights 
                                WHERE id = insight_id
                            )
                        )
                    );

                -- Maak beleid voor het invoegen van insight_actions
                CREATE POLICY "Gebruikers kunnen insight_actions toevoegen" ON public.insight_actions
                    FOR INSERT WITH CHECK (
                        auth.uid() IN (
                            SELECT user_id FROM public.project_members 
                            WHERE project_id = (
                                SELECT project_id FROM public.insights 
                                WHERE id = insight_id
                            )
                        )
                    );

                -- Maak beleid voor het bijwerken van insight_actions
                CREATE POLICY "Gebruikers kunnen hun eigen insight_actions bijwerken" ON public.insight_actions
                    FOR UPDATE USING (
                        auth.uid() = user_id OR
                        auth.uid() IN (
                            SELECT user_id FROM public.project_members 
                            WHERE project_id = (
                                SELECT project_id FROM public.insights 
                                WHERE id = insight_id
                            ) AND role = 'admin'
                        )
                    );

                -- Maak beleid voor het verwijderen van insight_actions
                CREATE POLICY "Gebruikers kunnen hun eigen insight_actions verwijderen" ON public.insight_actions
                    FOR DELETE USING (
                        auth.uid() = user_id OR
                        auth.uid() IN (
                            SELECT user_id FROM public.project_members 
                            WHERE project_id = (
                                SELECT project_id FROM public.insights 
                                WHERE id = insight_id
                            ) AND role = 'admin'
                        )
                    );

                -- Voeg een index toe voor snellere zoekopdrachten
                CREATE INDEX idx_insight_actions_insight_id ON public.insight_actions(insight_id);
                CREATE INDEX idx_insight_actions_user_id ON public.insight_actions(user_id);
                
                -- Voeg een trigger toe voor het bijwerken van updated_at
                CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON public.insight_actions
                FOR EACH ROW
                EXECUTE FUNCTION public.set_updated_at();
            END IF;
            
            -- Voeg is_favorite kolom toe aan insights tabel als deze nog niet bestaat
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'insights' 
                AND column_name = 'is_favorite'
            ) THEN
                ALTER TABLE public.insights ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
            END IF;
        END
        $$;
      `;

      // Voer de SQL uit met de rpc functie
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error('Fout bij uitvoeren van migratie:', error);
      } else {
        console.log('Migratie succesvol uitgevoerd');
      }
    } catch (error) {
      console.error('Onverwachte fout bij uitvoeren van migratie:', error);
    }
  };

  // Nieuw: laad sorteervoorkeuren uit localStorage
  const loadSortPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem('decodoSortPreferences');
      if (savedPrefs) {
        return JSON.parse(savedPrefs);
      }
      return null;
    } catch (error) {
      console.error('Fout bij het laden van sorteervoorkeuren:', error);
      return null;
    }
  };

  // Effect voor het ophalen van inzichten bij het laden van de component
  useEffect(() => {
    // Voer de database migratie uit
    runDatabaseMigration();
    
    // Haal inzichten op
    fetchInsights();
    
    // Laad filtervoorkeuren uit localStorage
    const savedFilters = loadFilterPreferences();
    if (savedFilters) {
      setFilters(savedFilters);
    }
    
    // Laad sorteervoorkeuren uit localStorage
    const savedSortOptions = loadSortPreferences();
    if (savedSortOptions) {
      setSortOptions(savedSortOptions);
    }
  }, [projectId]);

  // Toggle filters weergave
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handler voor tab wijzigingen
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Render tab content op basis van de actieve tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Inzichten
        return (
          <Box sx={{ mt: 2 }}>
            {/* Inzichten content */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Inzichten
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ontdek waardevolle inzichten uit de verzamelde data.
            </Typography>
          </Box>
        );
      case 1: // Trends
        return <TrendInsights insights={sortedInsights} ref={trendChartRef} />;
      case 2: // Sentiment
        return <SentimentInsights insights={sortedInsights} ref={sentimentChartRef} />;
      case 3: // Marketing Aanbevelingen
        return <MarketingRecommendations 
                 insights={sortedInsights} 
                 projectId={projectId} 
                 onSave={() => setShowRecommendations(true)} 
               />;
      default:
        return null;
    }
  };
  
  // Laad inzichten bij component mount en wanneer filters wijzigen
  useEffect(() => {
    fetchInsights();
  }, [projectId]);
  
  // Nieuw: laad filtervoorkeuren en sorteervoorkeuren bij component mount
  useEffect(() => {
    loadFilterPreferences();
    loadSortPreferences();
  }, []);
  
  return (
    <Box className="decodo-insights-dashboard">
      <Paper elevation={2} className="dashboard-container">
        <GradientBackground>
          <Box className="dashboard-header" sx={{ p: 3 }}>
            <TextGradient variant="h5" component="h2" animate={true} gutterBottom>
              Decodo Inzichten Dashboard
            </TextGradient>
            <Typography variant="subtitle2" color="text.secondary">
              Gebaseerd op Decodo API scraping resultaten
            </Typography>
          
            <Box className="dashboard-actions" sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={toggleFilters}
                size="small"
              >
                Filters {showFilters ? 'Verbergen' : 'Tonen'}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<LightbulbIcon />}
                onClick={generateInsights}
                disabled={isGenerating}
                size="small"
              >
                {isGenerating ? 'Genereren...' : 'Genereer Inzichten'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleOpenExportDialog}
                sx={{ mr: 1 }}
              >
                Exporteren
              </Button>
              
              <Tooltip title="Ververs inzichten">
                <IconButton 
                  onClick={fetchInsights} 
                  disabled={isLoading}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </GradientBackground>
        
        {/* Filters */}
        {showFilters && (
          <Box className="filters-container advanced-filters" sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  label="Platform"
                  name="platform"
                  value={filters.platform}
                  onChange={(value) => handleFilterChange('platform', value)}
                  options={platformOptions}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  label="Type Inzicht"
                  name="insightType"
                  value={filters.insightType}
                  onChange={(value) => handleFilterChange('insightType', value)}
                  options={insightTypeOptions}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  label="Sentiment"
                  name="sentiment"
                  value={filters.sentiment}
                  onChange={(value) => handleFilterChange('sentiment', value)}
                  options={sentimentOptions}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  label="Inhoudscategorie"
                  name="category"
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={categoryOptions}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
                  <DatePicker
                    label="Periode Start"
                    value={filters.periodStart}
                    onChange={(newValue) => handleFilterChange('periodStart', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
                  <DatePicker
                    label="Periode Eind"
                    value={filters.periodEnd}
                    onChange={(newValue) => handleFilterChange('periodEnd', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  label="Zoeken"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                  placeholder="Zoek in inzichten..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Select
                    label="Sorteren op"
                    name="sortBy"
                    value={sortOptions.sortBy}
                    onChange={(value) => handleSortChange(value)}
                    options={sortByOptions}
                    variant="outlined"
                  />
                  
                  <Tooltip title={sortOptions.sortDirection === 'asc' ? 'Oplopend' : 'Aflopend'}>
                    <IconButton onClick={toggleSortDirection} color="primary">
                      {sortOptions.sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              
              <Grid item xs={12} container justifyContent="space-between" sx={{ mt: 2 }}>
                <Button 
                  variant="text" 
                  onClick={resetFilters}
                  startIcon={<FilterListIcon />}
                  className="clear-filters-button"
                >
                  Filters Resetten
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={fetchInsights}
                  startIcon={<RefreshIcon />}
                  className="filter-button"
                >
                  Filters Toepassen
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Tabs en content */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Inzichten" icon={<LightbulbIcon />} iconPosition="start" />
              <Tab label="Trends" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Sentiment" icon={<SentimentIcon />} iconPosition="start" />
              <Tab label="Marketing" icon={<CampaignIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          <Box sx={{ minHeight: 400 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Inzichten laden...
                </Typography>
              </Box>
            ) : sortedInsights.length === 0 ? (
              <Card variant="outlined" sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent>
                  <Box textAlign="center" py={5}>
                    <LightbulbIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Geen inzichten gevonden
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Genereer inzichten om trends en patronen te ontdekken
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={generateInsights}
                      disabled={isGenerating}
                      sx={{ mt: 2 }}
                    >
                      {isGenerating ? 'Genereren...' : 'Genereer Inzichten'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={showInsightDetail ? 8 : 12}>
                  {activeTab === 0 ? (
                    <TrendInsights 
                      ref={trendChartRef}
                      insights={sortedInsights.filter(insight => insight.type === 'trend')} 
                      platforms={availablePlatforms}
                    />
                  ) : (
                    <SentimentInsights 
                      ref={sentimentChartRef}
                      insights={sortedInsights.filter(insight => insight.type === 'sentiment')} 
                      platforms={availablePlatforms}
                    />
                  )}
                  
                  {/* Lijst van inzichten */}
                  <Box sx={{ mt: 3 }}>
                    <TextGradient variant="h6" gradient="blue-to-teal" sx={{ mb: 2 }}>
                      Individuele Inzichten
                    </TextGradient>
                    <Grid container spacing={2}>
                      {sortedInsights.slice(0, 6).map((insight) => (
                        <Grid item xs={12} sm={6} md={showInsightDetail ? 6 : 4} key={insight.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                              },
                              bgcolor: selectedInsight?.id === insight.id ? 'rgba(0, 173, 173, 0.05)' : 'transparent',
                              border: selectedInsight?.id === insight.id ? '1px solid rgba(0, 173, 173, 0.3)' : '1px solid rgba(0, 0, 0, 0.12)'
                            }}
                            onClick={() => handleSelectInsight(insight)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                <Chip 
                                  label={insight.platform} 
                                  size="small" 
                                  sx={{ mr: 0.5 }}
                                />
                                {insight.sentiment === 'positive' && <SentimentPositiveIcon color="success" fontSize="small" />}
                                {insight.sentiment === 'negative' && <SentimentNegativeIcon color="error" fontSize="small" />}
                                {insight.sentiment === 'neutral' && <SentimentNeutralIcon color="info" fontSize="small" />}
                                {insight.is_favorite && <StarIcon color="warning" fontSize="small" sx={{ ml: 'auto' }} />}
                              </Box>
                              <Typography variant="body2" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '4.5em'
                              }}>
                                {insight.content}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(insight.created_at), 'd MMM yyyy', { locale: nl })}
                                </Typography>
                                <Chip 
                                  label={insight.category === 'pain_point' ? 'Pijnpunt' : 
                                         insight.category === 'desire' ? 'Verlangen' : 
                                         insight.category === 'terminology' ? 'Terminologie' : 
                                         insight.category} 
                                  size="small" 
                                  color={insight.category === 'pain_point' ? 'error' : 
                                         insight.category === 'desire' ? 'success' : 
                                         'default'}
                                  variant="outlined"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    {sortedInsights.length > 6 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="text" endIcon={<ExpandMoreIcon />}>
                          Toon meer inzichten
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                {/* Detail panel */}
                {showInsightDetail && (
                  <Grid item xs={12} md={4}>
                    <InsightDetail 
                      insight={selectedInsight}
                      relatedInsights={relatedInsights}
                      onClose={handleCloseInsightDetail}
                      onSaveAction={handleSaveAction}
                      onMarkFavorite={handleMarkFavorite}
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog}>
        <DialogTitle>Exporteer Inzichten</DialogTitle>
        <DialogContent>
          {exportLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : exportSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Export succesvol! Het bestand wordt gedownload.
            </Alert>
          ) : (
            <>
              {exportError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {exportError}
                </Alert>
              )}
              <Typography variant="body1" paragraph>
                Kies een formaat om de {sortedInsights.length} inzichten te exporteren:
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleExportInsights('pdf')}>
                    <ListItemIcon>
                      <PdfIcon />
                    </ListItemIcon>
                    <ListItemText primary="PDF Document" secondary="Geformatteerd rapport met inzichten en samenvatting" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleExportInsights('excel')}>
                    <ListItemIcon>
                      <ExcelIcon />
                    </ListItemIcon>
                    <ListItemText primary="Excel Bestand" secondary="Spreadsheet met alle inzichten en een samenvatting tab" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleExportInsights('csv')}>
                    <ListItemIcon>
                      <CsvIcon />
                    </ListItemIcon>
                    <ListItemText primary="CSV Bestand" secondary="Comma-separated values voor gebruik in andere tools" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleExportInsights('json')}>
                    <ListItemIcon>
                      <JsonIcon />
                    </ListItemIcon>
                    <ListItemText primary="JSON Bestand" secondary="Ruwe data voor ontwikkelaars en API integratie" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExportDialog} color="primary">
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

DecodoInsightsDashboard.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectName: PropTypes.string,
  onRefresh: PropTypes.func
};

export default DecodoInsightsDashboard;
