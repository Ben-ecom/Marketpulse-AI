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
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import TrendingTopicsDashboard from '../components/trending/TrendingTopicsDashboard';
import { supabase } from '../api/supabase';

/**
 * Trending Topics Dashboard Pagina
 * Toont trending topics analyse voor een project
 */
const TrendingTopicsDashboardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
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
        // Bepaal huidige en vorige periode
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2);
        
        // Haal huidige periode data op
        const { data: currentInsights, error: currentError } = await supabase
          .from('insights')
          .select('*')
          .eq('project_id', projectId)
          .gte('created_at', oneMonthAgo.toISOString())
          .lte('created_at', now.toISOString());
          
        if (currentError) throw currentError;
        
        // Haal vorige periode data op
        const { data: previousInsights, error: previousError } = await supabase
          .from('insights')
          .select('*')
          .eq('project_id', projectId)
          .gte('created_at', twoMonthsAgo.toISOString())
          .lt('created_at', oneMonthAgo.toISOString());
          
        if (previousError) throw previousError;
        
        // Transformeer data voor trending topics analyse
        const transformedCurrentData = currentInsights.map(item => ({
          id: item.id,
          text: item.content || '',
          title: item.title || '',
          platform: item.platform || 'unknown',
          date: item.created_at,
          sentiment: item.sentiment || 'neutral'
        }));
        
        const transformedPreviousData = previousInsights.map(item => ({
          id: item.id,
          text: item.content || '',
          title: item.title || '',
          platform: item.platform || 'unknown',
          date: item.created_at,
          sentiment: item.sentiment || 'neutral'
        }));
        
        setCurrentData(transformedCurrentData);
        setPreviousData(transformedPreviousData);
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
    // Huidige periode data
    const currentExampleData = [
      {
        id: 1,
        text: "De prijs-kwaliteitverhouding van dit product is echt geweldig. Ik ben zeer tevreden met mijn aankoop.",
        title: "Geweldige prijs-kwaliteitverhouding",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 2,
        text: "De kwaliteit van het product laat te wensen over. Na slechts een week gebruik begon het al kapot te gaan.",
        title: "Slechte kwaliteit",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 3,
        text: "Heeft iemand ervaring met de duurzaamheid van dit product? Ik overweeg het te kopen maar wil zeker weten dat het lang meegaat.",
        title: "Vraag over duurzaamheid",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 4,
        text: "De klantenservice van dit bedrijf is uitstekend. Ze hebben mijn probleem snel en efficiënt opgelost.",
        title: "Uitstekende klantenservice",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 5,
        text: "Het design van dit product is echt prachtig. Het past perfect in mijn interieur.",
        title: "Mooi design",
        platform: "instagram",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 6,
        text: "De levering was veel sneller dan verwacht. Binnen 2 dagen had ik mijn bestelling al in huis.",
        title: "Snelle levering",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 7,
        text: "Ik ben teleurgesteld in de klantenservice. Het duurde dagen voordat ik antwoord kreeg op mijn vraag.",
        title: "Trage klantenservice",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 8,
        text: "De prijs van dit product is echt te hoog voor wat je krijgt. Er zijn betere alternatieven voor minder geld.",
        title: "Te duur",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 9,
        text: "Het gebruiksgemak van dit product is geweldig. Zelfs mijn oma van 85 kan ermee overweg.",
        title: "Gebruiksvriendelijk",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 10,
        text: "De duurzaamheid van dit product is indrukwekkend. Ik heb het nu al 2 jaar en het werkt nog steeds perfect.",
        title: "Zeer duurzaam",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 11,
        text: "Heeft iemand ervaring met de klantenservice van dit bedrijf? Ik heb een probleem met mijn bestelling.",
        title: "Vraag over klantenservice",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "neutral"
      },
      {
        id: 12,
        text: "De verpakking van dit product is echt duurzaam. Alles is recyclebaar en er is geen onnodig plastic gebruikt.",
        title: "Duurzame verpakking",
        platform: "instagram",
        date: new Date().toISOString(),
        sentiment: "positive"
      },
      {
        id: 13,
        text: "De functionaliteit van dit product is beperkt. Je kunt er veel minder mee dan de advertentie doet geloven.",
        title: "Beperkte functionaliteit",
        platform: "trustpilot",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 14,
        text: "Het installeren van dit product was een nachtmerrie. De handleiding is onduidelijk en de klantenservice kon niet helpen.",
        title: "Moeilijke installatie",
        platform: "reddit",
        date: new Date().toISOString(),
        sentiment: "negative"
      },
      {
        id: 15,
        text: "De prijs-kwaliteitverhouding van dit product is echt geweldig. Je krijgt veel waar voor je geld.",
        title: "Goede prijs-kwaliteitverhouding",
        platform: "amazon",
        date: new Date().toISOString(),
        sentiment: "positive"
      }
    ];
    
    // Vorige periode data
    const previousExampleData = [
      {
        id: 101,
        text: "De kwaliteit van dit product is uitstekend. Het is duidelijk gemaakt van hoogwaardige materialen.",
        title: "Uitstekende kwaliteit",
        platform: "trustpilot",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "positive"
      },
      {
        id: 102,
        text: "De prijs is aan de hoge kant, maar gezien de kwaliteit is het het waard.",
        title: "Prijzig maar goed",
        platform: "amazon",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "neutral"
      },
      {
        id: 103,
        text: "Het design laat te wensen over. Het ziet er goedkoop uit ondanks de hoge prijs.",
        title: "Teleurstellend design",
        platform: "trustpilot",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "negative"
      },
      {
        id: 104,
        text: "De klantenservice was behulpzaam maar traag. Het duurde bijna een week voordat mijn probleem was opgelost.",
        title: "Trage klantenservice",
        platform: "trustpilot",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "neutral"
      },
      {
        id: 105,
        text: "De levering duurde langer dan verwacht. Ik moest bijna twee weken wachten op mijn bestelling.",
        title: "Trage levering",
        platform: "amazon",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "negative"
      },
      {
        id: 106,
        text: "Het gebruiksgemak is redelijk, maar er is een leercurve. De handleiding is niet erg duidelijk.",
        title: "Redelijk gebruiksgemak",
        platform: "reddit",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "neutral"
      },
      {
        id: 107,
        text: "De duurzaamheid is een vraagteken. Ik gebruik het nu een maand en er zijn al tekenen van slijtage.",
        title: "Twijfels over duurzaamheid",
        platform: "reddit",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "negative"
      },
      {
        id: 108,
        text: "De functionaliteit is beperkt maar voldoende voor mijn behoeften. Niet meer, niet minder.",
        title: "Basis functionaliteit",
        platform: "trustpilot",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "neutral"
      },
      {
        id: 109,
        text: "De installatie was eenvoudig dankzij de duidelijke instructies. Binnen 10 minuten was alles werkend.",
        title: "Eenvoudige installatie",
        platform: "amazon",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "positive"
      },
      {
        id: 110,
        text: "De verpakking was beschadigd bij aankomst, maar het product zelf was gelukkig intact.",
        title: "Beschadigde verpakking",
        platform: "trustpilot",
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        sentiment: "neutral"
      }
    ];
    
    return {
      current: currentExampleData,
      previous: previousExampleData
    };
  };
  
  // Als er geen data is, gebruik voorbeeld data
  const exampleData = prepareExampleData();
  const displayCurrentData = currentData.length > 0 ? currentData : exampleData.current;
  const displayPreviousData = previousData.length > 0 ? previousData : exampleData.previous;
  
  return (
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
          <Typography color="text.primary">Trending Topics</Typography>
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
          <Typography variant="h4" component="h1" gutterBottom>
            Trending Topics Analyse
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project ? project.name : 'Laden...'}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Intro */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Over Trending Topics Analyse
        </Typography>
        <Typography variant="body1" paragraph>
          De Trending Topics Analyse identificeert en analyseert opkomende onderwerpen en trends in uw markt. 
          Dit helpt u om snel in te spelen op veranderende interesses en behoeften van uw doelgroep.
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" gutterBottom>
            <strong>Trending Topics</strong> - Ontdek welke onderwerpen momenteel populair zijn in uw markt
          </Typography>
          <Typography component="li" variant="body2" gutterBottom>
            <strong>Tijdlijn Analyse</strong> - Volg hoe topics zich ontwikkelen over tijd
          </Typography>
          <Typography component="li" variant="body2" gutterBottom>
            <strong>Platform Vergelijking</strong> - Vergelijk trending topics tussen verschillende platforms
          </Typography>
          <Typography component="li" variant="body2" gutterBottom>
            <strong>Gerelateerde Topics</strong> - Ontdek verbanden tussen verschillende onderwerpen
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Door trending topics te analyseren kunt u uw content, productontwikkeling en marketingstrategie afstemmen op wat uw doelgroep bezighoudt.
        </Typography>
      </Paper>
      
      {/* Dashboard */}
      <TrendingTopicsDashboard
        data={displayCurrentData}
        previousData={displayPreviousData}
        projectName={project ? project.name : 'Project'}
        isLoading={isLoading}
        error={error}
        onRefresh={handleRefresh}
      />
    </Container>
  );
};

export default TrendingTopicsDashboardPage;
