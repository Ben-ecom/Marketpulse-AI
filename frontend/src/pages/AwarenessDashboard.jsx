import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import AwarenessDashboard from '../components/awareness/AwarenessDashboard';
import IntegratedHelpSystem from '../components/help/IntegratedHelpSystem';
import ContextualTooltip from '../components/help/ContextualTooltip';
import { supabase } from '../utils/supabaseClient';
import { classifyAndGroupByAwarenessPhase } from '../utils/insights/awarenessClassification';

/**
 * Awareness Dashboard Pagina
 * Toont de 5 awareness fasen van Eugene Schwartz voor een project
 */
const AwarenessDashboardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Laad project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
          
        if (projectError) throw projectError;
        
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Kon project niet laden. Probeer het later opnieuw.');
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  // Laad insights data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Haal insights op van alle platforms
        const { data: insightsData, error: insightsError } = await supabase
          .from('insights')
          .select('*')
          .eq('project_id', projectId);
          
        if (insightsError) throw insightsError;
        
        // Transformeer data voor awareness classificatie
        const transformedData = insightsData.map(item => ({
          id: item.id,
          text: item.content || '',
          title: item.title || '',
          platform: item.platform || 'unknown',
          date: item.created_at,
          sentiment: item.sentiment || 'neutral'
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Kon inzichten niet laden. Probeer het later opnieuw.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (projectId) {
      fetchData();
    }
  }, [projectId]);
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    // Simuleer data refresh (vervang dit door echte data fetch)
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };
  
  // Bereid voorbeeld data voor als er geen data is
  const prepareExampleData = () => {
    return [
      {
        id: 1,
        text: "Wat zijn de beste manieren om mijn online zichtbaarheid te verbeteren?",
        title: "Online zichtbaarheid",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 2,
        text: "Ik heb moeite om mijn doelgroep te bereiken ondanks veel marketing inspanningen.",
        title: "Doelgroep bereiken",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 3,
        text: "Welke SEO-strategieën werken het beste voor kleine bedrijven?",
        title: "SEO-strategieën",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 4,
        text: "Ik ben op zoek naar een tool die mijn social media posts kan plannen en analyseren.",
        title: "Social media tool",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 5,
        text: "Heeft iemand ervaring met MarketPulse AI? Ik overweeg het aan te schaffen voor mijn bedrijf.",
        title: "MarketPulse AI ervaring",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 6,
        text: "MarketPulse AI heeft mijn marketing strategie compleet veranderd. Zeer tevreden met de inzichten!",
        title: "Positieve ervaring",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 7,
        text: "Waar kan ik MarketPulse AI kopen met korting? Zijn er speciale aanbiedingen?",
        title: "Aankoopvraag",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 8,
        text: "Ik heb problemen met het bereiken van mijn doelgroep op Instagram. Welke strategieën werken voor jullie?",
        title: "Instagram strategie",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 9,
        text: "MarketPulse AI vs. concurrenten: wat zijn de belangrijkste verschillen?",
        title: "Vergelijking",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 10,
        text: "Hoe installeer ik MarketPulse AI? De handleiding is niet duidelijk.",
        title: "Installatieproblemen",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 11,
        text: "Ik ben op zoek naar manieren om mijn conversiepercentage te verhogen. Heeft iemand tips?",
        title: "Conversie verbeteren",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 12,
        text: "MarketPulse AI heeft geweldige functies maar is duur vergeleken met alternatieven.",
        title: "Prijsvergelijking",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 13,
        text: "Ik wil MarketPulse AI bestellen. Hoe lang duurt de levering?",
        title: "Bestelvraag",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 14,
        text: "Wat zijn de beste oplossingen voor het analyseren van klantfeedback?",
        title: "Feedback analyse",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 15,
        text: "Ik heb last van lage engagement rates op mijn social media posts.",
        title: "Engagement probleem",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "negative"
      }
    ];
  };
  
  // Als er geen data is, gebruik voorbeeld data
  const displayData = data.length > 0 ? data : prepareExampleData();
  
  return (
    <IntegratedHelpSystem activeView="awareness">
      <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            Dashboard
          </Link>
          {project && (
            <Link 
              color="inherit" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate(`/project/${projectId}`);
              }}
            >
              {project.name}
            </Link>
          )}
          <Typography color="text.primary">Awareness Fasen</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{ mb: 1 }}
          >
            Terug naar project
          </Button>
          <ContextualTooltip
            title="Awareness Fasen Analyse"
            content="Deze pagina toont een analyse van uw doelgroep volgens de 5 awareness fasen van Eugene Schwartz. Gebruik deze inzichten om uw marketingboodschap aan te passen aan het bewustzijnsniveau van uw doelgroep."
            videoUrl="https://example.com/videos/awareness-analysis.mp4"
            learnMoreUrl="https://docs.example.com/awareness-phases"
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Awareness Fasen Analyse
            </Typography>
          </ContextualTooltip>
          <Typography variant="subtitle1" color="text.secondary">
            {project ? project.name : 'Laden...'}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Intro */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <ContextualTooltip
          title="Eugene Schwartz Awareness Fasen"
          content="De 5 awareness fasen van Eugene Schwartz vormen een krachtig framework voor het begrijpen van uw doelgroep en het aanpassen van uw marketing aan hun bewustzijnsniveau."
          videoUrl="https://example.com/videos/eugene-schwartz.mp4"
          learnMoreUrl="https://docs.example.com/eugene-schwartz-framework"
        >
          <Typography variant="h6" gutterBottom>
            Over Awareness Fasen
          </Typography>
        </ContextualTooltip>
        <Typography variant="body1" paragraph>
          De 5 awareness fasen van Eugene Schwartz beschrijven de verschillende niveaus van bewustzijn die uw doelgroep heeft over hun problemen en uw oplossingen.
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <ContextualTooltip
            title="Unaware Fase"
            content="In deze fase heeft uw doelgroep nog geen bewustzijn van het probleem dat uw product oplost. Focus op het creëren van bewustzijn over het probleem en de gevolgen ervan."
            placement="right"
          >
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Unaware</strong> - Uw doelgroep heeft geen bewustzijn van het probleem
            </Typography>
          </ContextualTooltip>
          <ContextualTooltip
            title="Problem Aware Fase"
            content="In deze fase is uw doelgroep zich bewust van het probleem, maar weet nog niet welke oplossingen er zijn. Focus op het educeren over mogelijke oplossingsrichtingen."
            placement="right"
          >
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Problem Aware</strong> - Uw doelgroep is bewust van het probleem, maar niet van oplossingen
            </Typography>
          </ContextualTooltip>
          <ContextualTooltip
            title="Solution Aware Fase"
            content="In deze fase kent uw doelgroep de mogelijke oplossingstypen, maar niet de specifieke producten. Focus op waarom uw productcategorie de beste oplossing is."
            placement="right"
          >
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Solution Aware</strong> - Uw doelgroep is bewust van oplossingstypen, maar niet van specifieke producten
            </Typography>
          </ContextualTooltip>
          <ContextualTooltip
            title="Product Aware Fase"
            content="In deze fase kent uw doelgroep uw product, maar is nog niet overtuigd om het te kopen. Focus op waarom uw product beter is dan alternatieven."
            placement="right"
          >
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Product Aware</strong> - Uw doelgroep is bewust van specifieke producten, maar nog niet overtuigd
            </Typography>
          </ContextualTooltip>
          <ContextualTooltip
            title="Most Aware Fase"
            content="In deze fase is uw doelgroep volledig bewust van uw product en klaar om te kopen. Focus op het wegnemen van laatste belemmeringen en het stimuleren van actie."
            placement="right"
          >
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Most Aware</strong> - Uw doelgroep is volledig bewust en klaar voor aankoop
            </Typography>
          </ContextualTooltip>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Door te begrijpen in welke awareness fase uw doelgroep zich bevindt, kunt u uw marketingboodschap aanpassen voor maximale effectiviteit.
        </Typography>
      </Paper>
      
      {/* Dashboard */}
      <AwarenessDashboard
        data={displayData}
        projectName={project ? project.name : 'Project'}
        isLoading={isLoading}
        error={error}
        productName={project ? project.product_name || project.name : 'uw product'}
        industrie={project ? project.industry || 'uw industrie' : 'uw industrie'}
        onRefresh={handleRefresh}
      />
      </Container>
    </IntegratedHelpSystem>
  );
};

export default AwarenessDashboardPage;
