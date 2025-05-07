/**
 * ExportButton.jsx
 * 
 * Component voor het exporteren van dashboard data naar Excel of PDF.
 * Maakt gebruik van de exportUtils voor het genereren van de exports.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';

// Import export utilities
import {
  createPdfDocument,
  addPdfHeader,
  addPdfSection,
  addPdfTable,
  addPdfChart,
  createExcelWorkbook,
  addExcelWorksheet,
  exportExcelWorkbook,
  generateFilename,
  formatChartDataForExcel,
  generateDataSummary
} from '../../../utils/exportUtils';

/**
 * ExportButton Component
 * 
 * Biedt functionaliteit voor het exporteren van dashboard data naar Excel of PDF.
 * 
 * @component
 */
const ExportButton = ({ metrics, dateRange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportType, setExportType] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeRawData: true,
    includeSummary: true,
    pdfOrientation: 'portrait',
    sections: {
      summary: true,
      interactionsByType: true,
      interactionsByPage: true,
      feedbackByHelpItem: true,
      feedbackByUserRole: true,
      feedbackByExperienceLevel: true,
      interactionsTrend: true,
      userExperienceFeedback: true
    }
  });
  const [exporting, setExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Open het menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Sluit het menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open de export opties dialog
  const handleExportTypeSelect = (type) => {
    setExportType(type);
    handleClose();
  };

  // Sluit de export opties dialog
  const handleExportOptionsClose = () => {
    setExportType(null);
  };

  // Update de export opties
  const handleOptionChange = (event) => {
    const { name, checked } = event.target;
    setExportOptions((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  // Update de secties opties
  const handleSectionChange = (event) => {
    const { name, checked } = event.target;
    setExportOptions((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [name]: checked
      }
    }));
  };

  // Update de PDF oriëntatie
  const handlePdfOrientationChange = (event) => {
    setExportOptions((prev) => ({
      ...prev,
      pdfOrientation: event.target.value
    }));
  };

  // Genereer de export
  const handleExport = async () => {
    setExporting(true);

    try {
      // Genereer een bestandsnaam
      const filename = generateFilename('help_metrics', dateRange);

      if (exportType === 'pdf') {
        await exportToPdf(filename);
      } else if (exportType === 'excel') {
        await exportToExcel(filename);
      }

      // Toon succes melding
      setShowSuccess(true);
    } catch (error) {
      console.error('Fout bij exporteren:', error);
      setErrorMessage('Er is een fout opgetreden bij het exporteren. Probeer het later opnieuw.');
      setShowError(true);
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  // Exporteer naar PDF
  const exportToPdf = async (filename) => {
    // Maak een nieuw PDF document
    const doc = createPdfDocument({
      orientation: exportOptions.pdfOrientation,
      compress: true
    });

    // Voeg header toe
    addPdfHeader(doc, 'Help Metrics Dashboard', {
      subtitle: 'MarketPulse AI',
      date: new Date().toLocaleDateString('nl-NL'),
      dateRange: `${dateRange.start.toLocaleDateString('nl-NL')} - ${dateRange.end.toLocaleDateString('nl-NL')}`
    });

    // Voeg secties toe op basis van de geselecteerde opties
    if (exportOptions.sections.summary && metrics.summary) {
      addPdfSection(doc, 'KPI Samenvatting');
      
      // Voeg samenvattingstabel toe
      const summaryData = [
        ['Metriek', 'Waarde'],
        ['Totaal interacties', metrics.summary.totalInteractions.toString()],
        ['Feedback ratio', `${metrics.summary.feedbackSubmissionRate.toFixed(1)}%`],
        ['Positieve feedback', `${metrics.summary.positiveFeedbackRate.toFixed(1)}%`],
        ['Gebruikerstevredenheid', `${metrics.summary.averageUserSatisfaction.toFixed(1)}/5`]
      ];
      
      addPdfTable(doc, summaryData);
    }

    // Interacties per type
    if (exportOptions.sections.interactionsByType && metrics.interactionsByType) {
      addPdfSection(doc, 'Interacties per type');
      
      if (exportOptions.includeCharts) {
        // Hier zou je een chart toevoegen
        // Voor nu voegen we alleen een tabel toe
      }
      
      if (exportOptions.includeRawData) {
        const interactionsByTypeData = [
          ['Type', 'Aantal', 'Percentage']
        ];
        
        const total = Object.values(metrics.interactionsByType).reduce((sum, count) => sum + count, 0);
        
        Object.entries(metrics.interactionsByType).forEach(([type, count]) => {
          const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
          interactionsByTypeData.push([type, count.toString(), `${percentage}%`]);
        });
        
        addPdfTable(doc, interactionsByTypeData);
      }
    }

    // Interacties per pagina
    if (exportOptions.sections.interactionsByPage && metrics.interactionsByPage) {
      addPdfSection(doc, 'Interacties per pagina');
      
      if (exportOptions.includeRawData) {
        const interactionsByPageData = [
          ['Pagina', 'Aantal', 'Percentage']
        ];
        
        const total = Object.values(metrics.interactionsByPage).reduce((sum, count) => sum + count, 0);
        
        Object.entries(metrics.interactionsByPage).forEach(([page, count]) => {
          const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0.0';
          interactionsByPageData.push([page, count.toString(), `${percentage}%`]);
        });
        
        addPdfTable(doc, interactionsByPageData);
      }
    }

    // Feedback per help item
    if (exportOptions.sections.feedbackByHelpItem && metrics.feedbackByHelpItem) {
      addPdfSection(doc, 'Feedback per help item');
      
      if (exportOptions.includeRawData) {
        const feedbackByHelpItemData = [
          ['Help Item ID', 'Type', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
        ];
        
        metrics.feedbackByHelpItem.forEach(item => {
          feedbackByHelpItemData.push([
            item.id,
            item.type,
            item.positive.toString(),
            item.negative.toString(),
            item.total.toString(),
            `${item.positiveRatio.toFixed(1)}%`
          ]);
        });
        
        addPdfTable(doc, feedbackByHelpItemData);
      }
    }

    // Feedback per gebruikersrol
    if (exportOptions.sections.feedbackByUserRole && metrics.feedbackByUserRole) {
      addPdfSection(doc, 'Feedback per gebruikersrol');
      
      if (exportOptions.includeRawData) {
        const feedbackByUserRoleData = [
          ['Gebruikersrol', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
        ];
        
        metrics.feedbackByUserRole.forEach(item => {
          feedbackByUserRoleData.push([
            item.role,
            item.positive.toString(),
            item.negative.toString(),
            item.total.toString(),
            `${item.positiveRatio.toFixed(1)}%`
          ]);
        });
        
        addPdfTable(doc, feedbackByUserRoleData);
      }
    }

    // Feedback per ervaringsniveau
    if (exportOptions.sections.feedbackByExperienceLevel && metrics.feedbackByExperienceLevel) {
      addPdfSection(doc, 'Feedback per ervaringsniveau');
      
      if (exportOptions.includeRawData) {
        const feedbackByExperienceLevelData = [
          ['Ervaringsniveau', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
        ];
        
        metrics.feedbackByExperienceLevel.forEach(item => {
          feedbackByExperienceLevelData.push([
            item.level,
            item.positive.toString(),
            item.negative.toString(),
            item.total.toString(),
            `${item.positiveRatio.toFixed(1)}%`
          ]);
        });
        
        addPdfTable(doc, feedbackByExperienceLevelData);
      }
    }

    // Interacties trend
    if (exportOptions.sections.interactionsTrend && metrics.interactionsTrend) {
      addPdfSection(doc, 'Interacties trend');
      
      if (exportOptions.includeRawData) {
        const interactionsTrendData = [
          ['Datum', 'Aantal']
        ];
        
        metrics.interactionsTrend.forEach(item => {
          interactionsTrendData.push([
            new Date(item.date).toLocaleDateString('nl-NL'),
            item.count.toString()
          ]);
        });
        
        addPdfTable(doc, interactionsTrendData);
      }
    }

    // Gebruikerservaring feedback
    if (exportOptions.sections.userExperienceFeedback && metrics.userExperienceFeedback) {
      addPdfSection(doc, 'Gebruikerservaring feedback');
      
      if (exportOptions.includeRawData) {
        const userExperienceFeedbackData = [
          ['Datum', 'Pagina', 'Gebruikersrol', 'Ervaringsniveau', 'Rating', 'Opmerkingen']
        ];
        
        metrics.userExperienceFeedback.forEach(item => {
          userExperienceFeedbackData.push([
            new Date(item.created_at).toLocaleDateString('nl-NL'),
            item.page_context,
            item.user_role,
            item.experience_level,
            item.rating.toString(),
            item.comments || ''
          ]);
        });
        
        addPdfTable(doc, userExperienceFeedbackData);
      }
    }

    // Voeg samenvatting toe
    if (exportOptions.includeSummary) {
      addPdfSection(doc, 'Samenvatting');
      
      const summary = generateDataSummary(metrics);
      
      // Voeg samenvattingstekst toe
      doc.setFontSize(10);
      doc.text(summary, 14, doc.autoTable.previous.finalY + 10);
    }

    // Sla het document op
    doc.save(`${filename}.pdf`);
  };

  // Exporteer naar Excel
  const exportToExcel = async (filename) => {
    // Maak een nieuw Excel workbook
    const workbook = createExcelWorkbook();

    // Voeg worksheets toe op basis van de geselecteerde opties
    if (exportOptions.sections.summary && metrics.summary) {
      const summaryData = [
        ['Metriek', 'Waarde'],
        ['Totaal interacties', metrics.summary.totalInteractions],
        ['Feedback ratio', metrics.summary.feedbackSubmissionRate],
        ['Positieve feedback', metrics.summary.positiveFeedbackRate],
        ['Gebruikerstevredenheid', metrics.summary.averageUserSatisfaction]
      ];
      
      addExcelWorksheet(workbook, 'KPI Samenvatting', summaryData);
    }

    // Interacties per type
    if (exportOptions.sections.interactionsByType && metrics.interactionsByType) {
      const interactionsByTypeData = [
        ['Type', 'Aantal', 'Percentage']
      ];
      
      const total = Object.values(metrics.interactionsByType).reduce((sum, count) => sum + count, 0);
      
      Object.entries(metrics.interactionsByType).forEach(([type, count]) => {
        const percentage = total > 0 ? count / total * 100 : 0;
        interactionsByTypeData.push([type, count, percentage]);
      });
      
      addExcelWorksheet(workbook, 'Interacties per type', interactionsByTypeData);
    }

    // Interacties per pagina
    if (exportOptions.sections.interactionsByPage && metrics.interactionsByPage) {
      const interactionsByPageData = [
        ['Pagina', 'Aantal', 'Percentage']
      ];
      
      const total = Object.values(metrics.interactionsByPage).reduce((sum, count) => sum + count, 0);
      
      Object.entries(metrics.interactionsByPage).forEach(([page, count]) => {
        const percentage = total > 0 ? count / total * 100 : 0;
        interactionsByPageData.push([page, count, percentage]);
      });
      
      addExcelWorksheet(workbook, 'Interacties per pagina', interactionsByPageData);
    }

    // Feedback per help item
    if (exportOptions.sections.feedbackByHelpItem && metrics.feedbackByHelpItem) {
      const feedbackByHelpItemData = [
        ['Help Item ID', 'Type', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
      ];
      
      metrics.feedbackByHelpItem.forEach(item => {
        feedbackByHelpItemData.push([
          item.id,
          item.type,
          item.positive,
          item.negative,
          item.total,
          item.positiveRatio
        ]);
      });
      
      addExcelWorksheet(workbook, 'Feedback per help item', feedbackByHelpItemData);
    }

    // Feedback per gebruikersrol
    if (exportOptions.sections.feedbackByUserRole && metrics.feedbackByUserRole) {
      const feedbackByUserRoleData = [
        ['Gebruikersrol', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
      ];
      
      metrics.feedbackByUserRole.forEach(item => {
        feedbackByUserRoleData.push([
          item.role,
          item.positive,
          item.negative,
          item.total,
          item.positiveRatio
        ]);
      });
      
      addExcelWorksheet(workbook, 'Feedback per gebruikersrol', feedbackByUserRoleData);
    }

    // Feedback per ervaringsniveau
    if (exportOptions.sections.feedbackByExperienceLevel && metrics.feedbackByExperienceLevel) {
      const feedbackByExperienceLevelData = [
        ['Ervaringsniveau', 'Positief', 'Negatief', 'Totaal', 'Positieve Ratio']
      ];
      
      metrics.feedbackByExperienceLevel.forEach(item => {
        feedbackByExperienceLevelData.push([
          item.level,
          item.positive,
          item.negative,
          item.total,
          item.positiveRatio
        ]);
      });
      
      addExcelWorksheet(workbook, 'Feedback per ervaringsniveau', feedbackByExperienceLevelData);
    }

    // Interacties trend
    if (exportOptions.sections.interactionsTrend && metrics.interactionsTrend) {
      const interactionsTrendData = [
        ['Datum', 'Aantal']
      ];
      
      metrics.interactionsTrend.forEach(item => {
        interactionsTrendData.push([
          new Date(item.date),
          item.count
        ]);
      });
      
      addExcelWorksheet(workbook, 'Interacties trend', interactionsTrendData);
    }

    // Gebruikerservaring feedback
    if (exportOptions.sections.userExperienceFeedback && metrics.userExperienceFeedback) {
      const userExperienceFeedbackData = [
        ['Datum', 'Pagina', 'Gebruikersrol', 'Ervaringsniveau', 'Rating', 'Opmerkingen']
      ];
      
      metrics.userExperienceFeedback.forEach(item => {
        userExperienceFeedbackData.push([
          new Date(item.created_at),
          item.page_context,
          item.user_role,
          item.experience_level,
          item.rating,
          item.comments || ''
        ]);
      });
      
      addExcelWorksheet(workbook, 'Gebruikerservaring feedback', userExperienceFeedbackData);
    }

    // Sla het workbook op
    exportExcelWorkbook(workbook, `${filename}.xlsx`);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<FileDownloadIcon />}
        onClick={handleClick}
        disabled={!metrics.summary}
      >
        Exporteren
      </Button>

      {/* Export type menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExportTypeSelect('pdf')}>
          <PdfIcon sx={{ mr: 1 }} />
          Exporteer als PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportTypeSelect('excel')}>
          <ExcelIcon sx={{ mr: 1 }} />
          Exporteer als Excel
        </MenuItem>
      </Menu>

      {/* Export options dialog */}
      <Dialog
        open={Boolean(exportType)}
        onClose={handleExportOptionsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Exporteer als {exportType === 'pdf' ? 'PDF' : 'Excel'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Secties
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.summary}
                  onChange={handleSectionChange}
                  name="summary"
                />
              }
              label="KPI Samenvatting"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.interactionsByType}
                  onChange={handleSectionChange}
                  name="interactionsByType"
                />
              }
              label="Interacties per type"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.interactionsByPage}
                  onChange={handleSectionChange}
                  name="interactionsByPage"
                />
              }
              label="Interacties per pagina"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.feedbackByHelpItem}
                  onChange={handleSectionChange}
                  name="feedbackByHelpItem"
                />
              }
              label="Feedback per help item"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.feedbackByUserRole}
                  onChange={handleSectionChange}
                  name="feedbackByUserRole"
                />
              }
              label="Feedback per gebruikersrol"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.feedbackByExperienceLevel}
                  onChange={handleSectionChange}
                  name="feedbackByExperienceLevel"
                />
              }
              label="Feedback per ervaringsniveau"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.interactionsTrend}
                  onChange={handleSectionChange}
                  name="interactionsTrend"
                />
              }
              label="Interacties trend"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sections.userExperienceFeedback}
                  onChange={handleSectionChange}
                  name="userExperienceFeedback"
                />
              }
              label="Gebruikerservaring feedback"
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Opties
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            {exportType === 'pdf' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeCharts}
                    onChange={handleOptionChange}
                    name="includeCharts"
                  />
                }
                label="Grafieken toevoegen"
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeRawData}
                  onChange={handleOptionChange}
                  name="includeRawData"
                />
              }
              label="Ruwe data toevoegen"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeSummary}
                  onChange={handleOptionChange}
                  name="includeSummary"
                />
              }
              label="Samenvatting toevoegen"
            />
          </Box>

          {exportType === 'pdf' && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                PDF Oriëntatie
              </Typography>
              <Box sx={{ ml: 2 }}>
                <RadioGroup
                  value={exportOptions.pdfOrientation}
                  onChange={handlePdfOrientationChange}
                >
                  <FormControlLabel
                    value="portrait"
                    control={<Radio />}
                    label="Staand"
                  />
                  <FormControlLabel
                    value="landscape"
                    control={<Radio />}
                    label="Liggend"
                  />
                </RadioGroup>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportOptionsClose}>
            Annuleren
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            disabled={exporting}
            startIcon={exporting ? <CircularProgress size={20} /> : null}
          >
            {exporting ? 'Exporteren...' : 'Exporteren'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Export succesvol gegenereerd!
        </Alert>
      </Snackbar>

      {/* Error snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

ExportButton.propTypes = {
  /**
   * De metrics data om te exporteren
   */
  metrics: PropTypes.object.isRequired,
  
  /**
   * Het geselecteerde datumbereik
   */
  dateRange: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date)
  }).isRequired
};

export default ExportButton;
