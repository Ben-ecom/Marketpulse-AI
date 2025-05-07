/**
 * Utility functies voor het exporteren van data naar PDF, Excel en HTML formaten
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Genereert een bestandsnaam met project informatie en datum
 * @param {String} projectName - Naam van het project
 * @param {String} exportType - Type export ('pdf' of 'excel')
 * @param {String} contentType - Type content dat wordt geëxporteerd (bijv. 'sentiment', 'competitor')
 * @returns {String} Gegenereerde bestandsnaam
 */
export const generateFilename = (projectName, exportType, contentType) => {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedProjectName = (projectName || 'marketpulse')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  
  const extension = exportType === 'pdf' ? 'pdf' : 'xlsx';
  
  return `${sanitizedProjectName}-${contentType}-${formattedDate}.${extension}`;
};

/**
 * PDF Export Utilities
 */

/**
 * Maakt een nieuwe PDF document instantie
 * @param {Object} options - Configuratie opties
 * @returns {jsPDF} PDF document instantie
 */
export const createPdfDocument = (options = {}) => {
  const { orientation = 'portrait', unit = 'mm', format = 'a4' } = options;
  return new jsPDF(orientation, unit, format);
};

/**
 * Voegt een header toe aan het PDF document
 * @param {jsPDF} doc - PDF document instantie
 * @param {String} title - Titel van het document
 * @param {String} projectName - Naam van het project
 * @param {Object} options - Configuratie opties
 */
export const addPdfHeader = (doc, title, projectName, options = {}) => {
  const { 
    titleFontSize = 18, 
    subTitleFontSize = 12,
    titleColor = '#333333',
    logoUrl = null
  } = options;
  
  // Voeg logo toe indien beschikbaar
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', 10, 10, 30, 30);
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 45, doc.internal.pageSize.width - 10, 45);
    } catch (error) {
      console.error('Fout bij toevoegen logo:', error);
    }
  }
  
  // Voeg titel toe
  doc.setFontSize(titleFontSize);
  doc.setTextColor(titleColor);
  doc.text(title, doc.internal.pageSize.width / 2, logoUrl ? 25 : 20, { align: 'center' });
  
  // Voeg project naam en datum toe
  doc.setFontSize(subTitleFontSize);
  doc.setTextColor(100, 100, 100);
  
  if (projectName) {
    doc.text(`Project: ${projectName}`, doc.internal.pageSize.width / 2, logoUrl ? 35 : 30, { align: 'center' });
  }
  
  const date = new Date().toLocaleDateString('nl-NL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Gegenereerd op: ${date}`, doc.internal.pageSize.width / 2, logoUrl ? 42 : 37, { align: 'center' });
  
  // Voeg pagina nummering toe
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Pagina ${i} van ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
  }
  
  // Reset text kleur
  doc.setTextColor(0, 0, 0);
};

/**
 * Voegt een sectie toe aan het PDF document
 * @param {jsPDF} doc - PDF document instantie
 * @param {String} title - Titel van de sectie
 * @param {String} content - Inhoud van de sectie
 * @param {Number} yPosition - Y positie om de sectie te beginnen
 * @returns {Number} Nieuwe Y positie na de sectie
 */
export const addPdfSection = (doc, title, content, yPosition) => {
  const startY = yPosition || 50;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  const contentWidth = pageWidth - (2 * margin);
  
  // Voeg sectie titel toe
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, margin, startY);
  
  // Voeg sectie content toe
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  // Split content in regels die passen binnen de pagina breedte
  const contentLines = doc.splitTextToSize(content, contentWidth);
  
  // Controleer of we een nieuwe pagina nodig hebben
  if (startY + 10 + (contentLines.length * 7) > pageHeight - 20) {
    doc.addPage();
    doc.text(contentLines, margin, 20);
    return 20 + (contentLines.length * 7) + 10;
  } else {
    doc.text(contentLines, margin, startY + 10);
    return startY + 10 + (contentLines.length * 7) + 10;
  }
};

/**
 * Voegt een tabel toe aan het PDF document
 * @param {jsPDF} doc - PDF document instantie
 * @param {Array} headers - Array met kolomkoppen
 * @param {Array} data - Array met rijen data
 * @param {Number} yPosition - Y positie om de tabel te beginnen
 * @param {Object} options - Configuratie opties voor de tabel
 * @returns {Number} Nieuwe Y positie na de tabel
 */
export const addPdfTable = (doc, headers, data, yPosition, options = {}) => {
  const startY = yPosition || 50;
  const { 
    theme = 'striped', 
    headerBackgroundColor = [41, 128, 185],
    headerTextColor = 255,
    alternateRowColor = 240
  } = options;
  
  // Configureer tabel stijl
  const tableConfig = {
    startY,
    head: [headers],
    body: data,
    theme,
    headStyles: {
      fillColor: headerBackgroundColor,
      textColor: headerTextColor,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [alternateRowColor, alternateRowColor, alternateRowColor]
    },
    margin: { top: 10 }
  };
  
  // Voeg tabel toe aan document
  doc.autoTable(tableConfig);
  
  // Return nieuwe Y positie
  return doc.previousAutoTable.finalY + 10;
};

/**
 * Voegt een chart afbeelding toe aan het PDF document
 * @param {jsPDF} doc - PDF document instantie
 * @param {String} chartImageData - Base64 gecodeerde chart afbeelding
 * @param {String} title - Titel van de chart
 * @param {Number} yPosition - Y positie om de chart te beginnen
 * @param {Object} options - Configuratie opties
 * @returns {Number} Nieuwe Y positie na de chart
 */
export const addPdfChart = (doc, chartImageData, title, yPosition, options = {}) => {
  const startY = yPosition || 50;
  const { 
    width = 180, 
    titleFontSize = 14,
    addPageIfNeeded = true
  } = options;
  
  // Bereken hoogte op basis van aspect ratio
  const aspectRatio = 4/3; // Standaard aspect ratio
  const height = width / aspectRatio;
  
  // Controleer of we een nieuwe pagina nodig hebben
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  
  if (addPageIfNeeded && (startY + height + 20 > pageHeight - margin)) {
    doc.addPage();
    let newY = 20;
    
    // Voeg titel toe
    if (title) {
      doc.setFontSize(titleFontSize);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, newY);
      newY += 10;
    }
    
    // Voeg chart toe
    try {
      doc.addImage(chartImageData, 'PNG', margin, newY, width, height);
    } catch (error) {
      console.error('Fout bij toevoegen chart:', error);
      doc.setTextColor(255, 0, 0);
      doc.text('Fout bij laden van chart afbeelding', margin, newY + 20);
      doc.setTextColor(0, 0, 0);
    }
    
    return newY + height + 10;
  } else {
    // Voeg titel toe
    if (title) {
      doc.setFontSize(titleFontSize);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, startY);
    }
    
    // Voeg chart toe
    try {
      doc.addImage(chartImageData, 'PNG', margin, startY + (title ? 10 : 0), width, height);
    } catch (error) {
      console.error('Fout bij toevoegen chart:', error);
      doc.setTextColor(255, 0, 0);
      doc.text('Fout bij laden van chart afbeelding', margin, startY + 20);
      doc.setTextColor(0, 0, 0);
    }
    
    return startY + (title ? 10 : 0) + height + 10;
  }
};

/**
 * Excel Export Utilities
 */

/**
 * Maakt een nieuw Excel werkboek
 * @returns {XLSX.WorkBook} Excel werkboek
 */
export const createExcelWorkbook = () => {
  return XLSX.utils.book_new();
};

/**
 * Voegt een werkblad toe aan het Excel werkboek
 * @param {XLSX.WorkBook} workbook - Excel werkboek
 * @param {Array} data - Array met data voor het werkblad
 * @param {String} sheetName - Naam van het werkblad
 * @param {Object} options - Configuratie opties
 */
export const addExcelWorksheet = (workbook, data, sheetName, options = {}) => {
  const { 
    includeHeaders = true,
    headerStyle = { bold: true, fill: { fgColor: { rgb: "4F81BD" } } }
  } = options;
  
  // Maak werkblad van data
  const worksheet = XLSX.utils.json_to_sheet(data, { 
    header: includeHeaders ? Object.keys(data[0] || {}) : undefined
  });
  
  // Voeg werkblad toe aan werkboek
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return worksheet;
};

/**
 * Exporteert een Excel werkboek naar een bestand
 * @param {XLSX.WorkBook} workbook - Excel werkboek
 * @param {String} filename - Bestandsnaam voor het Excel bestand
 */
export const exportExcelWorkbook = (workbook, filename) => {
  XLSX.writeFile(workbook, filename);
};

/**
 * Converteert chart data naar een formaat geschikt voor Excel
 * @param {Array} chartData - Data gebruikt voor de chart
 * @returns {Array} Geformatteerde data voor Excel
 */
export const formatChartDataForExcel = (chartData) => {
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return [];
  }
  
  // Flatten nested data structures
  return chartData.map(item => {
    const result = { ...item };
    
    // Converteer arrays naar string representaties
    Object.keys(result).forEach(key => {
      if (Array.isArray(result[key])) {
        result[key] = JSON.stringify(result[key]);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = JSON.stringify(result[key]);
      }
    });
    
    return result;
  });
};

/**
 * Genereert een samenvatting van de data
 * @param {Array} data - Array met data
 * @returns {Object} Samenvatting object
 */
export const generateDataSummary = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalItems: 0,
      dateRange: { start: null, end: null },
      platforms: []
    };
  }
  
  // Verzamel unieke platforms
  const platforms = [...new Set(data.map(item => item.platform).filter(Boolean))];
  
  // Bepaal datum bereik
  const dates = data
    .map(item => new Date(item.timestamp || item.created_at || item.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a - b);
  
  const dateRange = {
    start: dates.length > 0 ? dates[0].toISOString().split('T')[0] : null,
    end: dates.length > 0 ? dates[dates.length - 1].toISOString().split('T')[0] : null
  };
  
  return {
    totalItems: data.length,
    dateRange,
    platforms
  };
};

/**
 * HTML Export Utilities
 */

/**
 * Genereert een HTML rapport
 * @param {String} title - Titel van het rapport
 * @param {String} projectName - Naam van het project
 * @param {Array} data - Data voor het rapport
 * @param {Array} sections - Secties voor het rapport
 * @param {Object} options - Configuratie opties
 * @returns {String} HTML string
 */
export const generateHtmlReport = (title, projectName, data, sections = [], options = {}) => {
  const {
    includeRawData = true,
    includeSummary = true,
    theme = 'light',
    chartImageData = null
  } = options;
  
  // Genereer datum
  const date = new Date().toLocaleDateString('nl-NL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Genereer samenvatting
  const summary = generateDataSummary(data);
  
  // Genereer HTML
  let html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - ${projectName || 'MarketPulse AI'}</title>
      <style>
        :root {
          --primary-color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'};
          --background-color: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
          --text-color: ${theme === 'dark' ? '#e5e7eb' : '#111827'};
          --secondary-bg: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          --border-color: ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--background-color);
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .report-title {
          font-size: 28px;
          margin-bottom: 10px;
          color: var(--primary-color);
        }
        
        .report-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .report-section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: var(--secondary-bg);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
          font-size: 20px;
          margin-bottom: 15px;
          color: var(--primary-color);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }
        
        .section-content {
          margin-bottom: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        
        th {
          background-color: var(--primary-color);
          color: white;
        }
        
        tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.03);
        }
        
        .chart-container {
          max-width: 100%;
          margin: 20px 0;
          text-align: center;
        }
        
        .chart-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .summary-box {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          flex: 1;
          min-width: 200px;
          padding: 15px;
          background-color: var(--background-color);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .summary-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
        }
        
        .toggle-theme {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 8px 12px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          color: #6b7280;
          font-size: 14px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .toggle-theme {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="toggle-theme" onclick="toggleTheme()">Wissel thema</button>
      
      <div class="report-header">
        <h1 class="report-title">${title}</h1>
        ${projectName ? `<p class="report-subtitle">Project: ${projectName}</p>` : ''}
        <p class="report-subtitle">Gegenereerd op: ${date}</p>
      </div>
  `;
  
  // Voeg samenvatting toe indien gewenst
  if (includeSummary) {
    html += `
      <div class="report-section">
        <h2 class="section-title">Samenvatting</h2>
        <div class="summary-box">
          <div class="summary-item">
            <div class="summary-label">Totaal aantal items</div>
            <div class="summary-value">${summary.totalItems}</div>
          </div>
          ${summary.dateRange.start ? `
            <div class="summary-item">
              <div class="summary-label">Periode</div>
              <div class="summary-value">${summary.dateRange.start} tot ${summary.dateRange.end}</div>
            </div>
          ` : ''}
          ${summary.platforms.length > 0 ? `
            <div class="summary-item">
              <div class="summary-label">Platforms</div>
              <div class="summary-value">${summary.platforms.length}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Voeg secties toe
  if (sections && sections.length > 0) {
    sections.forEach(section => {
      html += `
        <div class="report-section">
          <h2 class="section-title">${section.title}</h2>
          <div class="section-content">
      `;
      
      if (section.type === 'text' && section.content) {
        html += `<p>${section.content}</p>`;
      } else if (section.type === 'table' && section.data && section.data.length > 0) {
        html += `
          <table>
            <thead>
              <tr>
                ${section.headers ? section.headers.map(header => `<th>${header}</th>`).join('') : 
                  Object.keys(section.data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${section.data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else if (section.type === 'chart' && chartImageData) {
        html += `
          <div class="chart-container">
            <img src="${chartImageData}" alt="${section.title}" class="chart-image" />
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    });
  }
  
  // Voeg ruwe data toe indien gewenst
  if (includeRawData && data && data.length > 0) {
    html += `
      <div class="report-section">
        <h2 class="section-title">Ruwe Data</h2>
        <div class="section-content">
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => {
                    // Format value based on type
                    if (typeof value === 'object') {
                      return `<td>${JSON.stringify(value)}</td>`;
                    }
                    return `<td>${value}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  // Voeg footer toe
  html += `
      <div class="footer">
        <p>© ${new Date().getFullYear()} MarketPulse AI - Alle rechten voorbehouden</p>
      </div>
      
      <script>
        function toggleTheme() {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          document.documentElement.setAttribute('data-theme', newTheme);
          
          // Update CSS variables
          document.documentElement.style.setProperty(
            '--primary-color', 
            newTheme === 'dark' ? '#60a5fa' : '#2563eb'
          );
          document.documentElement.style.setProperty(
            '--background-color', 
            newTheme === 'dark' ? '#1f2937' : '#ffffff'
          );
          document.documentElement.style.setProperty(
            '--text-color', 
            newTheme === 'dark' ? '#e5e7eb' : '#111827'
          );
          document.documentElement.style.setProperty(
            '--secondary-bg', 
            newTheme === 'dark' ? '#374151' : '#f3f4f6'
          );
          document.documentElement.style.setProperty(
            '--border-color', 
            newTheme === 'dark' ? '#4b5563' : '#e5e7eb'
          );
        }
      </script>
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Exporteert een HTML rapport naar een bestand
 * @param {String} html - HTML string
 * @param {String} filename - Bestandsnaam voor het HTML bestand
 */
export const exportHtmlReport = (html, filename) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
};

/**
 * Genereert een bestandsnaam voor HTML export
 * @param {String} projectName - Naam van het project
 * @param {String} contentType - Type content dat wordt geëxporteerd
 * @returns {String} Gegenereerde bestandsnaam
 */
export const generateHtmlFilename = (projectName, contentType) => {
  return generateFilename(projectName, 'html', contentType);
};

/**
 * Decodo Insights Export Utilities
 */

/**
 * Formatteert Decodo inzichten data voor export
 * @param {Array} insights - Array met inzichten
 * @param {String} insightType - Type inzicht ('trend', 'sentiment', etc.)
 * @returns {Array} Geformatteerde data voor export
 */
export const formatInsightsForExport = (insights, insightType = null) => {
  if (!insights || insights.length === 0) {
    return [];
  }
  
  // Filter op inzicht type indien opgegeven
  const filteredInsights = insightType 
    ? insights.filter(insight => insight.insight_type === insightType)
    : insights;
  
  // Formatteer de inzichten voor export
  return filteredInsights.map(insight => {
    // Basis informatie die voor alle inzichten geldt
    const baseInfo = {
      id: insight.id,
      insight_type: insight.insight_type,
      platform: insight.platform || 'Alle platforms',
      content_type: insight.content_type || 'Alle content types',
      description: insight.description,
      period_start: new Date(insight.period_start).toLocaleDateString('nl-NL'),
      period_end: new Date(insight.period_end).toLocaleDateString('nl-NL'),
      created_at: new Date(insight.created_at).toLocaleDateString('nl-NL')
    };
    
    // Voeg type-specifieke informatie toe
    switch (insight.insight_type) {
      case 'trend':
        return {
          ...baseInfo,
          trend_direction: insight.data.trend_direction,
          total_results: insight.data.total_results
        };
      case 'sentiment':
        return {
          ...baseInfo,
          average_score: insight.data.average_score,
          positive_percentage: insight.data.positive?.percentage.toFixed(1) + '%',
          neutral_percentage: insight.data.neutral?.percentage.toFixed(1) + '%',
          negative_percentage: insight.data.negative?.percentage.toFixed(1) + '%'
        };
      default:
        return baseInfo;
    }
  });
};

/**
 * Genereert aangepaste secties voor Decodo inzichten export
 * @param {Array} insights - Array met inzichten
 * @param {Object} chartRefs - Object met chart referenties
 * @returns {Array} Array met secties voor export
 */
export const generateInsightsSections = (insights, chartRefs = {}) => {
  if (!insights || insights.length === 0) {
    return [];
  }
  
  const sections = [];
  
  // Voeg een algemene samenvatting sectie toe
  sections.push({
    id: 'summary',
    title: 'Samenvatting',
    type: 'text',
    content: `Dit rapport bevat ${insights.length} inzichten gegenereerd op basis van Decodo API scraping resultaten. `
      + `De inzichten zijn gegenereerd voor de periode ${new Date(insights[0].period_start).toLocaleDateString('nl-NL')} `
      + `tot ${new Date(insights[0].period_end).toLocaleDateString('nl-NL')}.`
  });
  
  // Groepeer inzichten per type
  const insightsByType = insights.reduce((groups, insight) => {
    const type = insight.insight_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(insight);
    return groups;
  }, {});
  
  // Voeg secties toe voor elk type inzicht
  Object.entries(insightsByType).forEach(([type, typeInsights]) => {
    // Voeg een sectie toe voor dit type inzicht
    sections.push({
      id: `${type}-overview`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Inzichten`,
      type: 'text',
      content: `Er zijn ${typeInsights.length} ${type} inzichten gegenereerd. `
        + `Deze inzichten geven informatie over ${type === 'trend' ? 'trends en patronen' : type === 'sentiment' ? 'sentiment en emoties' : 'verschillende aspecten'} `
        + `in de verzamelde data.`
    });
    
    // Voeg een tabel toe met de inzichten
    sections.push({
      id: `${type}-table`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Inzichten Tabel`,
      type: 'table',
      data: formatInsightsForExport(typeInsights, type),
      headers: type === 'trend' 
        ? ['Platform', 'Trend Richting', 'Totaal Resultaten', 'Beschrijving', 'Periode Start', 'Periode Eind']
        : type === 'sentiment'
        ? ['Platform', 'Gemiddelde Score', 'Positief %', 'Neutraal %', 'Negatief %', 'Beschrijving', 'Periode Start', 'Periode Eind']
        : ['Platform', 'Content Type', 'Beschrijving', 'Periode Start', 'Periode Eind']
    });
    
    // Voeg chart toe indien beschikbaar
    if (chartRefs[type]) {
      sections.push({
        id: `${type}-chart`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Visualisatie`,
        type: 'chart',
        chartRef: chartRefs[type]
      });
    }
  });
  
  return sections;
};
