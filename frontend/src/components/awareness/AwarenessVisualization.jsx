import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Component voor het visualiseren van de customer journey fasen
 * Toont de verdeling van klanten over de verschillende awareness fasen
 */
const AwarenessVisualization = ({ data = {} }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Default data als er geen data wordt doorgegeven
  const phaseData = data.phases || {
    awareness: 40,
    consideration: 30,
    decision: 20,
    loyalty: 10
  };
  
  const phases = [
    { 
      name: 'Awareness', 
      value: phaseData.awareness || 0, 
      color: '#3f51b5',
      icon: <VisibilityIcon />,
      description: 'Klanten die bekend zijn met je merk of product, maar nog geen concrete interesse hebben getoond.',
      insights: [
        'Meeste klanten ontdekken je merk via sociale media',
        'Organisch zoekverkeer groeit met 15% per maand',
        'Naamsbekendheid is het hoogst in de leeftijdsgroep 25-34'
      ],
      recommendations: [
        'Verhoog content marketing inspanningen',
        'Optimaliseer SEO voor belangrijke zoekwoorden',
        'Overweeg gerichte advertentiecampagnes'
      ]
    },
    { 
      name: 'Consideration', 
      value: phaseData.consideration || 0, 
      color: '#2196f3',
      icon: <ShoppingCartIcon />,
      description: 'Klanten die actief je product overwegen en vergelijken met alternatieven.',
      insights: [
        'Gemiddeld 3 bezoeken aan de productpagina voor conversie',
        'Prijsvergelijking is de meest gebruikte functie',
        '45% van de bezoekers bekijkt ook reviews'
      ],
      recommendations: [
        "Verbeter productpagina's met meer details",
        'Voeg vergelijkingstabellen toe',
        'Implementeer een review-systeem'
      ]
    },
    { 
      name: 'Decision', 
      value: phaseData.decision || 0, 
      color: '#03a9f4',
      icon: <CheckCircleIcon />,
      description: 'Klanten die besloten hebben om je product te kopen.',
      insights: [
        'Conversieratio is 4.2% (branchegemiddelde: 3.1%)',
        'Winkelwagenverlating is 62%',
        'Meeste aankopen gebeuren op maandag en dinsdag'
      ],
      recommendations: [
        'Optimaliseer checkout proces',
        'Implementeer winkelwagenverlating e-mails',
        'Bied tijdelijke kortingen aan'
      ]
    },
    { 
      name: 'Loyalty', 
      value: phaseData.loyalty || 0, 
      color: '#00bcd4',
      icon: <FavoriteIcon />,
      description: 'Terugkerende klanten die loyaal zijn aan je merk.',
      insights: [
        '22% van de klanten koopt binnen 6 maanden opnieuw',
        'Loyale klanten geven gemiddeld 40% meer uit',
        'NPS score is 42 (branchegemiddelde: 32)'
      ],
      recommendations: [
        'Start een loyaliteitsprogramma',
        'Implementeer gepersonaliseerde aanbiedingen',
        'Vraag actief om feedback en reviews'
      ]
    }
  ];
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Journey Analyse
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Visualisatie van de verdeling van klanten over de verschillende fasen van de customer journey.
        Klik op een fase voor gedetailleerde inzichten en aanbevelingen.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Vereenvoudigde visualisatie met voortgangsbalken */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Deze visualisatie toont de verdeling van klanten over de verschillende fasen van de customer journey.
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          In een productieomgeving zou hier een geavanceerde visualisatie staan met een interactief cirkeldiagram.
          Voor nu gebruiken we een vereenvoudigde weergave met voortgangsbalken.
        </Alert>
        
        <Grid container spacing={2}>
          {phases.map((phase) => (
            <Grid item xs={12} key={phase.name}>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: phase.color,
                    color: 'white',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    mr: 1
                  }}>
                    {phase.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                    {phase.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {phase.value}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={phase.value} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 1,
                    bgcolor: `${phase.color}22`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: phase.color
                    }
                  }} 
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Legenda */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
        {phases.map((phase) => (
          <Box 
            key={phase.name}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mx: 1,
              mb: 1,
              cursor: 'pointer'
            }}
            onClick={() => {
              const tabIndex = phases.findIndex(p => p.name === phase.name);
              setActiveTab(tabIndex);
            }}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                bgcolor: phase.color,
                mr: 0.5
              }} 
            />
            <Typography variant="body2">
              {phase.name}: {phase.value}%
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Tabs voor gedetailleerde informatie per fase */}
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="customer journey phases tabs"
        >
          {phases.map((phase) => (
            <Tab 
              key={phase.name}
              label={phase.name} 
              icon={phase.icon} 
              iconPosition="start"
              sx={{ 
                minHeight: 'auto',
                py: 1,
                '& .MuiTab-iconWrapper': {
                  color: phase.color
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Inhoud per fase */}
      {phases.map((phase, index) => (
        <Box
          key={phase.name}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`phase-tabpanel-${index}`}
          aria-labelledby={`phase-tab-${index}`}
          sx={{ mt: 2 }}
        >
          {activeTab === index && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" color={phase.color}>
                  {phase.name} Fase ({phase.value}%)
                </Typography>
                <Typography variant="body2" paragraph>
                  {phase.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Belangrijkste Inzichten
                    </Typography>
                    <List dense>
                      {phase.insights.map((insight, i) => (
                        <ListItem key={i}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: phase.color }} />
                          </ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Aanbevelingen
                    </Typography>
                    <List dense>
                      {phase.recommendations.map((recommendation, i) => (
                        <ListItem key={i}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: phase.color }} />
                          </ListItemIcon>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      ))}
    </Paper>
  );
};

export default AwarenessVisualization;
