import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Lightbulb as TipIcon,
  School as LearningIcon,
  Star as AdvancedIcon,
  EmojiObjects as BeginnerIcon
} from '@mui/icons-material';

/**
 * PersonalizedHelp Component
 * 
 * Een component dat gepersonaliseerde hulp biedt op basis van gebruikersrol en ervaring.
 * 
 * @component
 * @example
 * ```jsx
 * <PersonalizedHelp
 *   activeView="dashboard"
 *   userRole="marketeer"
 *   experienceLevel="intermediate"
 * />
 * ```
 */
const PersonalizedHelp = ({
  activeView = 'dashboard',
  userRole = 'general',
  experienceLevel = 'intermediate',
  onRoleChange,
  onExperienceLevelChange,
  showSettings = true
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [currentRole, setCurrentRole] = useState(userRole);
  const [currentExperienceLevel, setCurrentExperienceLevel] = useState(experienceLevel);
  const [showAdvancedTips, setShowAdvancedTips] = useState(experienceLevel !== 'beginner');
  
  // Effect om de rol en ervaringsniveau bij te werken wanneer props veranderen
  useEffect(() => {
    setCurrentRole(userRole);
    setCurrentExperienceLevel(experienceLevel);
    setShowAdvancedTips(experienceLevel !== 'beginner');
  }, [userRole, experienceLevel]);
  
  // Handler voor het wijzigen van de tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handler voor het wijzigen van de rol
  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setCurrentRole(newRole);
    
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };
  
  // Handler voor het wijzigen van het ervaringsniveau
  const handleExperienceLevelChange = (event) => {
    const newLevel = event.target.value;
    setCurrentExperienceLevel(newLevel);
    setShowAdvancedTips(newLevel !== 'beginner');
    
    if (onExperienceLevelChange) {
      onExperienceLevelChange(newLevel);
    }
  };
  
  // Handler voor het wijzigen van de geavanceerde tips instelling
  const handleAdvancedTipsChange = (event) => {
    setShowAdvancedTips(event.target.checked);
  };
  
  // Rol-specifieke content
  const roleSpecificContent = useMemo(() => {
    const content = {
      general: {
        dashboard: {
          title: 'Dashboard Help',
          description: 'Het dashboard biedt een overzicht van alle topic awareness data en visualisaties.',
          tips: [
            'Gebruik de filters bovenaan om specifieke databronnen of tijdsperiodes te selecteren.',
            'Klik op een topic in de visualisaties voor meer details.',
            'Gebruik de export functie om rapporten te genereren in verschillende formaten.'
          ],
          advancedTips: [
            'Combineer meerdere filters voor gedetailleerdere analyses.',
            'Vergelijk trends over verschillende tijdsperiodes door de datumbereik selector te gebruiken.'
          ]
        },
        report: {
          title: 'Rapport Help',
          description: 'Het rapport biedt een gedetailleerde analyse van de topic awareness data.',
          tips: [
            'Pas het rapport aan door secties toe te voegen of te verwijderen.',
            'Voeg opmerkingen toe aan specifieke inzichten voor je team.',
            'Exporteer het rapport in verschillende formaten zoals PDF of Excel.'
          ],
          advancedTips: [
            'Gebruik aangepaste branding opties voor client-facing rapporten.',
            'Maak gebruik van de automatische samenvatting functie voor executive summaries.'
          ]
        },
        sentiment: {
          title: 'Sentiment Analyse Help',
          description: 'De sentiment analyse biedt inzicht in positieve, neutrale en negatieve sentimenten.',
          tips: [
            'Filter op specifieke awareness fasen of topics voor diepere inzichten.',
            'Bekijk de sentiment trends over tijd om veranderingen te identificeren.',
            'Vergelijk sentiment tussen verschillende topics of fasen.'
          ],
          advancedTips: [
            'Combineer sentiment data met volume metrics voor een volledig beeld.',
            'Exporteer sentiment data voor gebruik in externe analyses.'
          ]
        },
        trends: {
          title: 'Trend Analyse Help',
          description: 'De trend analyse biedt inzicht in de ontwikkeling van topics en sentiment over tijd.',
          tips: [
            'Pas de tijdsgranulariteit aan (dag, week, maand) voor verschillende perspectieven.',
            'Vergelijk meerdere topics in één grafiek om relatieve trends te zien.',
            'Gebruik de trendlijn functie om algemene richtingen te identificeren.'
          ],
          advancedTips: [
            'Combineer trend data met externe gebeurtenissen voor contextuele analyse.',
            'Exporteer trend data voor gebruik in presentaties of rapporten.'
          ]
        }
      },
      marketeer: {
        dashboard: {
          title: 'Dashboard voor Marketeers',
          description: 'Als marketeer kun je het dashboard gebruiken om content strategie en campagnes te optimaliseren.',
          tips: [
            'Focus op de "Awareness" en "Consideration" fasen voor content inspiratie.',
            'Gebruik trending topics voor social media content en campagnes.',
            'Bekijk de content aanbevelingen voor ideeën voor je marketing kalender.'
          ],
          advancedTips: [
            'Correleer marketing campagnes met veranderingen in awareness metrics.',
            'Gebruik de sentiment analyse om de toon van je content aan te passen.'
          ]
        },
        report: {
          title: 'Rapport voor Marketeers',
          description: 'Genereer rapporten die je marketingstrategie ondersteunen en resultaten aantonen.',
          tips: [
            'Voeg de "Content Strategie" sectie toe voor specifieke aanbevelingen.',
            'Gebruik de "Campagne Impact" visualisatie om ROI aan te tonen.',
            'Exporteer rapporten voor presentaties aan stakeholders.'
          ],
          advancedTips: [
            'Combineer awareness data met conversie metrics voor volledige funnel inzichten.',
            'Maak aangepaste rapporten voor verschillende marketing kanalen.'
          ]
        },
        sentiment: {
          title: 'Sentiment Analyse voor Marketeers',
          description: 'Gebruik sentiment analyse om de effectiviteit van je marketing te meten.',
          tips: [
            'Monitor sentiment veranderingen na campagne lanceringen.',
            'Identificeer topics met negatief sentiment voor proactieve communicatie.',
            'Gebruik positief sentiment in testimonials en case studies.'
          ],
          advancedTips: [
            'Segmenteer sentiment per doelgroep voor gepersonaliseerde marketing.',
            'Correleer sentiment met engagement metrics voor diepere inzichten.'
          ]
        },
        trends: {
          title: 'Trend Analyse voor Marketeers',
          description: 'Gebruik trend analyse om vooruit te plannen en op de hoogte te blijven van veranderende interesses.',
          tips: [
            'Identificeer opkomende topics voor proactieve content creatie.',
            'Plan seizoensgebonden campagnes op basis van historische trends.',
            'Monitor concurrentie-gerelateerde topics voor strategische positionering.'
          ],
          advancedTips: [
            'Voorspel toekomstige trends met de predictive modeling functie.',
            'Combineer trend data met marktonderzoek voor validatie.'
          ]
        }
      },
      product_manager: {
        dashboard: {
          title: 'Dashboard voor Product Managers',
          description: 'Als product manager kun je het dashboard gebruiken om productfeedback en markttrends te analyseren.',
          tips: [
            'Focus op de "Consideration" en "Decision" fasen voor product feature prioritering.',
            'Gebruik de topic clustering om gerelateerde product feedback te identificeren.',
            'Monitor concurrentie-gerelateerde topics voor gap analyse.'
          ],
          advancedTips: [
            'Correleer product updates met veranderingen in sentiment en awareness.',
            'Gebruik de feature request tracker voor roadmap planning.'
          ]
        },
        report: {
          title: 'Rapport voor Product Managers',
          description: 'Genereer rapporten die productbeslissingen ondersteunen en marktinzichten bieden.',
          tips: [
            'Voeg de "Feature Prioritization" sectie toe voor data-gedreven besluitvorming.',
            'Gebruik de "Competitive Analysis" visualisatie voor marktpositionering.',
            'Exporteer rapporten voor stakeholder presentaties en roadmap reviews.'
          ],
          advancedTips: [
            'Combineer awareness data met gebruiksstatistieken voor volledige product inzichten.',
            'Maak aangepaste rapporten voor verschillende product lijnen of features.'
          ]
        },
        sentiment: {
          title: 'Sentiment Analyse voor Product Managers',
          description: 'Gebruik sentiment analyse om productfeedback te begrijpen en verbeterpunten te identificeren.',
          tips: [
            'Monitor sentiment veranderingen na product releases.',
            'Identificeer features met negatief sentiment voor prioritering van fixes.',
            'Gebruik positief sentiment voor marketing materiaal en case studies.'
          ],
          advancedTips: [
            'Segmenteer sentiment per gebruikerssegment voor gepersonaliseerde product ontwikkeling.',
            'Correleer sentiment met gebruiksstatistieken voor impact analyse.'
          ]
        },
        trends: {
          title: 'Trend Analyse voor Product Managers',
          description: 'Gebruik trend analyse om productinnovatie te sturen en op de hoogte te blijven van veranderende behoeften.',
          tips: [
            'Identificeer opkomende use cases voor product innovatie.',
            'Monitor feature requests over tijd voor roadmap planning.',
            'Analyseer concurrentie-gerelateerde trends voor strategische positionering.'
          ],
          advancedTips: [
            'Voorspel toekomstige product behoeften met de predictive modeling functie.',
            'Combineer trend data met gebruikersinterviews voor validatie.'
          ]
        }
      },
      analyst: {
        dashboard: {
          title: 'Dashboard voor Analisten',
          description: 'Als analist kun je het dashboard gebruiken voor diepgaande data-analyse en inzichtgeneratie.',
          tips: [
            'Gebruik de geavanceerde filters voor gedetailleerde datasegmentatie.',
            'Exporteer ruwe data voor externe analyses in je favoriete tools.',
            'Combineer meerdere metrics voor correlatie analyses.'
          ],
          advancedTips: [
            'Gebruik de API integratie voor real-time data pipelining.',
            'Pas aangepaste algoritmes toe op de ruwe data voor specifieke analyses.'
          ]
        },
        report: {
          title: 'Rapport voor Analisten',
          description: 'Genereer gedetailleerde rapporten met diepgaande data en methodologie.',
          tips: [
            'Voeg de "Methodologie" sectie toe voor transparantie in data analyse.',
            'Gebruik de "Data Quality" metrics voor betrouwbaarheidsanalyse.',
            'Exporteer rapporten met ruwe data bijlagen voor verdere analyse.'
          ],
          advancedTips: [
            'Maak aangepaste visualisaties met de geavanceerde charting tools.',
            'Integreer externe data bronnen voor contextuele verrijking.'
          ]
        },
        sentiment: {
          title: 'Sentiment Analyse voor Analisten',
          description: 'Gebruik geavanceerde sentiment analyse tools voor diepgaande opinieanalyse.',
          tips: [
            'Pas sentiment algoritmes aan voor domein-specifieke nauwkeurigheid.',
            'Gebruik entity-level sentiment voor gedetailleerde analyse.',
            'Exporteer sentiment data met confidence scores voor statistische validatie.'
          ],
          advancedTips: [
            'Combineer NLP features voor multi-dimensionale sentiment analyse.',
            'Gebruik de sentiment comparison tool voor benchmark analyses.'
          ]
        },
        trends: {
          title: 'Trend Analyse voor Analisten',
          description: 'Gebruik geavanceerde trend analyse tools voor voorspellende modellering en patroonherkenning.',
          tips: [
            'Pas statistische significantie filters toe op trend data.',
            'Gebruik seizoensgebonden correctie voor accurate trend identificatie.',
            'Exporteer trend data met confidence intervals voor rapportage.'
          ],
          advancedTips: [
            'Pas machine learning modellen toe voor trend voorspelling.',
            'Gebruik anomaly detection voor het identificeren van onverwachte patronen.'
          ]
        }
      }
    };
    
    // Fallback naar general als de rol niet bestaat
    return content[currentRole] || content.general;
  }, [currentRole]);
  
  // Ervaringsniveau-specifieke content
  const experienceLevelContent = useMemo(() => {
    const content = {
      beginner: {
        title: 'Voor beginners',
        icon: <BeginnerIcon />,
        description: 'Basisinformatie en stapsgewijze instructies voor nieuwe gebruikers.'
      },
      intermediate: {
        title: 'Voor gevorderden',
        icon: <LearningIcon />,
        description: 'Gedetailleerde informatie en best practices voor regelmatige gebruikers.'
      },
      advanced: {
        title: 'Voor experts',
        icon: <AdvancedIcon />,
        description: 'Geavanceerde technieken en optimalisaties voor ervaren gebruikers.'
      }
    };
    
    return content[currentExperienceLevel] || content.intermediate;
  }, [currentExperienceLevel]);
  
  // Huidige view content
  const currentViewContent = useMemo(() => {
    return roleSpecificContent[activeView] || roleSpecificContent.dashboard;
  }, [roleSpecificContent, activeView]);
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {currentViewContent.title}
        </Typography>
        
        <Chip
          icon={experienceLevelContent.icon}
          label={experienceLevelContent.title}
          color="primary"
          variant="outlined"
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="help tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Tips" icon={<TipIcon />} iconPosition="start" />
        {showSettings && <Tab label="Instellingen" icon={<SettingsIcon />} iconPosition="start" />}
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <Typography variant="body1" paragraph>
            {currentViewContent.description}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Tips voor {experienceLevelContent.title.toLowerCase()}:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            {currentViewContent.tips.map((tip, index) => (
              <Typography component="li" variant="body1" key={index} sx={{ mb: 1 }}>
                {tip}
              </Typography>
            ))}
          </Box>
          
          {showAdvancedTips && currentViewContent.advancedTips && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Geavanceerde tips:
              </Typography>
              
              <Box component="ul" sx={{ pl: 2 }}>
                {currentViewContent.advancedTips.map((tip, index) => (
                  <Typography component="li" variant="body1" key={index} sx={{ mb: 1 }}>
                    {tip}
                  </Typography>
                ))}
              </Box>
            </>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.open('/help/documentation', '_blank')}
            >
              Bekijk volledige documentatie
            </Button>
          </Box>
        </Box>
      )}
      
      {activeTab === 1 && showSettings && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Personaliseer je help ervaring
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-select-label">Rol</InputLabel>
              <Select
                labelId="role-select-label"
                value={currentRole}
                onChange={handleRoleChange}
                label="Rol"
              >
                <MenuItem value="general">Algemeen</MenuItem>
                <MenuItem value="marketeer">Marketeer</MenuItem>
                <MenuItem value="product_manager">Product Manager</MenuItem>
                <MenuItem value="analyst">Analist</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="experience-select-label">Ervaringsniveau</InputLabel>
              <Select
                labelId="experience-select-label"
                value={currentExperienceLevel}
                onChange={handleExperienceLevelChange}
                label="Ervaringsniveau"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Gevorderd</MenuItem>
                <MenuItem value="advanced">Expert</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showAdvancedTips}
                  onChange={handleAdvancedTipsChange}
                  color="primary"
                />
              }
              label="Toon geavanceerde tips"
            />
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // Sla voorkeuren op in localStorage
                localStorage.setItem('helpPreferences', JSON.stringify({
                  role: currentRole,
                  experienceLevel: currentExperienceLevel,
                  showAdvancedTips
                }));
                
                // Toon eerste tab
                setActiveTab(0);
              }}
            >
              Voorkeuren opslaan
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

PersonalizedHelp.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de rol verandert
   */
  onRoleChange: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het ervaringsniveau verandert
   */
  onExperienceLevelChange: PropTypes.func,
  
  /**
   * Of de instellingen tab moet worden getoond
   */
  showSettings: PropTypes.bool
};

export default PersonalizedHelp;
