/**
 * Utility functies voor het exporteren van data naar verschillende formaten
 */

/**
 * Exporteert data naar CSV formaat
 * @param {Array} data - Array met data objecten
 * @param {string} filename - Bestandsnaam voor de download
 * @param {Object} options - Extra opties voor de export
 */
export const exportToCsv = (data, filename = 'export.csv', options = {}) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  try {
    // Bepaal headers op basis van eerste data object
    const headers = Object.keys(data[0]);
    
    // Maak CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Voeg rijen toe
    data.forEach(item => {
      const row = headers.map(header => {
        // Haal waarde op
        const value = item[header];
        
        // Converteer naar string en escape indien nodig
        let cellValue = value === null || value === undefined ? '' : value.toString();
        
        // Escape quotes en komma's
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
        }
        
        return cellValue;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Creëer blob en download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Creëer download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Voeg toe aan DOM, klik, en verwijder
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Exporteert data naar JSON formaat
 * @param {Object|Array} data - Data om te exporteren
 * @param {string} filename - Bestandsnaam voor de download
 * @param {Object} options - Extra opties voor de export
 */
export const exportToJson = (data, filename = 'export.json', options = {}) => {
  if (!data) {
    console.error('No data to export');
    return;
  }
  
  try {
    // Converteer naar JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Creëer blob en download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Creëer download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Voeg toe aan DOM, klik, en verwijder
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
  }
};

/**
 * Exporteert een DOM element als afbeelding
 * @param {string} elementId - ID van het DOM element om te exporteren
 * @param {string} filename - Bestandsnaam voor de download
 * @param {Object} options - Extra opties voor de export
 */
export const exportToImage = (elementId, filename = 'chart.png', options = {}) => {
  try {
    // Importeer html2canvas dynamisch
    import('html2canvas').then(html2canvasModule => {
      const html2canvas = html2canvasModule.default;
      
      const element = document.getElementById(elementId);
      
      if (!element) {
        console.error(`Element with ID "${elementId}" not found`);
        return;
      }
      
      // Render canvas
      html2canvas(element, {
        scale: options.scale || 2,
        backgroundColor: options.backgroundColor || '#ffffff',
        logging: false,
        ...options
      }).then(canvas => {
        // Converteer canvas naar data URL
        const imageUrl = canvas.toDataURL('image/png');
        
        // Creëer download link
        const link = document.createElement('a');
        link.setAttribute('href', imageUrl);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        // Voeg toe aan DOM, klik, en verwijder
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }).catch(error => {
      console.error('Error loading html2canvas:', error);
      alert('Could not load export library. Please make sure html2canvas is installed.');
    });
  } catch (error) {
    console.error('Error exporting to image:', error);
  }
};

/**
 * Exporteert data naar Excel formaat
 * @param {Array} data - Array met data objecten
 * @param {string} filename - Bestandsnaam voor de download
 * @param {Object} options - Extra opties voor de export
 */
export const exportToExcel = (data, filename = 'export.xlsx', options = {}) => {
  try {
    // Importeer xlsx dynamisch
    import('xlsx').then(XLSXModule => {
      const XLSX = XLSXModule.default;
      
      if (!data || !data.length) {
        console.error('No data to export');
        return;
      }
      
      // Creëer worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Creëer workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');
      
      // Genereer Excel bestand
      XLSX.writeFile(workbook, filename);
    }).catch(error => {
      console.error('Error loading xlsx library:', error);
      alert('Could not load Excel export library. Please make sure xlsx is installed.');
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

/**
 * Exporteert data naar PDF formaat
 * @param {string} elementId - ID van het DOM element om te exporteren
 * @param {string} filename - Bestandsnaam voor de download
 * @param {Object} options - Extra opties voor de export
 */
export const exportToPdf = (elementId, filename = 'export.pdf', options = {}) => {
  try {
    // Importeer jspdf en html2canvas dynamisch
    Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]).then(([jsPDFModule, html2canvasModule]) => {
      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;
      
      const element = document.getElementById(elementId);
      
      if (!element) {
        console.error(`Element with ID "${elementId}" not found`);
        return;
      }
      
      // Render canvas
      html2canvas(element, {
        scale: options.scale || 2,
        backgroundColor: options.backgroundColor || '#ffffff',
        logging: false,
        ...options
      }).then(canvas => {
        // Canvas afmetingen
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 breedte in mm
        const pageHeight = 295; // A4 hoogte in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // Creëer PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        
        // Voeg afbeelding toe aan PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        
        // Als de afbeelding groter is dan een pagina, voeg meerdere pagina's toe
        const heightLeft = imgHeight - pageHeight;
        
        if (heightLeft > 0) {
          let currentPosition = -pageHeight;
          
          while (currentPosition > -imgHeight) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
            currentPosition -= pageHeight;
          }
        }
        
        // Download PDF
        pdf.save(filename);
      });
    }).catch(error => {
      console.error('Error loading PDF export libraries:', error);
      alert('Could not load PDF export libraries. Please make sure jspdf and html2canvas are installed.');
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};
