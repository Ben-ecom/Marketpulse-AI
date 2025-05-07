import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper
} from '@mui/material';
import {
  Share as ShareIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Settings as SettingsIcon,
  Check as CheckIcon
} from '@mui/icons-material';

/**
 * ShareInsights Component
 * 
 * Component voor het delen van inzichten via verschillende kanalen zoals e-mail, link en sociale media.
 * Biedt opties voor het aanpassen van de gedeelde content en ondersteunt verschillende deelmethoden.
 * 
 * @component
 * @example
 * ```jsx
 * <ShareInsights
 *   data={insightsData}
 *   title="Topic Awareness Inzichten"
 *   projectName="MarketPulse AI"
 * />
 * ```
 */
const ShareInsights = ({
  data,
  title = 'Inzichten',
  projectName = 'MarketPulse AI',
  disabled = false,
  onShareStart = () => {},
  onShareComplete = () => {},
  onShareError = () => {}
}) => {
  // State voor dialoog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // State voor share opties
  const [shareOptions, setShareOptions] = useState({
    includeTitle: true,
    includeTimestamp: true,
    includeProjectInfo: true,
    includeDataSummary: true
  });
  
  // State voor email delen
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: `${title} - ${projectName}`,
    message: '',
    loading: false,
    success: false,
    error: null
  });
  
  // State voor link delen
  const [linkData, setLinkData] = useState({
    link: '',
    copied: false,
    loading: false,
    error: null
  });
  
  // State voor snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Open share dialoog
  const handleOpenDialog = () => {
    setDialogOpen(true);
    // Reset states
    setEmailData({
      ...emailData,
      loading: false,
      success: false,
      error: null
    });
    setLinkData({
      ...linkData,
      copied: false,
      loading: false,
      error: null
    });
  };
  
  // Sluit share dialoog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Verander actieve tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Update share opties
  const handleOptionChange = (event) => {
    const { name, checked } = event.target;
    setShareOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Update email data
  const handleEmailChange = (event) => {
    const { name, value } = event.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Genereer content voor delen
  const generateShareContent = () => {
    let content = '';
    
    if (shareOptions.includeTitle) {
      content += `# ${title}\n\n`;
    }
    
    if (shareOptions.includeProjectInfo) {
      content += `Project: ${projectName}\n\n`;
    }
    
    if (shareOptions.includeTimestamp) {
      content += `Gegenereerd op: ${new Date().toLocaleString()}\n\n`;
    }
    
    if (shareOptions.includeDataSummary && data) {
      content += '## Samenvatting\n\n';
      
      // Topics per fase
      if (data.topicsByPhase) {
        content += '### Topics per Fase\n\n';
        Object.entries(data.topicsByPhase).forEach(([phase, topics]) => {
          content += `**${phase}**: ${topics.join(', ')}\n`;
        });
        content += '\n';
      }
      
      // Awareness distributie
      if (data.awarenessDistribution) {
        content += '### Awareness Distributie\n\n';
        data.awarenessDistribution.forEach(item => {
          content += `- ${item.phase}: ${item.percentage}%\n`;
        });
        content += '\n';
      }
      
      // Trending topics
      if (data.trendingTopics) {
        content += '### Trending Topics\n\n';
        data.trendingTopics.slice(0, 5).forEach(item => {
          content += `- ${item.topic} (Volume: ${item.volume}, Sentiment: ${(item.sentiment * 100).toFixed(0)}%)\n`;
        });
        content += '\n';
      }
    }
    
    return content;
  };
  
  // Deel via email
  const handleShareEmail = async () => {
    setEmailData(prev => ({ ...prev, loading: true, error: null }));
    onShareStart();
    
    try {
      // Genereer content
      const content = generateShareContent();
      
      // In een echte implementatie zou hier een API call zijn om de email te versturen
      // Voor nu simuleren we een succesvolle verzending na een korte vertraging
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuleer succesvolle verzending
      setEmailData(prev => ({ 
        ...prev, 
        loading: false, 
        success: true,
        message: content
      }));
      
      setSnackbar({
        open: true,
        message: 'Inzichten succesvol gedeeld via e-mail',
        severity: 'success'
      });
      
      onShareComplete({
        method: 'email',
        recipient: emailData.recipient,
        subject: emailData.subject
      });
    } catch (error) {
      console.error('Fout bij delen via e-mail:', error);
      
      setEmailData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Er is een fout opgetreden bij het delen via e-mail'
      }));
      
      setSnackbar({
        open: true,
        message: 'Fout bij delen via e-mail',
        severity: 'error'
      });
      
      onShareError(error);
    }
  };
  
  // Genereer deelbare link
  const handleGenerateLink = async () => {
    setLinkData(prev => ({ ...prev, loading: true, error: null }));
    onShareStart();
    
    try {
      // Genereer content
      const content = generateShareContent();
      
      // In een echte implementatie zou hier een API call zijn om een deelbare link te genereren
      // Voor nu simuleren we een succesvolle generatie na een korte vertraging
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuleer een gegenereerde link
      const shareId = Math.random().toString(36).substring(2, 10);
      const link = `https://marketpulse.ai/share/${shareId}`;
      
      setLinkData(prev => ({ 
        ...prev, 
        loading: false, 
        link
      }));
      
      onShareComplete({
        method: 'link',
        link
      });
    } catch (error) {
      console.error('Fout bij genereren link:', error);
      
      setLinkData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Er is een fout opgetreden bij het genereren van de link'
      }));
      
      setSnackbar({
        open: true,
        message: 'Fout bij genereren van deelbare link',
        severity: 'error'
      });
      
      onShareError(error);
    }
  };
  
  // Kopieer link naar klembord
  const handleCopyLink = () => {
    if (!linkData.link) return;
    
    navigator.clipboard.writeText(linkData.link)
      .then(() => {
        setLinkData(prev => ({ ...prev, copied: true }));
        
        setSnackbar({
          open: true,
          message: 'Link gekopieerd naar klembord',
          severity: 'success'
        });
        
        // Reset copied status na 3 seconden
        setTimeout(() => {
          setLinkData(prev => ({ ...prev, copied: false }));
        }, 3000);
      })
      .catch(error => {
        console.error('Fout bij kopiëren naar klembord:', error);
        
        setSnackbar({
          open: true,
          message: 'Fout bij kopiëren naar klembord',
          severity: 'error'
        });
      });
  };
  
  // Deel via sociale media
  const handleShareSocial = (platform) => {
    // Genereer content
    const content = generateShareContent();
    
    // Genereer een dummy link
    const shareId = Math.random().toString(36).substring(2, 10);
    const link = `https://marketpulse.ai/share/${shareId}`;
    
    // Genereer URL voor delen op sociale media
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${projectName}`)}&url=${encodeURIComponent(link)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${projectName}: ${link}`)}`;
        break;
      default:
        return;
    }
    
    // Open deelvenster in nieuw tabblad
    window.open(shareUrl, '_blank');
    
    setSnackbar({
      open: true,
      message: `Deelvenster voor ${platform} geopend`,
      severity: 'info'
    });
    
    onShareComplete({
      method: 'social',
      platform,
      link
    });
  };
  
  // Sluit snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={handleOpenDialog}
        disabled={disabled}
        size="small"
      >
        Delen
      </Button>
      
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Inzichten Delen
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small" aria-label="Sluiten">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Deel methoden"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<EmailIcon />} 
            label="E-mail" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<LinkIcon />} 
            label="Link" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab 
            icon={<ShareIcon />} 
            label="Sociale Media" 
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Deel Opties
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareOptions.includeTitle}
                      onChange={handleOptionChange}
                      name="includeTitle"
                    />
                  }
                  label="Titel toevoegen"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareOptions.includeProjectInfo}
                      onChange={handleOptionChange}
                      name="includeProjectInfo"
                    />
                  }
                  label="Project informatie toevoegen"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareOptions.includeTimestamp}
                      onChange={handleOptionChange}
                      name="includeTimestamp"
                    />
                  }
                  label="Datum en tijd toevoegen"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareOptions.includeDataSummary}
                      onChange={handleOptionChange}
                      name="includeDataSummary"
                    />
                  }
                  label="Datasamenvatting toevoegen"
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {/* E-mail tab */}
              <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Delen via E-mail
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Ontvanger"
                      name="recipient"
                      value={emailData.recipient}
                      onChange={handleEmailChange}
                      margin="normal"
                      variant="outlined"
                      placeholder="email@voorbeeld.com"
                      disabled={emailData.loading || emailData.success}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Onderwerp"
                      name="subject"
                      value={emailData.subject}
                      onChange={handleEmailChange}
                      margin="normal"
                      variant="outlined"
                      disabled={emailData.loading || emailData.success}
                    />
                    
                    <TextField
                      fullWidth
                      label="Bericht"
                      name="message"
                      value={emailData.message}
                      onChange={handleEmailChange}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={4}
                      placeholder="Voeg een persoonlijk bericht toe..."
                      disabled={emailData.loading || emailData.success}
                    />
                    
                    {emailData.error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {emailData.error}
                      </Alert>
                    )}
                    
                    {emailData.success && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Inzichten succesvol gedeeld via e-mail naar {emailData.recipient}
                      </Alert>
                    )}
                    
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleShareEmail}
                        disabled={!emailData.recipient || emailData.loading || emailData.success}
                        startIcon={emailData.loading ? <CircularProgress size={20} /> : <EmailIcon />}
                      >
                        {emailData.loading ? 'Versturen...' : emailData.success ? 'Verstuurd' : 'Versturen'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Link tab */}
              <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Delen via Link
                    </Typography>
                    
                    <Box mt={2} mb={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateLink}
                        disabled={linkData.loading || linkData.link}
                        startIcon={linkData.loading ? <CircularProgress size={20} /> : <LinkIcon />}
                        fullWidth
                      >
                        {linkData.loading ? 'Genereren...' : linkData.link ? 'Link gegenereerd' : 'Genereer deelbare link'}
                      </Button>
                    </Box>
                    
                    {linkData.link && (
                      <TextField
                        fullWidth
                        label="Deelbare link"
                        value={linkData.link}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleCopyLink}
                                edge="end"
                                aria-label="Kopieer link naar klembord"
                              >
                                {linkData.copied ? <CheckIcon color="success" /> : <CopyIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                    
                    {linkData.error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {linkData.error}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
              
              {/* Sociale media tab */}
              <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Delen via Sociale Media
                    </Typography>
                    
                    <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        startIcon={<TwitterIcon />}
                        onClick={() => handleShareSocial('twitter')}
                        sx={{ minWidth: 140 }}
                      >
                        Twitter
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<LinkedInIcon />}
                        onClick={() => handleShareSocial('linkedin')}
                        sx={{ minWidth: 140 }}
                      >
                        LinkedIn
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<FacebookIcon />}
                        onClick={() => handleShareSocial('facebook')}
                        sx={{ minWidth: 140 }}
                      >
                        Facebook
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<WhatsAppIcon />}
                        onClick={() => handleShareSocial('whatsapp')}
                        sx={{ minWidth: 140 }}
                      >
                        WhatsApp
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mt: 3 }}>
                      Door te delen via sociale media wordt een deelbare link gegenereerd die toegang geeft tot deze inzichten.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

ShareInsights.propTypes = {
  /**
   * Data van de inzichten voor delen
   */
  data: PropTypes.object.isRequired,
  
  /**
   * Titel van de inzichten
   */
  title: PropTypes.string,
  
  /**
   * Naam van het project
   */
  projectName: PropTypes.string,
  
  /**
   * Of de deel knop uitgeschakeld moet worden
   */
  disabled: PropTypes.bool,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het delen start
   */
  onShareStart: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het delen is voltooid
   */
  onShareComplete: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer er een fout optreedt bij het delen
   */
  onShareError: PropTypes.func
};

export default ShareInsights;
