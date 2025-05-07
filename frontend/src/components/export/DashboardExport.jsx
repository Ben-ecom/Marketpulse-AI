import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import ExportButton from './ExportButton';

/**
 * DashboardExport Component
 * 
 * Component voor het exporteren van dashboards als afbeelding, PDF of Excel.
 * Biedt opties voor het aanpassen van de export en ondersteunt verschillende formaten.
 * 
 * @component
 * @example
 * ```jsx
 * <DashboardExport
 *   dashboardRef={dashboardRef}
 *   data={dashboardData}
 *   title="Topic Awareness Dashboard"
 *   projectName="MarketPulse AI"
 * />
 * ```
 */
const DashboardExport = ({
  dashboardRef,
  data,
  title = 'Dashboard',
  projectName = 'MarketPulse AI',
  disabled = false,
  onExportStart = () => {},
  onExportComplete = () => {},
  onExportError = () => {}
}) => {
  // State voor dialoog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportType, setExportType] = useState('image');
  
  // State voor export opties
  const [exportOptions, setExportOptions] = useState({
    includeTitle: true,
    includeTimestamp: true,
    includeFilters: true,
    quality: 'high',
    paperSize: 'a4',
    orientation: 'landscape'
  });
  
  // State voor export status
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);
  
  // Referentie naar preview container
  const previewRef = useRef(null);
  
  // Open export dialoog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  // Sluit export dialoog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setExportError(null);
  };
  
  // Update export opties
  const handleOptionChange = (event) => {
    const { name, checked, value } = event.target;
    
    setExportOptions(prev => {
      if (name === 'quality' || name === 'paperSize' || name === 'orientation') {
        return { ...prev, [name]: value };
      }
      
      return { ...prev, [name]: checked };
    });
  };
  
  // Verander export type
  const handleExportTypeChange = (event) => {
    setExportType(event.target.value);
  };
  
  // Genereer dashboard afbeelding
  const generateDashboardImage = async () => {
    if (!dashboardRef || !dashboardRef.current) {
      throw new Error('Dashboard referentie is niet beschikbaar');
    }
    
    try {
      const scale = exportOptions.quality === 'high' ? 2 : 1;
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      return canvas;
    } catch (error) {
      console.error('Fout bij genereren dashboard afbeelding:', error);
      throw error;
    }
  };
  
  // Exporteer als afbeelding
  const exportAsImage = async () => {
    try {
      setExportProgress(10);
      const canvas = await generateDashboardImage();
      setExportProgress(80);
      
      // Maak een afbeelding van de canvas
      const imageUrl = canvas.toDataURL('image/png');
      
      // Maak een download link
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = imageUrl;
      link.click();
      
      setExportProgress(100);
      return { success: true, message: 'Dashboard succesvol geëxporteerd als afbeelding' };
    } catch (error) {
      console.error('Fout bij exporteren als afbeelding:', error);
      throw error;
    }
  };
  
  // Exporteer als PDF
  const exportAsPdf = async () => {
    try {
      setExportProgress(10);
      const canvas = await generateDashboardImage();
      setExportProgress(50);
      
      // Bepaal PDF afmetingen op basis van papierformaat en oriëntatie
      const orientation = exportOptions.orientation;
      let width, height;
      
      if (exportOptions.paperSize === 'a4') {
        width = orientation === 'portrait' ? 210 : 297;
        height = orientation === 'portrait' ? 297 : 210;
      } else if (exportOptions.paperSize === 'letter') {
        width = orientation === 'portrait' ? 215.9 : 279.4;
        height = orientation === 'portrait' ? 279.4 : 215.9;
      } else {
        width = orientation === 'portrait' ? 210 : 297;
        height = orientation === 'portrait' ? 297 : 210;
      }
      
      // Maak PDF document
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: exportOptions.paperSize
      });
      
      // Voeg titel en timestamp toe indien geselecteerd
      if (exportOptions.includeTitle) {
        pdf.setFontSize(16);
        pdf.text(title, 14, 15);
        pdf.setFontSize(10);
        pdf.text(`Project: ${projectName}`, 14, 22);
      }
      
      if (exportOptions.includeTimestamp) {
        pdf.setFontSize(8);
        pdf.text(`Gegenereerd op: ${new Date().toLocaleString()}`, 14, height - 10);
      }
      
      setExportProgress(70);
      
      // Bereken afmetingen voor de afbeelding
      const imgWidth = width - 28; // Marge links en rechts
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos = exportOptions.includeTitle ? 30 : 14;
      
      // Voeg afbeelding toe aan PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 14, yPos, imgWidth, imgHeight);
      
      setExportProgress(90);
      
      // Download PDF
      pdf.save(`${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setExportProgress(100);
      return { success: true, message: 'Dashboard succesvol geëxporteerd als PDF' };
    } catch (error) {
      console.error('Fout bij exporteren als PDF:', error);
      throw error;
    }
  };
  
  // Exporteer als Excel
  const exportAsExcel = async () => {
    try {
      setExportProgress(20);
      
      // Controleer of er data is om te exporteren
      if (!data || data.length === 0) {
        throw new Error('Geen data beschikbaar voor Excel export');
      }
      
      // Maak een nieuw Excel werkboek
      const wb = XLSX.utils.book_new();
      
      // Voeg metadata toe
      wb.Props = {
        Title: title,
        Subject: `${projectName} - Dashboard Export`,
        Author: 'MarketPulse AI',
        CreatedDate: new Date()
      };
      
      setExportProgress(40);
      
      // Voeg worksheets toe voor verschillende datatypen
      if (data.topicsByPhase) {
        // Maak worksheet voor topics per fase
        const topicsData = [];
        
        // Header rij
        topicsData.push(['Fase', 'Topic']);
        
        // Data rijen
        Object.entries(data.topicsByPhase).forEach(([phase, topics]) => {
          topics.forEach(topic => {
            topicsData.push([phase, topic]);
          });
        });
        
        const topicsWs = XLSX.utils.aoa_to_sheet(topicsData);
        XLSX.utils.book_append_sheet(wb, topicsWs, 'Topics per Fase');
      }
      
      setExportProgress(60);
      
      if (data.awarenessDistribution) {
        // Maak worksheet voor awareness distributie
        const distributionData = [];
        
        // Header rij
        distributionData.push(['Fase', 'Percentage']);
        
        // Data rijen
        data.awarenessDistribution.forEach(item => {
          distributionData.push([item.phase, item.percentage]);
        });
        
        const distributionWs = XLSX.utils.aoa_to_sheet(distributionData);
        XLSX.utils.book_append_sheet(wb, distributionWs, 'Awareness Distributie');
      }
      
      setExportProgress(80);
      
      if (data.trendingTopics) {
        // Maak worksheet voor trending topics
        const trendingData = [];
        
        // Header rij
        trendingData.push(['Topic', 'Volume', 'Sentiment']);
        
        // Data rijen
        data.trendingTopics.forEach(item => {
          trendingData.push([item.topic, item.volume, item.sentiment]);
        });
        
        const trendingWs = XLSX.utils.aoa_to_sheet(trendingData);
        XLSX.utils.book_append_sheet(wb, trendingWs, 'Trending Topics');
      }
      
      setExportProgress(90);
      
      // Exporteer Excel bestand
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setExportProgress(100);
      return { success: true, message: 'Dashboard succesvol geëxporteerd als Excel' };
    } catch (error) {
      console.error('Fout bij exporteren als Excel:', error);
      throw error;
    }
  };
  
  // Start export proces
  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);
    setExportError(null);
    
    try {
      onExportStart();
      
      let result;
      
      switch (exportType) {
        case 'image':
          result = await exportAsImage();
          break;
        case 'pdf':
          result = await exportAsPdf();
          break;
        case 'excel':
          result = await exportAsExcel();
          break;
        default:
          throw new Error('Ongeldig export type');
      }
      
      onExportComplete(result);
      
      // Sluit dialoog na succesvolle export
      setTimeout(() => {
        setExporting(false);
        setDialogOpen(false);
      }, 1000);
    } catch (error) {
      setExportError(error.message || 'Er is een fout opgetreden bij het exporteren');
      setExporting(false);
      onExportError(error);
    }
  };
  
  // Render preview van dashboard
  const renderPreview = () => {
    return (
      <Box
        ref={previewRef}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          mb: 2,
          height: 200,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Preview niet beschikbaar. Het daadwerkelijke dashboard zal worden geëxporteerd.
        </Typography>
      </Box>
    );
  };
  
  // Als er al een ExportButton component bestaat, gebruik deze
  if (typeof ExportButton !== 'undefined') {
    // Converteer data naar formaat voor ExportButton
    const exportData = [];
    
    // Voeg topics per fase toe
    if (data.topicsByPhase) {
      Object.entries(data.topicsByPhase).forEach(([phase, topics]) => {
        topics.forEach(topic => {
          exportData.push({ phase, topic });
        });
      });
    }
    
    // Definieer aangepaste secties
    const customSections = [
      {
        id: 'dashboard',
        title: 'Dashboard Visualisatie',
        type: 'chart',
        chartRef: dashboardRef
      },
      {
        id: 'topics',
        title: 'Topics per Fase',
        type: 'table',
        data: exportData,
        headers: ['Fase', 'Topic']
      }
    ];
    
    // Voeg trending topics toe indien beschikbaar
    if (data.trendingTopics) {
      customSections.push({
        id: 'trending',
        title: 'Trending Topics',
        type: 'table',
        data: data.trendingTopics,
        headers: ['Topic', 'Volume', 'Sentiment']
      });
    }
    
    return (
      <ExportButton
        data={exportData}
        projectName={projectName}
        contentType="dashboard"
        title="Exporteer Dashboard"
        pdfTitle={`${title} - ${projectName}`}
        disabled={disabled}
        chartRef={dashboardRef}
        customSections={customSections}
      />
    );
  }
  
  // Fallback implementatie indien ExportButton niet beschikbaar is
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleOpenDialog}
        disabled={disabled}
        size="small"
      >
        Exporteer Dashboard
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
              Dashboard Exporteren
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small" aria-label="Sluiten">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Export Instellingen
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Export Formaat
                  </Typography>
                  <RadioGroup
                    name="exportType"
                    value={exportType}
                    onChange={handleExportTypeChange}
                  >
                    <FormControlLabel
                      value="image"
                      control={<Radio disabled={exporting} />}
                      label={
                        <Box display="flex" alignItems="center">
                          <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography>Afbeelding (PNG)</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="pdf"
                      control={<Radio disabled={exporting} />}
                      label={
                        <Box display="flex" alignItems="center">
                          <PdfIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography>PDF Document</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="excel"
                      control={<Radio disabled={exporting} />}
                      label={
                        <Box display="flex" alignItems="center">
                          <ExcelIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography>Excel Werkboek</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Inhoud Opties
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeTitle}
                      onChange={handleOptionChange}
                      name="includeTitle"
                      disabled={exporting}
                    />
                  }
                  label="Titel en projectnaam toevoegen"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeTimestamp}
                      onChange={handleOptionChange}
                      name="includeTimestamp"
                      disabled={exporting}
                    />
                  }
                  label="Datum en tijd toevoegen"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeFilters}
                      onChange={handleOptionChange}
                      name="includeFilters"
                      disabled={exporting}
                    />
                  }
                  label="Toegepaste filters toevoegen"
                />
              </Paper>
              
              {exportType === 'image' && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Afbeelding Kwaliteit
                  </Typography>
                  <RadioGroup
                    name="quality"
                    value={exportOptions.quality}
                    onChange={handleOptionChange}
                    row
                  >
                    <FormControlLabel
                      value="normal"
                      control={<Radio disabled={exporting} />}
                      label="Normaal"
                    />
                    <FormControlLabel
                      value="high"
                      control={<Radio disabled={exporting} />}
                      label="Hoog"
                    />
                  </RadioGroup>
                </Paper>
              )}
              
              {exportType === 'pdf' && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    PDF Opties
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Papierformaat
                    </Typography>
                    <RadioGroup
                      name="paperSize"
                      value={exportOptions.paperSize}
                      onChange={handleOptionChange}
                      row
                    >
                      <FormControlLabel
                        value="a4"
                        control={<Radio disabled={exporting} />}
                        label="A4"
                      />
                      <FormControlLabel
                        value="letter"
                        control={<Radio disabled={exporting} />}
                        label="Letter"
                      />
                    </RadioGroup>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Oriëntatie
                  </Typography>
                  <RadioGroup
                    name="orientation"
                    value={exportOptions.orientation}
                    onChange={handleOptionChange}
                    row
                  >
                    <FormControlLabel
                      value="portrait"
                      control={<Radio disabled={exporting} />}
                      label="Staand"
                    />
                    <FormControlLabel
                      value="landscape"
                      control={<Radio disabled={exporting} />}
                      label="Liggend"
                    />
                  </RadioGroup>
                </Paper>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Preview
              </Typography>
              
              {renderPreview()}
              
              {exporting && (
                <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                  <CircularProgress
                    variant="determinate"
                    value={exportProgress}
                    size={60}
                    thickness={4}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {exportProgress < 100
                      ? `Exporteren... ${exportProgress}%`
                      : 'Export voltooid!'}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={exporting}>
            Annuleren
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            disabled={exporting}
            startIcon={
              exportType === 'image' ? <ImageIcon /> : 
              exportType === 'pdf' ? <PdfIcon /> : 
              <ExcelIcon />
            }
          >
            {exporting ? 'Bezig met exporteren...' : 'Exporteren'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

DashboardExport.propTypes = {
  /**
   * Referentie naar het dashboard element dat geëxporteerd moet worden
   */
  dashboardRef: PropTypes.object.isRequired,
  
  /**
   * Data van het dashboard voor export naar Excel
   */
  data: PropTypes.object.isRequired,
  
  /**
   * Titel van het dashboard
   */
  title: PropTypes.string,
  
  /**
   * Naam van het project
   */
  projectName: PropTypes.string,
  
  /**
   * Of de export knop uitgeschakeld moet worden
   */
  disabled: PropTypes.bool,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het exporteren start
   */
  onExportStart: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het exporteren is voltooid
   */
  onExportComplete: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer er een fout optreedt bij het exporteren
   */
  onExportError: PropTypes.func
};

export default DashboardExport;
