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

// NEW INTERFACE FOR EMPLOYEE ATTENDANCE DETAIL
interface EmployeeAttendanceExportData {
  employeeInfo: any;
  attendanceData: any[];
  startDate: string;
  endDate: string;
  summaryStats: {
    totalDays: number;
    daysPresent: number;
    totalHours: number;
    averageHours: number;
    attendanceRate: number;
    currentStreak: number;
  };
}

// EXISTING FUNCTION - Updated to remove days/average columns
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
    doc.text('Bizsmart Enterprises Ltd', pageWidth - 15, 20, { align: 'right' });
    
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

    // Prepare table columns - REMOVED days_worked and average_hours_per_day columns
    const columns = [
      { header: 'Employee ID', dataKey: 'employee' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Designation', dataKey: 'designation' },
      { header: 'Time In', dataKey: 'time_in' },
      { header: 'Time Out', dataKey: 'time_out' },
      { header: 'Hours Worked', dataKey: 'total_hours' },
      { header: 'Status', dataKey: 'status' }
    ];

    // Prepare table data - REMOVED days_worked and average_hours_per_day
    const tableData = data.map(row => ({
      employee: row.employee || '',
      name: row.name || '',
      date: row.date ? formatDate(row.date) : '-',
      department: row.department || '',
      designation: row.designation || '',
      time_in: row.time_in || '-',
      time_out: row.time_out || '-',
      total_hours: row.total_hours ? row.total_hours.toFixed(2) + 'h' : '0.00h',
      status: row.is_currently_clocked_in ? 'Clocked In' : (row.time_out ? 'Clocked Out' : 'No Check-out')
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
          1: { cellWidth: 45 }, // Name
          2: { cellWidth: 25 }, // Date
          3: { cellWidth: 35 }, // Department
          4: { cellWidth: 35 }, // Designation
          5: { cellWidth: 22, halign: 'center' }, // Time In
          6: { cellWidth: 22, halign: 'center' }, // Time Out
          7: { cellWidth: 25, halign: 'right' }, // Hours Worked
          8: { cellWidth: 28 } // Status
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
        '© 2025 Bizsmart Enterprises Ltd',
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

// NEW FUNCTION FOR EMPLOYEE ATTENDANCE DETAIL
export const exportEmployeeAttendanceToPDF = async (data: EmployeeAttendanceExportData) => {
  try {
    console.log('Starting Employee Attendance PDF export with data:', data);
    
    const { employeeInfo, attendanceData, startDate, endDate, summaryStats } = data;
    
    if (!attendanceData || attendanceData.length === 0) {
      throw new Error('No attendance data to export');
    }

    // Create new PDF document in PORTRAIT orientation for individual employee
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    console.log('PDF created in portrait mode. Page size:', pageWidth, 'x', pageHeight);
    
    let yPosition = 20;

    // Add company header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Bizsmart Enterprises Ltd', pageWidth - 15, 20, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Attendance Report', pageWidth - 15, 30, { align: 'right' });

    // Add report title
    yPosition += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Attendance Detail', 15, yPosition);

    // Add employee information
    if (employeeInfo) {
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information', 15, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${employeeInfo.name} (${employeeInfo.employee})`, 15, yPosition);
      
      yPosition += 6;
      doc.text(`Department: ${employeeInfo.department || 'N/A'}`, 15, yPosition);
      
      yPosition += 6;
      doc.text(`Designation: ${employeeInfo.designation || 'N/A'}`, 15, yPosition);
    }

    // Add period information
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, 15, yPosition);

    // Add generation timestamp
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, yPosition);

    // Add summary statistics
    yPosition += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 15, yPosition);
    
    yPosition += 10;
    
    const summaryData = [
      ['Total Days', summaryStats.totalDays.toString()],
      ['Days Present', summaryStats.daysPresent.toString()],
      ['Days Absent', (summaryStats.totalDays - summaryStats.daysPresent).toString()],
      ['Total Hours', summaryStats.totalHours.toFixed(2) + 'h'],
      ['Average Hours/Day', summaryStats.averageHours.toFixed(2) + 'h'],
      ['Attendance Rate', summaryStats.attendanceRate.toFixed(1) + '%'],
      ['Current Streak', summaryStats.currentStreak.toString() + ' days']
    ];

    try {
      console.log('Creating summary table for employee attendance...');
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [23, 80, 59], textColor: 255, fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 15, right: 15 },
        tableWidth: 'wrap',
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'right' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
      console.log('Summary table created successfully');
    } catch (tableError) {
      console.warn('Error creating summary table:', tableError);
      yPosition += 50; // Skip summary table
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    // Add attendance details table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Details', 15, yPosition);
    yPosition += 10;

    // Prepare attendance table data
    const attendanceTableData = attendanceData.map(record => [
      formatDate(record.date),
      getAttendanceStatus(record),
      record.time_in || '-',
      record.time_out || '-',
      record.total_hours ? record.total_hours.toFixed(2) + 'h' : '0.00h'
    ]);

    try {
      console.log('Creating attendance details table...');
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Status', 'Time In', 'Time Out', 'Hours']],
        body: attendanceTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [23, 80, 59],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: { 
          fillColor: [248, 253, 249]
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 35 }, // Date
          1: { cellWidth: 30 }, // Status
          2: { cellWidth: 25, halign: 'center' }, // Time In
          3: { cellWidth: 25, halign: 'center' }, // Time Out
          4: { cellWidth: 25, halign: 'right' } // Hours
        }
      });

      console.log('Attendance details table created successfully');
    } catch (attendanceTableError) {
      console.error('Error creating attendance table:', attendanceTableError);
      throw new Error('Failed to create attendance details table: ' + attendanceTableError);
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
        '© 2025 Bizsmart Enterprises Ltd',
        15,
        pageHeight - 10
      );
    }

    // Generate filename
    const employeeName = employeeInfo?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Employee';
    const filename = `${employeeName}_attendance_${startDate}_to_${endDate}.pdf`;

    console.log('Saving Employee Attendance PDF with filename:', filename);

    // Save the PDF
    doc.save(filename);
    
    console.log('Employee Attendance PDF export completed successfully');

  } catch (error) {
    console.error('Employee Attendance PDF Export Error:', error);
    throw error;
  }
};

// Helper function to get attendance status label
const getAttendanceStatus = (record: any): string => {
  if (record.is_currently_clocked_in) {
    return 'Clocked In';
  } else if (record.time_out) {
    return 'Completed';
  } else if (record.time_in) {
    return 'No Check-out';
  } else if (record.total_hours > 0) {
    return 'Present';
  } else {
    return 'Absent';
  }
};

// Helper function to format dates
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