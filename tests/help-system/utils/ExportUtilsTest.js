/**
 * ExportUtilsTest.js
 * 
 * Test voor de exportUtils functies.
 */

import * as exportUtils from '../../../frontend/src/utils/exportUtils';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// Mock de jsPDF en XLSX modules
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      text: jest.fn(),
      setDrawColor: jest.fn(),
      line: jest.fn(),
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210)
        }
      },
      autoTable: {
        previous: {
          finalY: 100
        }
      },
      addImage: jest.fn(),
      save: jest.fn()
    }))
  };
});

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn().mockReturnValue({}),
    aoa_to_sheet: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn()
  },
  writeFile: jest.fn()
}));

describe('Export Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PDF Functions', () => {
    it('creates a PDF document with default options', () => {
      const doc = exportUtils.createPdfDocument();
      
      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      expect(doc).toBeDefined();
    });

    it('creates a PDF document with custom options', () => {
      const options = {
        orientation: 'landscape',
        unit: 'in',
        format: 'letter',
        compress: false
      };
      
      exportUtils.createPdfDocument(options);
      
      expect(jsPDF).toHaveBeenCalledWith(options);
    });

    it('adds a header to a PDF document', () => {
      const doc = exportUtils.createPdfDocument();
      const title = 'Test Document';
      const options = {
        subtitle: 'Test Subtitle',
        date: '2023-05-01',
        dateRange: '2023-05-01 - 2023-05-31'
      };
      
      exportUtils.addPdfHeader(doc, title, options);
      
      expect(doc.setFontSize).toHaveBeenCalledWith(18);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(doc.text).toHaveBeenCalledWith(title, 14, 20);
      
      expect(doc.setFontSize).toHaveBeenCalledWith(12);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'normal');
      expect(doc.text).toHaveBeenCalledWith(options.subtitle, 14, 28);
      
      expect(doc.setFontSize).toHaveBeenCalledWith(10);
      expect(doc.text).toHaveBeenCalledWith(`Datum: ${options.date}`, 14, 35);
      
      expect(doc.text).toHaveBeenCalledWith(`Periode: ${options.dateRange}`, 14, 40);
      
      expect(doc.setDrawColor).toHaveBeenCalledWith(200, 200, 200);
      expect(doc.line).toHaveBeenCalledWith(14, 45, 196, 45);
    });

    it('adds a section to a PDF document', () => {
      const doc = exportUtils.createPdfDocument();
      const title = 'Test Section';
      
      exportUtils.addPdfSection(doc, title);
      
      expect(doc.setFontSize).toHaveBeenCalledWith(14);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(doc.text).toHaveBeenCalledWith(title, 14, 115);
      
      expect(doc.setFontSize).toHaveBeenCalledWith(12);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'normal');
    });

    it('adds a table to a PDF document', () => {
      const doc = exportUtils.createPdfDocument();
      doc.autoTable = jest.fn();
      
      const data = [
        ['Header 1', 'Header 2'],
        ['Row 1, Cell 1', 'Row 1, Cell 2'],
        ['Row 2, Cell 1', 'Row 2, Cell 2']
      ];
      
      exportUtils.addPdfTable(doc, data);
      
      expect(doc.autoTable).toHaveBeenCalledWith({
        startY: 110,
        head: [data[0]],
        body: data.slice(1),
        columns: undefined,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 }
      });
    });

    it('adds a chart to a PDF document', () => {
      const doc = exportUtils.createPdfDocument();
      const chartUrl = 'data:image/png;base64,test';
      
      exportUtils.addPdfChart(doc, chartUrl);
      
      expect(doc.addImage).toHaveBeenCalledWith(
        chartUrl,
        'PNG',
        14,
        110,
        180,
        100
      );
    });
  });

  describe('Excel Functions', () => {
    it('creates an Excel workbook', () => {
      const workbook = exportUtils.createExcelWorkbook();
      
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(workbook).toBeDefined();
    });

    it('adds a worksheet to an Excel workbook', () => {
      const workbook = exportUtils.createExcelWorkbook();
      const name = 'Test Sheet';
      const data = [
        ['Header 1', 'Header 2'],
        ['Row 1, Cell 1', 'Row 1, Cell 2'],
        ['Row 2, Cell 1', 'Row 2, Cell 2']
      ];
      
      exportUtils.addExcelWorksheet(workbook, name, data);
      
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith(data);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(workbook, {}, name);
    });

    it('exports an Excel workbook to a file', () => {
      const workbook = exportUtils.createExcelWorkbook();
      const filename = 'test.xlsx';
      
      exportUtils.exportExcelWorkbook(workbook, filename);
      
      expect(XLSX.writeFile).toHaveBeenCalledWith(workbook, filename);
    });
  });

  describe('Helper Functions', () => {
    it('generates a filename based on type and date range', () => {
      const type = 'test';
      const dateRange = {
        start: new Date('2023-05-01'),
        end: new Date('2023-05-31')
      };
      
      // Mock de huidige datum
      const originalDate = global.Date;
      const mockDate = new Date('2023-06-01');
      global.Date = jest.fn(() => mockDate);
      global.Date.now = originalDate.now;
      
      const filename = exportUtils.generateFilename(type, dateRange);
      
      // Herstel de originele Date
      global.Date = originalDate;
      
      expect(filename).toContain('test_20230501_20230531_export_');
    });

    it('formats chart data for Excel (pie/donut chart)', () => {
      const chartData = [
        { name: 'Category 1', value: 50 },
        { name: 'Category 2', value: 30 },
        { name: 'Category 3', value: 20 }
      ];
      
      const formattedData = exportUtils.formatChartDataForExcel(chartData);
      
      expect(formattedData).toEqual([
        ['Label', 'Value'],
        ['Category 1', 50],
        ['Category 2', 30],
        ['Category 3', 20]
      ]);
    });

    it('formats chart data for Excel (bar/line chart)', () => {
      const chartData = {
        categories: ['Jan', 'Feb', 'Mar'],
        series: {
          'Series 1': [10, 20, 30],
          'Series 2': [15, 25, 35]
        }
      };
      
      const formattedData = exportUtils.formatChartDataForExcel(chartData);
      
      expect(formattedData).toEqual([
        ['Category', 'Series 1', 'Series 2'],
        ['Jan', 10, 15],
        ['Feb', 20, 25],
        ['Mar', 30, 35]
      ]);
    });

    it('generates a data summary', () => {
      const metrics = {
        summary: {
          totalInteractions: 100,
          totalFeedback: 50,
          feedbackSubmissionRate: 50,
          positiveFeedbackRate: 75,
          averageUserSatisfaction: 4.5
        },
        interactionsByType: {
          click: 50,
          hover: 30,
          view: 20
        },
        feedbackByUserRole: [
          { role: 'admin', positive: 30, negative: 10, total: 40, positiveRatio: 75 }
        ],
        feedbackByExperienceLevel: [
          { level: 'beginner', positive: 25, negative: 5, total: 30, positiveRatio: 83.3 }
        ],
        interactionsTrend: [
          { date: '2023-05-01', count: 10 },
          { date: '2023-05-02', count: 15 }
        ]
      };
      
      const summary = exportUtils.generateDataSummary(metrics);
      
      expect(summary).toContain('Samenvatting Help Metrics:');
      expect(summary).toContain('100 interacties');
      expect(summary).toContain('50%');
      expect(summary).toContain('75.0% van de feedback was positief');
      expect(summary).toContain('4.5 op een schaal van 1 tot 5');
    });
  });
});
