import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Component voor het weergeven van de status van API-aanroepen
 * @param {Object} props - Component properties
 * @param {Object} props.status - Status object met informatie over de API-aanroepen
 * @param {boolean} props.status.loading - Of er momenteel een API-aanroep bezig is
 * @param {boolean} props.status.keywordsGenerated - Of de keywords zijn gegenereerd
 * @param {string} props.status.keywordSource - Bron van de gegenereerde keywords (claude_api, claude_api_simplified, rule_based_fallback, etc.)
 * @param {number} props.status.keywordConfidence - Betrouwbaarheidsscore van de gegenereerde keywords (0-1)
 * @param {boolean} props.status.configGenerated - Of de configuratie is gegenereerd
 * @param {string} props.status.error - Eventuele foutmelding
 */
const ApiStatusIndicator = ({ status }) => {
  // Bepaal de actieve stap op basis van de status
  const getActiveStep = () => {
    if (!status.keywordsGenerated) return 0;
    if (!status.configGenerated) return 1;
    return 2;
  };
  
  // Bepaal de kleur van de betrouwbaarheidsscore
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success.main';
    if (confidence >= 0.5) return 'warning.main';
    return 'error.main';
  };
  
  // Bepaal het label voor de bron van de keywords
  const getSourceLabel = (source) => {
    switch (source) {
      case 'claude_api':
        return 'Claude AI (primair)';
      case 'claude_api_simplified':
        return 'Claude AI (vereenvoudigd)';
      case 'rule_based_fallback':
        return 'Regelgebaseerde fallback';
      case 'minimal_fallback':
        return 'Minimale fallback';
      default:
        return source || 'Onbekend';
    }
  };
  
  const activeStep = getActiveStep();
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Status
      </Typography>
      
      {status.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel
            optional={
              status.keywordsGenerated && status.keywordSource && (
                <Typography variant="caption">
                  Bron: {getSourceLabel(status.keywordSource)}
                  {status.keywordConfidence !== undefined && (
                    <Box component="span" sx={{ ml: 1 }}>
                      <Typography 
                        variant="caption" 
                        component="span"
                        sx={{ 
                          color: getConfidenceColor(status.keywordConfidence),
                          fontWeight: 'bold'
                        }}
                      >
                        (Betrouwbaarheid: {Math.round(status.keywordConfidence * 100)}%)
                      </Typography>
                    </Box>
                  )}
                </Typography>
              )
            }
          >
            Keywords genereren
          </StepLabel>
          <StepContent>
            {status.loading && !status.keywordsGenerated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Keywords worden gegenereerd met Claude AI...
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">
                Keywords worden gegenereerd op basis van je projectgegevens.
              </Typography>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            Configuratie genereren
          </StepLabel>
          <StepContent>
            {status.keywordsGenerated && status.loading && !status.configGenerated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Configuratie wordt gegenereerd...
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">
                Platformspecifieke configuraties worden gegenereerd op basis van de keywords.
              </Typography>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            Project aanmaken
          </StepLabel>
          <StepContent>
            {status.configGenerated && status.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Project wordt aangemaakt...
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">
                Project wordt aangemaakt met de gegenereerde configuratie.
              </Typography>
            )}
          </StepContent>
        </Step>
      </Stepper>
      
      {status.loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <InfoIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Dit kan enkele seconden duren. De Claude AI analyseert je projectgegevens om de meest relevante keywords te genereren.
          </Typography>
        </Box>
      )}
      
      {status.keywordsGenerated && status.keywordSource === 'rule_based_fallback' && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <InfoIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            De Claude AI was niet beschikbaar. Er zijn keywords gegenereerd met een regelgebaseerde fallback methode.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApiStatusIndicator;
