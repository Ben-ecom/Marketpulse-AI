import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  FormControl, 
  FormControlLabel, 
  Checkbox, 
  RadioGroup, 
  Radio, 
  Grid, 
  Divider, 
  Alert, 
  Snackbar,
  CircularProgress,
  useTheme 
} from '@mui/material';
import { 
  FileDownload, 
  TableChart, 
  PictureAsPdf, 
  Code 
} from '@mui/icons-material';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

/**
 * FeedbackExport Component
 * 
 * Component voor het exporteren van feedback data in verschillende formaten.
 */
const FeedbackExport = ({ filters }) => {
  const theme = useTheme();
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeHelpFeedback: true,
    includeUserExperience: true,
    includeComments: true,
    includeMetadata: true
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Verander export formaat
  const handleFormatChange = (event) => {
    setExportFormat(event.target.value);
  };
  
  // Verander export opties
  const handleOptionChange = (event) => {
    setExportOptions({
      ...exportOptions,
      [event.target.name]: event.target.checked
    });
  };
  
  // Sluit snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Exporteer data
  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Simuleer export proces
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Toon succes bericht
      setSnackbar({
        open: true,
        message: `Feedback data succesvol geëxporteerd als ${exportFormat.toUpperCase()}`,
        severity: 'success'
      });
      
      // In een echte implementatie zou je hier de data exporteren
      // en een download starten
      
      // Voorbeeld van hoe je een CSV zou kunnen genereren en downloaden:
      if (exportFormat === 'csv') {
        // Genereer CSV data
        const csvData = generateCsvData();
        
        // Creëer een download link
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Error exporting feedback data:', error);
      
      // Toon foutmelding
      setSnackbar({
        open: true,
        message: 'Fout bij het exporteren van feedback data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Genereer CSV data (voorbeeld)
  const generateCsvData = () => {
    // Dit is een vereenvoudigd voorbeeld
    // In een echte implementatie zou je de echte data gebruiken
    
    const headers = ['ID', 'Type', 'Value', 'Comments', 'User Role', 'Experience Level', 'Created At'];
    const rows = [
      ['1', 'tooltip', 'true', 'Zeer nuttig', 'marketing_manager', 'intermediate', '2023-05-01T10:30:00'],
      ['2', 'overlay', 'false', 'Niet duidelijk genoeg', 'content_creator', 'beginner', '2023-05-02T14:15:00'],
      ['3', 'wizard', 'true', 'Goede uitleg', 'market_analyst', 'expert', '2023-05-03T09:45:00']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };
  
  // Bereken het aantal items dat geëxporteerd zal worden
  const calculateExportCount = () => {
    // Dit is een vereenvoudigd voorbeeld
    // In een echte implementatie zou je de echte data tellen
    
    let count = 0;
    
    if (exportOptions.includeHelpFeedback) {
      count += 125; // Voorbeeld aantal
    }
    
    if (exportOptions.includeUserExperience) {
      count += 78; // Voorbeeld aantal
    }
    
    return count;
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exporteer Feedback Data
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Exporteer feedback data in verschillende formaten voor verdere analyse of rapportage.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="subtitle1">
                Export Formaat
              </Typography>
              <ContextualTooltip
                content="Kies het formaat waarin je de feedback data wilt exporteren."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="export-format"
                name="export-format"
                value={exportFormat}
                onChange={handleFormatChange}
              >
                <FormControlLabel 
                  value="csv" 
                  control={<Radio />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <TableChart sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="body2">CSV (Excel)</Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="json" 
                  control={<Radio />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <Code sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="body2">JSON</Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="pdf" 
                  control={<Radio />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <PictureAsPdf sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="body2">PDF Rapport</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="subtitle1">
                Export Opties
              </Typography>
              <ContextualTooltip
                content="Selecteer welke data je wilt opnemen in de export."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeHelpFeedback}
                    onChange={handleOptionChange}
                    name="includeHelpFeedback"
                  />
                }
                label="Help Feedback"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeUserExperience}
                    onChange={handleOptionChange}
                    name="includeUserExperience"
                  />
                }
                label="Gebruikerservaring Feedback"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeComments}
                    onChange={handleOptionChange}
                    name="includeComments"
                  />
                }
                label="Inclusief Opmerkingen"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeMetadata}
                    onChange={handleOptionChange}
                    name="includeMetadata"
                  />
                }
                label="Inclusief Metadata (gebruikersrol, ervaringsniveau, datum)"
              />
            </FormControl>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="subtitle1">
                Export Samenvatting
              </Typography>
              <ContextualTooltip
                content="Samenvatting van de data die geëxporteerd zal worden."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Formaat:</strong> {exportFormat.toUpperCase()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Datum Bereik:</strong> {filters.dateRange === 'today' ? 'Vandaag' : 
                                              filters.dateRange === 'last7days' ? 'Laatste 7 dagen' : 
                                              filters.dateRange === 'last30days' ? 'Laatste 30 dagen' : 
                                              filters.dateRange === 'last90days' ? 'Laatste 90 dagen' : 
                                              filters.dateRange === 'lastYear' ? 'Laatste jaar' : 'Alle data'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Aantal Items:</strong> {calculateExportCount()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Inclusief:</strong>
                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  {exportOptions.includeHelpFeedback && (
                    <li>Help Feedback</li>
                  )}
                  {exportOptions.includeUserExperience && (
                    <li>Gebruikerservaring Feedback</li>
                  )}
                  {exportOptions.includeComments && (
                    <li>Opmerkingen</li>
                  )}
                  {exportOptions.includeMetadata && (
                    <li>Metadata (gebruikersrol, ervaringsniveau, datum)</li>
                  )}
                </Box>
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              De geëxporteerde data zal gefilterd worden volgens de huidige filter instellingen.
            </Alert>
            
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FileDownload />}
                onClick={handleExport}
                disabled={loading || (!exportOptions.includeHelpFeedback && !exportOptions.includeUserExperience)}
                size="large"
              >
                {loading ? 'Exporteren...' : 'Exporteer Data'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackExport;