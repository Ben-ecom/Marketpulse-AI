/**
 * exportUtils.js
 * 
 * Utilities voor het exporteren van data naar PDF en Excel.
 * Biedt functies voor het genereren van PDF en Excel exports.
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Maakt een nieuw PDF document
 * @param {Object} options - Opties voor het PDF document
 * @param {string} options.orientation - Oriëntatie van het document ('portrait' of 'landscape')
 * @param {string} options.unit - Eenheid voor afmetingen ('mm', 'cm', 'in', 'pt')
 * @param {string} options.format - Papierformaat ('a4', 'letter', etc.)
 * @param {boolean} options.compress - Of het document moet worden gecomprimeerd
 * @returns {jsPDF} - Het PDF document
 */
export const createPdfDocument = (options = {}) => {
  const {
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4',
    compress = true
  } = options;
  
  const doc = new jsPDF({
    orientation,
    unit,
    format,
    compress
  });
  
  return doc;
};

/**
 * Voegt een header toe aan een PDF document
 * @param {jsPDF} doc - Het PDF document
 * @param {string} title - De titel van het document
 * @param {Object} options - Opties voor de header
 * @param {string} options.subtitle - De subtitel van het document
 * @param {string} options.date - De datum van het document
 * @param {string} options.dateRange - Het datumbereik van het document
 */
export const addPdfHeader = (doc, title, options = {}) => {
  const {
    subtitle,
    date,
    dateRange
  } = options;
  
  // Voeg titel toe
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  
  // Voeg subtitel toe
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 28);
  }
  
  // Voeg datum toe
  if (date) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Datum: ${date}`, 14, 35);
  }
  
  // Voeg datumbereik toe
  if (dateRange) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${dateRange}`, 14, 40);
  }
  
  // Voeg scheidingslijn toe
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, doc.internal.pageSize.getWidth() - 14, 45);
  
  // Reset positie voor volgende content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
};

/**
 * Voegt een sectie toe aan een PDF document
 * @param {jsPDF} doc - Het PDF document
 * @param {string} title - De titel van de sectie
 */
export const addPdfSection = (doc, title) => {
  // Controleer of er al content is toegevoegd
  const y = doc.autoTable ? doc.autoTable.previous.finalY + 15 : 55;
  
  // Voeg sectie titel toe
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  
  // Reset font
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
};

/**
 * Voegt een tabel toe aan een PDF document
 * @param {jsPDF} doc - Het PDF document
 * @param {Array<Array<string>>} data - De data voor de tabel
 * @param {Object} options - Opties voor de tabel
 * @param {Array<string>} options.columns - De kolomnamen
 * @param {Object} options.styles - Stijlen voor de tabel
 * @param {Object} options.headStyles - Stijlen voor de tabelkop
 */
export const addPdfTable = (doc, data, options = {}) => {
  const {
    columns,
    styles,
    headStyles
  } = options;
  
  // Bepaal de startpositie
  const startY = doc.autoTable ? doc.autoTable.previous.finalY + 10 : 60;
  
  // Voeg tabel toe
  doc.autoTable({
    startY,
    head: data ? [data[0]] : undefined,
    body: data ? data.slice(1) : [],
    columns,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      ...styles
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      ...headStyles
    },
    margin: { top: 10, right: 14, bottom: 10, left: 14 }
  });
};

/**
 * Voegt een grafiek toe aan een PDF document
 * @param {jsPDF} doc - Het PDF document
 * @param {string} chartUrl - De URL van de grafiek (data URL)
 * @param {Object} options - Opties voor de grafiek
 * @param {number} options.width - De breedte van de grafiek
 * @param {number} options.height - De hoogte van de grafiek
 */
export const addPdfChart = (doc, chartUrl, options = {}) => {
  const {
    width = 180,
    height = 100
  } = options;
  
  // Bepaal de startpositie
  const startY = doc.autoTable ? doc.autoTable.previous.finalY + 10 : 60;
  
  // Voeg grafiek toe
  doc.addImage(
    chartUrl,
    'PNG',
    14,
    startY,
    width,
    height
  );
  
  // Update de positie voor volgende content
  doc.autoTable.previous = {
    ...doc.autoTable.previous,
    finalY: startY + height
  };
};

/**
 * Maakt een nieuw Excel workbook
 * @returns {XLSX.WorkBook} - Het Excel workbook
 */
export const createExcelWorkbook = () => {
  return XLSX.utils.book_new();
};

/**
 * Voegt een worksheet toe aan een Excel workbook
 * @param {XLSX.WorkBook} workbook - Het Excel workbook
 * @param {string} name - De naam van het worksheet
 * @param {Array<Array<any>>} data - De data voor het worksheet
 */
export const addExcelWorksheet = (workbook, name, data) => {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
};

/**
 * Exporteert een Excel workbook naar een bestand
 * @param {XLSX.WorkBook} workbook - Het Excel workbook
 * @param {string} filename - De bestandsnaam
 */
export const exportExcelWorkbook = (workbook, filename) => {
  XLSX.writeFile(workbook, filename);
};

/**
 * Genereert een bestandsnaam op basis van het type en datumbereik
 * @param {string} type - Het type export
 * @param {Object} dateRange - Het datumbereik
 * @param {Date} dateRange.start - De startdatum
 * @param {Date} dateRange.end - De einddatum
 * @returns {string} - De gegenereerde bestandsnaam
 */
export const generateFilename = (type, dateRange) => {
  const currentDate = format(new Date(), 'yyyyMMdd', { locale: nl });
  
  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = format(dateRange.start, 'yyyyMMdd', { locale: nl });
    const endDate = format(dateRange.end, 'yyyyMMdd', { locale: nl });
    return `${type}_${startDate}_${endDate}_export_${currentDate}`;
  }
  
  return `${type}_export_${currentDate}`;
};

/**
 * Formatteert chart data voor Excel
 * @param {Object} chartData - De chart data
 * @returns {Array<Array<any>>} - De geformatteerde data
 */
export const formatChartDataForExcel = (chartData) => {
  if (!chartData) return [];
  
  // Voor pie/donut charts
  if (Array.isArray(chartData)) {
    const headers = ['Label', 'Value'];
    const rows = chartData.map(item => [item.name, item.value]);
    return [headers, ...rows];
  }
  
  // Voor bar/line charts
  if (typeof chartData === 'object') {
    const headers = ['Category', ...Object.keys(chartData.series || {})];
    const rows = chartData.categories.map((category, index) => {
      return [
        category,
        ...Object.values(chartData.series).map(serie => serie[index])
      ];
    });
    return [headers, ...rows];
  }
  
  return [];
};

/**
 * Genereert een samenvatting van de data
 * @param {Object} metrics - De metrics data
 * @returns {string} - De gegenereerde samenvatting
 */
export const generateDataSummary = (metrics) => {
  if (!metrics || !metrics.summary) {
    return 'Geen data beschikbaar voor samenvatting.';
  }
  
  const {
    totalInteractions,
    totalFeedback,
    feedbackSubmissionRate,
    positiveFeedbackRate,
    averageUserSatisfaction
  } = metrics.summary;
  
  let summary = 'Samenvatting Help Metrics:\n\n';
  
  summary += `In de geselecteerde periode zijn er ${totalInteractions} interacties geweest met het help-systeem. `;
  summary += `Van deze interacties hebben ${totalFeedback} geleid tot feedback (${feedbackSubmissionRate.toFixed(1)}%). `;
  summary += `${positiveFeedbackRate.toFixed(1)}% van de feedback was positief. `;
  summary += `De gemiddelde gebruikerstevredenheid was ${averageUserSatisfaction.toFixed(1)} op een schaal van 1 tot 5.\n\n`;
  
  // Voeg informatie over interacties per type toe
  if (metrics.interactionsByType) {
    summary += 'Interacties per type:\n';
    const interactionTypes = Object.entries(metrics.interactionsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    interactionTypes.forEach(([type, count]) => {
      const percentage = (count / totalInteractions * 100).toFixed(1);
      summary += `- ${type}: ${count} (${percentage}%)\n`;
    });
    summary += '\n';
  }
  
  // Voeg informatie over feedback per gebruikersrol toe
  if (metrics.feedbackByUserRole && metrics.feedbackByUserRole.length > 0) {
    summary += 'Feedback per gebruikersrol:\n';
    metrics.feedbackByUserRole.forEach(item => {
      summary += `- ${item.role}: ${item.positiveRatio.toFixed(1)}% positief (${item.total} feedback)\n`;
    });
    summary += '\n';
  }
  
  // Voeg informatie over feedback per ervaringsniveau toe
  if (metrics.feedbackByExperienceLevel && metrics.feedbackByExperienceLevel.length > 0) {
    summary += 'Feedback per ervaringsniveau:\n';
    metrics.feedbackByExperienceLevel.forEach(item => {
      summary += `- ${item.level}: ${item.positiveRatio.toFixed(1)}% positief (${item.total} feedback)\n`;
    });
    summary += '\n';
  }
  
  // Voeg informatie over interacties trend toe
  if (metrics.interactionsTrend && metrics.interactionsTrend.length > 0) {
    const totalDays = metrics.interactionsTrend.length;
    const totalCount = metrics.interactionsTrend.reduce((sum, item) => sum + item.count, 0);
    const averagePerDay = totalCount / totalDays;
    
    summary += `Gemiddeld aantal interacties per dag: ${averagePerDay.toFixed(1)}\n\n`;
  }
  
  summary += 'Deze samenvatting is automatisch gegenereerd op basis van de beschikbare data.';
  
  return summary;
};

/**
 * Exporteert inzichten naar verschillende formaten (PDF, Excel, CSV, JSON)
 * @param {Array} insights - De inzichten om te exporteren
 * @param {string} format - Het formaat om naar te exporteren ('pdf', 'excel', 'csv', 'json')
 * @param {Object} options - Opties voor de export
 * @param {string} options.title - De titel van het document
 * @param {string} options.projectName - De naam van het project
 * @param {Object} options.dateRange - Het datumbereik van de inzichten
 * @param {Date} options.dateRange.start - De startdatum
 * @param {Date} options.dateRange.end - De einddatum
 * @param {Array} options.platforms - De platforms van de inzichten
 * @param {Object} options.filters - De toegepaste filters
 * @returns {Promise<string|Blob>} - Een belofte die resolvet naar een URL of Blob
 */
export const exportInsights = async (insights, format, options = {}) => {
  if (!insights || insights.length === 0) {
    throw new Error('Geen inzichten beschikbaar om te exporteren');
  }
  
  const {
    title = 'Decodo Inzichten',
    projectName = 'Project',
    dateRange = { start: new Date(), end: new Date() },
    platforms = [],
    filters = {}
  } = options;
  
  // Genereer bestandsnaam
  const filename = generateFilename('insights', dateRange);
  
  switch (format.toLowerCase()) {
    case 'pdf':
      return exportInsightsToPdf(insights, { title, projectName, dateRange, platforms, filters, filename });
    case 'excel':
      return exportInsightsToExcel(insights, { title, projectName, dateRange, platforms, filters, filename });
    case 'csv':
      return exportInsightsToCsv(insights, { filename });
    case 'json':
      return exportInsightsToJson(insights, { filename });
    default:
      throw new Error(`Onbekend exportformaat: ${format}`);
  }
};

/**
 * Exporteert inzichten naar PDF
 * @param {Array} insights - De inzichten om te exporteren
 * @param {Object} options - Opties voor de export
 * @returns {Promise<Blob>} - Een belofte die resolvet naar een Blob
 */
export const exportInsightsToPdf = async (insights, options) => {
  const {
    title,
    projectName,
    dateRange,
    platforms,
    filters,
    filename
  } = options;
  
  // Maak PDF document
  const doc = createPdfDocument({ orientation: 'landscape' });
  
  // Voeg header toe
  const dateRangeStr = `${format(dateRange.start, 'd MMMM yyyy', { locale: nl })} - ${format(dateRange.end, 'd MMMM yyyy', { locale: nl })}`;
  addPdfHeader(doc, title, {
    subtitle: `Project: ${projectName}`,
    dateRange: dateRangeStr
  });
  
  // Voeg filters sectie toe
  addPdfSection(doc, 'Toegepaste Filters');
  const filtersData = [
    ['Filter', 'Waarde'],
    ['Platforms', platforms.join(', ') || 'Alle'],
    ['Sentiment', filters.sentiment || 'Alle'],
    ['Categorie', filters.category || 'Alle'],
    ['Inzicht Type', filters.insightType || 'Alle']
  ];
  addPdfTable(doc, filtersData);
  
  // Voeg inzichten sectie toe
  addPdfSection(doc, 'Inzichten');
  
  // Bereid data voor
  const insightsData = [
    ['Platform', 'Datum', 'Type', 'Sentiment', 'Categorie', 'Inzicht']
  ];
  
  insights.forEach(insight => {
    insightsData.push([
      insight.platform,
      format(new Date(insight.created_at), 'd MMM yyyy', { locale: nl }),
      insight.insight_type,
      insight.sentiment,
      insight.category,
      insight.content.substring(0, 100) + (insight.content.length > 100 ? '...' : '')
    ]);
  });
  
  addPdfTable(doc, insightsData);
  
  // Voeg samenvatting sectie toe
  addPdfSection(doc, 'Samenvatting');
  const summaryData = [
    ['Categorie', 'Aantal'],
    ['Totaal aantal inzichten', insights.length],
    ['Positieve inzichten', insights.filter(i => i.sentiment === 'positive').length],
    ['Neutrale inzichten', insights.filter(i => i.sentiment === 'neutral').length],
    ['Negatieve inzichten', insights.filter(i => i.sentiment === 'negative').length]
  ];
  addPdfTable(doc, summaryData);
  
  // Genereer PDF
  return doc.output('blob');
};

/**
 * Exporteert inzichten naar Excel
 * @param {Array} insights - De inzichten om te exporteren
 * @param {Object} options - Opties voor de export
 * @returns {Promise<Blob>} - Een belofte die resolvet naar een Blob
 */
export const exportInsightsToExcel = async (insights, options) => {
  const { filename } = options;
  
  // Maak workbook
  const workbook = createExcelWorkbook();
  
  // Bereid data voor
  const insightsData = [
    ['Platform', 'Datum', 'Type', 'Sentiment', 'Categorie', 'Inzicht', 'Score', 'Bron URL']
  ];
  
  insights.forEach(insight => {
    insightsData.push([
      insight.platform,
      format(new Date(insight.created_at), 'yyyy-MM-dd', { locale: nl }),
      insight.insight_type,
      insight.sentiment,
      insight.category,
      insight.content,
      insight.score || '',
      insight.source_url || ''
    ]);
  });
  
  // Voeg worksheet toe
  addExcelWorksheet(workbook, 'Inzichten', insightsData);
  
  // Voeg samenvatting worksheet toe
  const summaryData = [
    ['Categorie', 'Aantal'],
    ['Totaal aantal inzichten', insights.length],
    ['Positieve inzichten', insights.filter(i => i.sentiment === 'positive').length],
    ['Neutrale inzichten', insights.filter(i => i.sentiment === 'neutral').length],
    ['Negatieve inzichten', insights.filter(i => i.sentiment === 'negative').length],
    ['Pain points', insights.filter(i => i.category === 'pain_point').length],
    ['Desires', insights.filter(i => i.category === 'desire').length],
    ['Terminology', insights.filter(i => i.category === 'terminology').length]
  ];
  
  addExcelWorksheet(workbook, 'Samenvatting', summaryData);
  
  // Genereer Excel bestand
  const excelBlob = await new Promise((resolve) => {
    XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx', type: 'blob' });
    resolve(new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }));
  });
  
  return excelBlob;
};

/**
 * Exporteert inzichten naar CSV
 * @param {Array} insights - De inzichten om te exporteren
 * @param {Object} options - Opties voor de export
 * @returns {Promise<Blob>} - Een belofte die resolvet naar een Blob
 */
export const exportInsightsToCsv = async (insights, options) => {
  const { filename } = options;
  
  // Bereid headers voor
  const headers = ['Platform', 'Datum', 'Type', 'Sentiment', 'Categorie', 'Inzicht', 'Score', 'Bron URL'];
  
  // Bereid rijen voor
  const rows = insights.map(insight => [
    insight.platform,
    format(new Date(insight.created_at), 'yyyy-MM-dd', { locale: nl }),
    insight.insight_type,
    insight.sentiment,
    insight.category,
    `"${insight.content.replace(/"/g, '""')}"`, // Escape quotes
    insight.score || '',
    insight.source_url || ''
  ]);
  
  // Combineer headers en rijen
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Genereer CSV bestand
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return csvBlob;
};

/**
 * Exporteert inzichten naar JSON
 * @param {Array} insights - De inzichten om te exporteren
 * @param {Object} options - Opties voor de export
 * @returns {Promise<Blob>} - Een belofte die resolvet naar een Blob
 */
export const exportInsightsToJson = async (insights, options) => {
  const { filename } = options;
  
  // Genereer JSON bestand
  const jsonContent = JSON.stringify(insights, null, 2);
  const jsonBlob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  return jsonBlob;
};

export default {
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
};
