import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Menu,
  MenuItem,
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
  IconButton
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Code as HtmlIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import * as exportUtils from '../../utils/export/exportUtils';

/**
 * ExportButton component voor het exporteren van data naar PDF, Excel of HTML
 * @param {Object} props - Component props
 */
const ExportButton = ({
  data,
  projectName,
  contentType = 'data',
  title = 'Exporteer',
  pdfTitle = 'MarketPulse AI Rapport',
  disabled = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  chartRef = null,
  onExport = null,
  customSections = [],
  includeRawData = true
}) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State voor menu en dialoog
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportType, setExportType] = useState('');
  
  // State voor export opties
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeRawData: includeRawData,
    includeSummary: true,
    orientation: 'portrait',
    theme: 'light',
    sections: customSections.reduce((acc, section) => {
      acc[section.id] = true;
      return acc;
    }, {})
  });
  
  // State voor export status
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);
  
  // Open menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Sluit menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Open export dialoog
  const handleExportTypeSelect = (type) => {
    setExportType(type);
    setDialogOpen(true);
    handleClose();
  };
  
  // Sluit export dialoog
  const handleDialogClose = () => {
    setDialogOpen(false);
    setExportError(null);
  };
  
  // Update export opties
  const handleOptionChange = (event) => {
    const { name, checked, value } = event.target;
    
    setExportOptions(prev => {
      if (name === 'orientation' || name === 'theme') {
        return { ...prev, [name]: value };
      }
      
      if (name.startsWith('section-')) {
        const sectionId = name.replace('section-', '');
        return { 
          ...prev, 
          sections: { 
            ...prev.sections, 
            [sectionId]: checked 
          } 
        };
      }
      
      return { ...prev, [name]: checked };
    });
  };
  
  // Genereer chart afbeelding
  const getChartImage = () => {
    if (!chartRef || !chartRef.current) {
      return null;
    }
    
    try {
      // Gebruik html2canvas of een andere library om een afbeelding van de chart te maken
      // Voor nu gebruiken we een dummy implementatie
      return chartRef.current.toDataURL('image/png');
    } catch (error) {
      console.error('Fout bij genereren chart afbeelding:', error);
      return null;
    }
  };
  
  // Exporteer naar PDF
  const exportToPdf = async () => {
    try {
      setExporting(true);
      setExportProgress(10);
      setExportError(null);
      
      // Maak PDF document
      const doc = exportUtils.createPdfDocument({
        orientation: exportOptions.orientation
      });
      
      // Voeg header toe
      exportUtils.addPdfHeader(doc, pdfTitle, projectName);
      setExportProgress(20);
      
      // Voeg secties toe
      let yPosition = 50;
      
      // Voeg aangepaste secties toe indien geselecteerd
      if (customSections.length > 0) {
        for (const section of customSections) {
          if (exportOptions.sections[section.id]) {
            setExportProgress(prev => prev + 5);
            
            if (section.type === 'text' && section.content) {
              yPosition = exportUtils.addPdfSection(doc, section.title, section.content, yPosition);
            } else if (section.type === 'table' && section.data && section.data.length > 0) {
              yPosition = exportUtils.addPdfTable(
                doc, 
                section.headers || Object.keys(section.data[0]), 
                section.data.map(item => Object.values(item)), 
                yPosition,
                { title: section.title }
              );
            } else if (section.type === 'chart' && exportOptions.includeCharts) {
              const chartImage = section.chartRef ? 
                getChartImage(section.chartRef) : 
                (chartRef ? getChartImage() : null);
                
              if (chartImage) {
                yPosition = exportUtils.addPdfChart(
                  doc, 
                  chartImage, 
                  section.title, 
                  yPosition
                );
              }
            }
          }
        }
      }
      
      setExportProgress(70);
      
      // Voeg ruwe data toe indien gewenst
      if (exportOptions.includeRawData && data && data.length > 0) {
        // Bereid data voor
        const headers = Object.keys(data[0]);
        const rows = data.map(item => Object.values(item));
        
        // Voeg tabel toe
        yPosition = exportUtils.addPdfTable(
          doc, 
          headers, 
          rows, 
          yPosition,
          { title: 'Ruwe Data' }
        );
      }
      
      setExportProgress(90);
      
      // Genereer bestandsnaam
      const filename = exportUtils.generateFilename(projectName, 'pdf', contentType);
      
      // Sla PDF op
      doc.save(filename);
      
      setExportProgress(100);
      enqueueSnackbar('PDF export succesvol', { variant: 'success' });
      
      // Trigger onExport callback indien nodig
      if (onExport) {
        onExport({ type: 'pdf', filename });
      }
    } catch (error) {
      console.error('Fout bij PDF export:', error);
      setExportError(`Fout bij PDF export: ${error.message}`);
      enqueueSnackbar('Fout bij PDF export', { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };
  
  // Exporteer naar Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);
      setExportProgress(10);
      setExportError(null);
      
      // Maak Excel werkboek
      const workbook = exportUtils.createExcelWorkbook();
      setExportProgress(20);
      
      // Voeg aangepaste secties toe indien geselecteerd
      if (customSections.length > 0) {
        for (const section of customSections) {
          if (exportOptions.sections[section.id]) {
            setExportProgress(prev => prev + 5);
            
            if (section.type === 'table' && section.data && section.data.length > 0) {
              exportUtils.addExcelWorksheet(
                workbook, 
                section.data, 
                section.title || 'Data'
              );
            } else if (section.type === 'chart' && exportOptions.includeCharts) {
              // Voor charts, voeg de onderliggende data toe
              if (section.data && section.data.length > 0) {
                const formattedData = exportUtils.formatChartDataForExcel(section.data);
                exportUtils.addExcelWorksheet(
                  workbook, 
                  formattedData, 
                  `${section.title || 'Chart'} Data`
                );
              }
            }
          }
        }
      }
      
      setExportProgress(70);
      
      // Voeg ruwe data toe indien gewenst
      if (exportOptions.includeRawData && data && data.length > 0) {
        // Bereid data voor
        const formattedData = exportUtils.formatChartDataForExcel(data);
        
        // Voeg werkblad toe
        exportUtils.addExcelWorksheet(
          workbook, 
          formattedData, 
          'Ruwe Data'
        );
      }
      
      setExportProgress(90);
      
      // Genereer bestandsnaam
      const filename = exportUtils.generateFilename(projectName, 'excel', contentType);
      
      // Exporteer werkboek
      exportUtils.exportExcelWorkbook(workbook, filename);
      
      setExportProgress(100);
      enqueueSnackbar('Excel export succesvol', { variant: 'success' });
      
      // Trigger onExport callback indien nodig
      if (onExport) {
        onExport({ type: 'excel', filename });
      }
    } catch (error) {
      console.error('Fout bij Excel export:', error);
      setExportError(`Fout bij Excel export: ${error.message}`);
      enqueueSnackbar('Fout bij Excel export', { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };
  
  // Exporteer naar HTML
  const exportToHtml = async () => {
    try {
      setExporting(true);
      setExportProgress(10);
      setExportError(null);
      
      // Verzamel secties voor HTML rapport
      const htmlSections = [];
      
      // Voeg aangepaste secties toe indien geselecteerd
      if (customSections.length > 0) {
        for (const section of customSections) {
          if (exportOptions.sections[section.id]) {
            setExportProgress(prev => prev + 5);
            
            // Voeg sectie toe aan HTML rapport
            htmlSections.push({
              ...section,
              chartImageData: section.type === 'chart' && exportOptions.includeCharts ? 
                (section.chartRef ? getChartImage(section.chartRef) : (chartRef ? getChartImage() : null)) : 
                null
            });
          }
        }
      }
      
      setExportProgress(60);
      
      // Genereer HTML rapport
      const html = exportUtils.generateHtmlReport(
        pdfTitle,
        projectName,
        exportOptions.includeRawData ? data : [],
        htmlSections,
        {
          includeRawData: exportOptions.includeRawData,
          includeSummary: exportOptions.includeSummary,
          theme: exportOptions.theme,
          chartImageData: exportOptions.includeCharts && chartRef ? getChartImage() : null
        }
      );
      
      setExportProgress(80);
      
      // Genereer bestandsnaam
      const filename = exportUtils.generateHtmlFilename(projectName, contentType);
      
      // Exporteer HTML
      exportUtils.exportHtmlReport(html, filename);
      
      setExportProgress(100);
      enqueueSnackbar('HTML export succesvol', { variant: 'success' });
      
      // Trigger onExport callback indien nodig
      if (onExport) {
        onExport({ type: 'html', filename });
      }
    } catch (error) {
      console.error('Fout bij HTML export:', error);
      setExportError(`Fout bij HTML export: ${error.message}`);
      enqueueSnackbar('Fout bij HTML export', { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };
  
  // Start export proces
  const handleExport = () => {
    if (exportType === 'pdf') {
      exportToPdf();
    } else if (exportType === 'excel') {
      exportToExcel();
    } else if (exportType === 'html') {
      exportToHtml();
    }
  };
  
  return (
    <>
      <Button
        variant={variant}
        color={color}
        size={size}
        disabled={disabled || !data || data.length === 0}
        onClick={handleClick}
        startIcon={<FileDownloadIcon />}
        fullWidth={fullWidth}
      >
        {title}
      </Button>
      
      {/* Export type menu */}
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExportTypeSelect('pdf')}>
          <PdfIcon fontSize="small" sx={{ mr: 1 }} />
          PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportTypeSelect('excel')}>
          <ExcelIcon fontSize="small" sx={{ mr: 1 }} />
          Excel
        </MenuItem>
        <MenuItem onClick={() => handleExportTypeSelect('html')}>
          <HtmlIcon fontSize="small" sx={{ mr: 1 }} />
          HTML
        </MenuItem>
      </Menu>
      
      {/* Export options dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {exportType === 'pdf' ? 'PDF Export Opties' : 
               exportType === 'excel' ? 'Excel Export Opties' : 
               'HTML Export Opties'}
            </Typography>
            <IconButton onClick={handleDialogClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}
          
          <Typography variant="subtitle2" gutterBottom>
            Algemene Opties
          </Typography>
          
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeCharts}
                  onChange={handleOptionChange}
                  name="includeCharts"
                  disabled={exporting}
                />
              }
              label="Grafieken opnemen"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeSummary}
                  onChange={handleOptionChange}
                  name="includeSummary"
                  disabled={exporting}
                />
              }
              label="Samenvatting opnemen"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeRawData}
                  onChange={handleOptionChange}
                  name="includeRawData"
                  disabled={exporting}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Ruwe data opnemen</span>
                  <Tooltip title="Kan de bestandsgrootte aanzienlijk vergroten bij grote datasets">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </FormControl>
          
          {/* Secties selectie indien beschikbaar */}
          {customSections.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Secties
              </Typography>
              
              <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                {customSections.map(section => (
                  <FormControlLabel
                    key={section.id}
                    control={
                      <Checkbox
                        checked={exportOptions.sections[section.id] || false}
                        onChange={handleOptionChange}
                        name={`section-${section.id}`}
                        disabled={exporting}
                      />
                    }
                    label={section.title}
                  />
                ))}
              </FormControl>
            </>
          )}
          
          {/* PDF-specifieke opties */}
          {exportType === 'pdf' && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                PDF Opties
              </Typography>
              
              <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
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
              </FormControl>
            </>
          )}
          
          {/* HTML-specifieke opties */}
          {exportType === 'html' && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                HTML Opties
              </Typography>
              
              <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thema
                </Typography>
                <RadioGroup
                  name="theme"
                  value={exportOptions.theme}
                  onChange={handleOptionChange}
                  row
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio disabled={exporting} />}
                    label="Licht"
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio disabled={exporting} />}
                    label="Donker"
                  />
                </RadioGroup>
              </FormControl>
            </>
          )}
          
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
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={exporting}>
            Annuleren
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            disabled={exporting}
            startIcon={
              exportType === 'pdf' ? <PdfIcon /> : 
              exportType === 'excel' ? <ExcelIcon /> : 
              <HtmlIcon />
            }
          >
            {exporting ? 'Bezig met exporteren...' : 'Exporteren'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ExportButton.propTypes = {
  data: PropTypes.array.isRequired,
  projectName: PropTypes.string,
  contentType: PropTypes.string,
  title: PropTypes.string,
  pdfTitle: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  chartRef: PropTypes.object,
  onExport: PropTypes.func,
  customSections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'table', 'chart']).isRequired,
      content: PropTypes.string,
      data: PropTypes.array,
      headers: PropTypes.array,
      chartRef: PropTypes.object
    })
  ),
  includeRawData: PropTypes.bool
};

export default ExportButton;
