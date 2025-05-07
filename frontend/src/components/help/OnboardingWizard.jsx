import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  DataUsage as DataUsageIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

/**
 * OnboardingWizard Component
 * 
 * Een component dat nieuwe gebruikers door de eerste stappen van het platform leidt.
 * 
 * @component
 * @example
 * ```jsx
 * <OnboardingWizard
 *   open={showOnboarding}
 *   onClose={() => setShowOnboarding(false)}
 *   onComplete={handleOnboardingComplete}
 * />
 * ```
 */
const OnboardingWizard = ({ open, onClose, onComplete, activeView = 'dashboard' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    industry: '',
    dataSource: 'all',
    interests: [],
    privacySettings: {
      shareData: false,
      anonymizeData: true,
      receiveUpdates: true
    }
  });
  
  // Effect om de wizard te resetten wanneer deze wordt geopend
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      
      // Sla de actieve view op om later te gebruiken voor gepersonaliseerde onboarding
      localStorage.setItem('onboardingStartView', activeView);
    }
  }, [open, activeView]);
  
  // Controleer of een stap kan worden overgeslagen
  const isStepSkippable = (step) => {
    return step === 1 || step === 3; // Bedrijfsinformatie en data bronnen zijn optioneel
  };
  
  // Controleer of een stap is overgeslagen
  const isStepSkipped = (step) => {
    return skipped.has(step);
  };
  
  // Handler voor het navigeren naar de volgende stap
  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };
  
  // Handler voor het navigeren naar de vorige stap
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handler voor het overslaan van een stap
  const handleSkip = () => {
    if (!isStepSkippable(activeStep)) {
      throw new Error("Je kunt deze stap niet overslaan.");
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };
  
  // Handler voor het voltooien van de wizard
  const handleComplete = () => {
    // Sla de onboarding status op in localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(formData));
    
    // Sla ook op welke view de gebruiker heeft gezien tijdens onboarding
    localStorage.setItem('onboardedViews', JSON.stringify([activeView]));
    
    // Roep de onComplete callback aan indien aanwezig
    if (onComplete) {
      onComplete(formData);
    }
    
    // Sluit de wizard
    if (onClose) {
      onClose();
    }
  };
  
  // Handler voor het wijzigen van formulier velden
  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    
    if (name.includes('.')) {
      // Voor geneste objecten (zoals privacySettings.shareData)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else if (name === 'interests') {
      // Voor multi-select velden
      const interestValue = value;
      setFormData({
        ...formData,
        interests: type === 'checkbox'
          ? checked
            ? [...formData.interests, interestValue]
            : formData.interests.filter(interest => interest !== interestValue)
          : value
      });
    } else {
      // Voor normale velden
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Stappen voor de wizard
  const steps = [
    {
      label: 'Welkom bij MarketPulse AI',
      description: 'Welkom bij MarketPulse AI, het platform voor e-commerce doelgroeponderzoek. Deze wizard helpt je bij het instellen van je account en voorkeuren.',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            MarketPulse AI verzamelt data van meerdere platforms (Reddit, Amazon, Instagram/TikTok, Trustpilot) om inzichten te genereren over doelgroepen, markttrends, concurrentie en aanbevelingen voor marketing en productverbetering.
          </Typography>
          <Typography variant="body1" paragraph>
            Laten we beginnen met het instellen van je persoonlijke voorkeuren.
          </Typography>
        </Box>
      )
    },
    {
      label: 'Persoonlijke informatie',
      description: 'Vul je persoonlijke informatie in om je ervaring te personaliseren.',
      content: (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Naam"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                helperText="Je naam wordt gebruikt om je ervaring te personaliseren"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bedrijf"
                name="company"
                value={formData.company}
                onChange={handleChange}
                helperText="Optioneel: je bedrijfsnaam voor rapportages"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Rol"
                >
                  <MenuItem value="marketeer">Marketeer</MenuItem>
                  <MenuItem value="product_manager">Product Manager</MenuItem>
                  <MenuItem value="ecommerce_manager">E-commerce Manager</MenuItem>
                  <MenuItem value="business_owner">Business Owner</MenuItem>
                  <MenuItem value="analyst">Analist</MenuItem>
                  <MenuItem value="other">Anders</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Bedrijfsinformatie',
      description: 'Vul informatie in over je bedrijf en industrie.',
      content: (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="industry-label">Industrie</InputLabel>
                <Select
                  labelId="industry-label"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  label="Industrie"
                >
                  <MenuItem value="fashion">Mode & Kleding</MenuItem>
                  <MenuItem value="electronics">Elektronica</MenuItem>
                  <MenuItem value="home">Huis & Tuin</MenuItem>
                  <MenuItem value="beauty">Beauty & Verzorging</MenuItem>
                  <MenuItem value="food">Voeding & Dranken</MenuItem>
                  <MenuItem value="health">Gezondheid & Wellness</MenuItem>
                  <MenuItem value="sports">Sport & Outdoor</MenuItem>
                  <MenuItem value="toys">Speelgoed & Games</MenuItem>
                  <MenuItem value="other">Anders</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel component="legend">Interesses</FormLabel>
                <Grid container spacing={1}>
                  {['Marktonderzoek', 'Concurrentieanalyse', 'Doelgroepanalyse', 'Content marketing', 'Product ontwikkeling', 'Prijsstrategie'].map((interest) => (
                    <Grid item xs={6} key={interest}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.interests.includes(interest)}
                            onChange={handleChange}
                            name="interests"
                            value={interest}
                          />
                        }
                        label={interest}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Data bronnen',
      description: 'Selecteer de data bronnen die je wilt gebruiken voor je analyses.',
      content: (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="data-source-label">Primaire data bron</InputLabel>
            <Select
              labelId="data-source-label"
              name="dataSource"
              value={formData.dataSource}
              onChange={handleChange}
              label="Primaire data bron"
            >
              <MenuItem value="all">Alle bronnen</MenuItem>
              <MenuItem value="reddit">Reddit</MenuItem>
              <MenuItem value="amazon">Amazon</MenuItem>
              <MenuItem value="instagram">Instagram/TikTok</MenuItem>
              <MenuItem value="trustpilot">Trustpilot</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Je kunt dit later altijd wijzigen in de data bron selector.
          </Typography>
        </Box>
      )
    },
    {
      label: 'Privacy instellingen',
      description: 'Configureer je privacy voorkeuren.',
      content: (
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Privacy voorkeuren</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.privacySettings.shareData}
                  onChange={handleChange}
                  name="privacySettings.shareData"
                />
              }
              label="Deel anonieme gebruiksgegevens om het platform te verbeteren"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.privacySettings.anonymizeData}
                  onChange={handleChange}
                  name="privacySettings.anonymizeData"
                />
              }
              label="Anonimiseer data in geëxporteerde rapporten"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.privacySettings.receiveUpdates}
                  onChange={handleChange}
                  name="privacySettings.receiveUpdates"
                />
              }
              label="Ontvang updates over nieuwe features en inzichten"
            />
          </FormControl>
        </Box>
      )
    },
    {
      label: 'Voltooid',
      description: 'Je bent klaar om te beginnen met MarketPulse AI!',
      content: (
        <Box sx={{ mt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: theme.palette.success.main }} />
            <Typography variant="h6" gutterBottom>
              Gefeliciteerd!
            </Typography>
            <Typography variant="body1" paragraph>
              Je hebt de onboarding wizard voltooid en je account is ingesteld. Je bent nu klaar om te beginnen met MarketPulse AI!
            </Typography>
            <Typography variant="body2">
              Klik op 'Voltooien' om naar het dashboard te gaan.
            </Typography>
          </Paper>
        </Box>
      )
    }
  ];
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="onboarding-wizard-title"
    >
      <DialogTitle id="onboarding-wizard-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          MarketPulse AI Onboarding
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation={isMobile ? "vertical" : "horizontal"}>
          {steps.map((step, index) => {
            const stepProps = {};
            const labelProps = {};
            
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            
            return (
              <Step key={step.label} {...stepProps}>
                <StepLabel {...labelProps}>{step.label}</StepLabel>
                {isMobile && (
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {step.description}
                    </Typography>
                    {step.content}
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                      <Button
                        color="inherit"
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Terug
                      </Button>
                      <Box sx={{ flex: '1 1 auto' }} />
                      {isStepSkippable(index) && (
                        <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                          Overslaan
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleComplete : handleNext}
                      >
                        {index === steps.length - 1 ? 'Voltooien' : 'Volgende'}
                      </Button>
                    </Box>
                  </StepContent>
                )}
              </Step>
            );
          })}
        </Stepper>
        
        {!isMobile && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {steps[activeStep].label}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {steps[activeStep].description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {steps[activeStep].content}
          </Box>
        )}
      </DialogContent>
      
      {!isMobile && (
        <>
          <Divider />
          <DialogActions>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Terug
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepSkippable(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Overslaan
              </Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleComplete : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Voltooien' : 'Volgende'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

OnboardingWizard.propTypes = {
  /**
   * Of de wizard open is
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback functie die wordt aangeroepen wanneer de wizard wordt gesloten
   */
  onClose: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer de wizard is voltooid
   */
  onComplete: PropTypes.func,
  
  /**
   * De actieve view (dashboard, report, sentiment, trends, awareness, market-insights)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights'])
};

export default OnboardingWizard;
