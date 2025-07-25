// utils/pdfExport.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface WorkHour {
  employee: string;
  name: string;
  department: string;
  designation: string;
  date?: string;
  time_in: string;
  time_out: string;
  total_hours: number;
  days_worked?: number;
  average_hours_per_day?: number;
  is_currently_clocked_in?: boolean;
}

interface ExportConfig {
  data: WorkHour[];
  startDate: string;
  endDate: string;
  isDateRange: boolean;
  filters?: Record<string, string>;
  summaryStats?: {
    totalEmployees: number;
    totalHours: number;
    currentlyClocked: number;
    avgHoursPerEmployee: number;
  };
}

export const exportWorkHoursToPDF = async (config: ExportConfig) => {
  try {
    console.log('Starting PDF export with config:', config);
    
    const { data, startDate, endDate, isDateRange, filters = {}, summaryStats } = config;
    
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create new PDF document in LANDSCAPE orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    console.log('PDF created in landscape mode. Page size:', pageWidth, 'x', pageHeight);
    
    let yPosition = 20;

    console.log('PDF document created, adding header...');

    // Skip logo loading for now to avoid timeout issues
    console.log('Skipping logo for now...');

    // Add company header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BizSmart Enterprises Ltd', pageWidth - 15, 20, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Work Hours Report', pageWidth - 15, 30, { align: 'right' });

    // Add report title and date range
    yPosition += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = isDateRange 
      ? `Work Hours Report: ${formatDate(startDate)} to ${formatDate(endDate)}`
      : `Work Hours Report: ${formatDate(startDate)}`;
    doc.text(title, 15, yPosition);

    // Add generation timestamp
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, yPosition);

    console.log('Adding filters and summary...');

    // Add active filters if any
    const activeFilters = Object.entries(filters).filter(([_, value]) => value && value !== 'all' && value !== '');
    if (activeFilters.length > 0) {
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters:', 15, yPosition);
      doc.setFont('helvetica', 'normal');
      
      activeFilters.forEach(([key, value]) => {
        yPosition += 6;
        doc.text(`• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, 20, yPosition);
      });
    }

    // Add summary statistics if available
    if (summaryStats) {
      yPosition += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 15, yPosition);
      
      yPosition += 10;
      
      const summaryData = [
        ['Total Employees', summaryStats.totalEmployees.toString()],
        ['Total Hours', summaryStats.totalHours.toFixed(2) + 'h'],
        ['Currently Clocked In', summaryStats.currentlyClocked.toString()],
        ['Average Hours/Employee', summaryStats.avgHoursPerEmployee.toFixed(2) + 'h']
      ];

      try {
        console.log('Creating summary table with autoTable...');
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [23, 80, 59], textColor: 255, fontSize: 11 }, // Brand green
          bodyStyles: { fontSize: 10 },
          margin: { left: 15, right: 15 },
          tableWidth: 'wrap',
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'right' }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
        console.log('Summary table created successfully');
      } catch (tableError) {
        console.warn('Error creating summary table:', tableError);
        yPosition += 30; // Skip summary table
      }
    }

    console.log('Preparing main data table...');

    // Prepare table columns based on date range (optimized for landscape)
    const columns = [
      { header: 'Employee ID', dataKey: 'employee' },
      { header: 'Name', dataKey: 'name' },
      ...(isDateRange ? [{ header: 'Days', dataKey: 'days_worked' }] : []),
      { header: 'Department', dataKey: 'department' },
      { header: 'Designation', dataKey: 'designation' },
      { header: isDateRange ? 'First In' : 'Time In', dataKey: 'time_in' },
      { header: isDateRange ? 'Last Out' : 'Time Out', dataKey: 'time_out' },
      { header: 'Total Hours', dataKey: 'total_hours' },
      ...(isDateRange ? [{ header: 'Avg/Day', dataKey: 'average_hours_per_day' }] : []),
      { header: 'Status', dataKey: 'status' }
    ];

    // Prepare table data
    const tableData = data.map(row => ({
      employee: row.employee || '',
      name: row.name || '',
      ...(isDateRange ? { days_worked: row.days_worked?.toString() || '0' } : {}),
      department: row.department || '',
      designation: row.designation || '',
      time_in: row.time_in || '-',
      time_out: row.time_out || '-',
      total_hours: row.total_hours ? row.total_hours.toFixed(2) + 'h' : '0.00h',
      ...(isDateRange ? { average_hours_per_day: row.average_hours_per_day?.toFixed(2) + 'h' || '0.00h' } : {}),
      status: row.is_currently_clocked_in ? 'Clocked In' : (row.time_out ? 'Clocked Out' : 'No Check-in')
    }));

    console.log('Table data prepared:', tableData.length, 'rows');

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Add main data table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Work Hours', 15, yPosition);
    yPosition += 10;

    try {
      console.log('Creating main table with autoTable in landscape...');
      
      autoTable(doc, {
        startY: yPosition,
        head: [columns.map(col => col.header)],
        body: tableData.map(row => columns.map(col => row[col.dataKey as keyof typeof row] || '')),
        theme: 'striped',
        headStyles: { 
          fillColor: [23, 80, 59], // Brand green
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 4
        },
        alternateRowStyles: { 
          fillColor: [248, 253, 249] // Very light green tint
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Employee ID
          1: { cellWidth: 45 }, // Name (wider in landscape)
          ...(isDateRange ? { 2: { cellWidth: 18, halign: 'center' } } : {}), // Days Worked
          [isDateRange ? 2 : 2]: { cellWidth: 35 }, // Department
          [isDateRange ? 3 : 3]: { cellWidth: 35 }, // Designation
          [isDateRange ? 4 : 4]: { cellWidth: 22, halign: 'center' }, // Time In
          [isDateRange ? 5 : 5]: { cellWidth: 22, halign: 'center' }, // Time Out
          [isDateRange ? 6 : 6]: { cellWidth: 25, halign: 'right' }, // Total Hours
          ...(isDateRange ? { 7: { cellWidth: 22, halign: 'right' } } : {}), // Avg/Day
          [isDateRange ? 8 : 7]: { cellWidth: 28 } // Status
        }
      });

      console.log('Main table created successfully');
    } catch (mainTableError) {
      console.error('Error creating main table:', mainTableError);
      const errorMessage = mainTableError instanceof Error ? mainTableError.message : String(mainTableError);
      throw new Error('Failed to create main data table: ' + errorMessage);
    }

    // Add footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: 'right' }
      );
      doc.text(
        '© 2025 BizSmart Enterprises Ltd',
        15,
        pageHeight - 10
      );
    }

    // Generate filename
    const dateRange = isDateRange ? `${startDate}_to_${endDate}` : startDate;
    const filterSuffix = activeFilters.length > 0 ? '_filtered' : '';
    const filename = `work_hours_report_${dateRange}${filterSuffix}.pdf`;

    console.log('Saving PDF with filename:', filename);

    // Save the PDF
    doc.save(filename);
    
    console.log('PDF export completed successfully');

  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};