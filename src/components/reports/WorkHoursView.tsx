'use client';

import React, { useMemo, useState } from 'react';
import { Grid, List, Calendar, Clock, CalendarDays, Download } from 'lucide-react';
import DataTable from '../common/DataTable';
import CardGrid from '../common/CardGrid';
import { exportWorkHoursToPDF } from '../../utils/pdfExport';

export interface WorkHour {
  employee: string;
  name: string;
  department: string;
  designation: string;
  time_in: string;
  time_out: string;
  total_hours: number;
  date?: string; // Date field for range filtering
  is_currently_clocked_in?: boolean;
}

interface WorkHoursViewProps {
  data: WorkHour[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  loading: boolean;
  error: string;
}

export default function WorkHoursView({ 
  data: workHours, 
  startDate, 
  endDate,
  onStartDateChange, 
  onEndDateChange,
  loading, 
  error 
}: WorkHoursViewProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');
  const [isExporting, setIsExporting] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});

  // Check if we're showing a date range
  const isDateRange = startDate !== endDate;

  // Aggregate data by employee when showing date range
  const processedData = useMemo(() => {
    if (!isDateRange) {
      return workHours; // Return as-is for single date
    }

    // Group by employee and aggregate totals for date range
    const employeeMap = new Map();
    
    workHours.forEach(record => {
      const key = record.employee;
      
      if (employeeMap.has(key)) {
        const existing = employeeMap.get(key);
        existing.total_hours += record.total_hours;
        existing.days_worked += 1;
        
        // Track earliest time_in and latest time_out across all days
        if (record.time_in && (!existing.earliest_time_in || record.time_in < existing.earliest_time_in)) {
          existing.earliest_time_in = record.time_in;
        }
        if (record.time_out && (!existing.latest_time_out || record.time_out > existing.latest_time_out)) {
          existing.latest_time_out = record.time_out;
        }
        
        // Update clocked in status (if clocked in on any day)
        if (record.is_currently_clocked_in) {
          existing.is_currently_clocked_in = true;
        }
      } else {
        employeeMap.set(key, {
          ...record,
          days_worked: 1,
          earliest_time_in: record.time_in,
          latest_time_out: record.time_out,
          average_hours_per_day: record.total_hours
        });
      }
    });

    // Convert back to array and calculate averages
    return Array.from(employeeMap.values()).map(record => ({
      ...record,
      average_hours_per_day: record.total_hours / record.days_worked,
      time_in: record.earliest_time_in,
      time_out: record.latest_time_out
    }));
  }, [workHours, isDateRange]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(processedData.map(wh => wh.department))].sort();
    return depts.map(dept => ({ value: dept, label: dept }));
  }, [processedData]);

  // Get unique designations for filter
  const designations = useMemo(() => {
    const desigs = [...new Set(processedData.map(wh => wh.designation))].sort();
    return desigs.map(desig => ({ value: desig, label: desig }));
  }, [processedData]);

  // Get unique dates for filter (when showing date range)
  const dates = useMemo(() => {
    if (!isDateRange) return [];
    const dateList = [...new Set(workHours.map(wh => wh.date).filter(Boolean))].sort();
    return dateList.map(date => ({ value: date!, label: new Date(date!).toLocaleDateString() }));
  }, [workHours, isDateRange]);

  // Calculate summary statistics based on processed data
  const summaryStats = useMemo(() => {
    const totalEmployees = new Set(processedData.map(wh => wh.employee)).size;
    const totalHours = processedData.reduce((sum, wh) => sum + wh.total_hours, 0);
    const currentlyClocked = processedData.filter(wh => wh.is_currently_clocked_in).length;
    const avgHoursPerEmployee = totalEmployees > 0 ? totalHours / totalEmployees : 0;

    return {
      totalEmployees,
      totalHours,
      currentlyClocked,
      avgHoursPerEmployee
    };
  }, [processedData]);

  // Fixed time formatting - expects HH:MM format from backend
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    return timeStr;
  };

  // Format hours display
  const formatHours = (hours: number) => {
    if (!hours) return '0.00';
    return hours.toFixed(2);
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Get status indicator
  const getStatusIndicator = (wh: WorkHour) => {
    if (wh.is_currently_clocked_in) {
      return (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-[color:var(--color-success)]" />
          <span className="text-xs text-[color:var(--color-success)] font-medium">Clocked In</span>
        </div>
      );
    } else if (wh.time_out) {
      return (
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-[color:var(--color-muted-foreground)] rounded-full"></div>
          <span className="text-xs text-[color:var(--color-muted-foreground)]">Clocked Out</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-[color:var(--color-error)] rounded-full"></div>
          <span className="text-xs text-[color:var(--color-error)]">No Check-in</span>
        </div>
      );
    }
  };

  // Get hours status color
  const getHoursStatusColor = (hours: number) => {
    if (hours >= 8) return 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]';
    if (hours >= 6) return 'bg-[color:var(--color-warning)] text-[color:var(--color-warning-foreground)]';
    return 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]';
  };

  // Handle PDF export
  const handleExportPDF = async (dataToExport: WorkHour[]) => {
    console.log('Export button clicked, data to export:', dataToExport);
    
    setIsExporting(true);
    try {
      if (!dataToExport || dataToExport.length === 0) {
        throw new Error('No data available to export');
      }

      console.log('Calling exportWorkHoursToPDF...');
      
      await exportWorkHoursToPDF({
        data: dataToExport,
        startDate,
        endDate,
        isDateRange,
        filters: currentFilters,
        summaryStats: {
          totalEmployees: new Set(dataToExport.map(wh => wh.employee)).size,
          totalHours: dataToExport.reduce((sum, wh) => sum + wh.total_hours, 0),
          currentlyClocked: dataToExport.filter(wh => wh.is_currently_clocked_in).length,
          avgHoursPerEmployee: dataToExport.length > 0 
            ? dataToExport.reduce((sum, wh) => sum + wh.total_hours, 0) / new Set(dataToExport.map(wh => wh.employee)).size
            : 0
        }
      });
      
      console.log('PDF export completed successfully');
      
    } catch (error) {
      console.error('Export failed with error:', error);
      
      let errorMessage = 'Failed to export PDF. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('No data')) {
          errorMessage = 'No data available to export.';
        } else if (error.message.includes('jsPDF')) {
          errorMessage = 'PDF library error. Please refresh the page and try again.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Button Component that receives filtered data directly
  const ExportButton = ({ currentFilteredData }: { currentFilteredData: WorkHour[] }) => {
    const dataToExport = currentFilteredData || processedData;
    
    return (
      <button
        onClick={() => handleExportPDF(dataToExport)}
        disabled={isExporting || dataToExport.length === 0}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isExporting || dataToExport.length === 0
            ? 'bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)] cursor-not-allowed'
            : 'bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)] border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90'
        }`}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : `Export PDF (${dataToExport.length} records)`}
      </button>
    );
  };

  // Define columns for the DataTable
  const columns = [
    {
      key: 'employee',
      label: 'Employee ID',
      sortable: true,
      width: 'w-32',
      render: (value: string) => (
        <div className="font-medium text-[color:var(--color-foreground)] truncate">{value}</div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: 'w-48',
      render: (value: string) => (
        <div className="flex items-center min-w-0">
          <div className="h-8 w-8 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-[color:var(--color-primary-foreground)] text-xs font-medium">
              {value?.charAt(0) || '?'}
            </span>
          </div>
          <span className="truncate text-[color:var(--color-foreground)]">{value}</span>
        </div>
      )
    },
    // Add days worked column when showing date range
    ...(isDateRange ? [{
      key: 'days_worked',
      label: 'Days Worked',
      sortable: true,
      width: 'w-28',
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)]">
          {value} days
        </span>
      )
    }] : []),
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      width: 'w-40',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)]">
          <div className="truncate">{value}</div>
        </span>
      )
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      width: 'w-44',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
          <div className="truncate">{value}</div>
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      width: 'w-32',
      render: (value: any, row: WorkHour) => getStatusIndicator(row)
    },
    {
      key: 'time_in',
      label: isDateRange ? 'First In' : 'Time In',
      sortable: true,
      width: 'w-28',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
          value ? 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]' : 'bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]'
        }`}>
          {formatTime(value)}
        </span>
      )
    },
    {
      key: 'time_out',
      label: isDateRange ? 'Last Out' : 'Time Out',
      sortable: true,
      width: 'w-28',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
          value ? 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]' : 'bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]'
        }`}>
          {formatTime(value)}
        </span>
      )
    },
    {
      key: 'total_hours',
      label: isDateRange ? 'Total Hours' : 'Total Hours',
      sortable: true,
      width: 'w-32',
      render: (value: number, row: any) => (
        <div className="flex flex-col">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHoursStatusColor(value)}`}>
            {formatHours(value)}h
          </span>
          {isDateRange && row.average_hours_per_day && (
            <span className="text-xs text-[color:var(--color-muted-foreground)] mt-1">
              Avg: {formatHours(row.average_hours_per_day)}h/day
            </span>
          )}
        </div>
      )
    }
  ];

  // Define filters
  const filters = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'designation',
      label: 'Designation',
      options: designations
    },
    // Add date filter only when showing raw data (single date)
    ...(!isDateRange && dates.length > 1 ? [{
      key: 'date',
      label: 'Date',
      options: dates
    }] : [])
  ];

  // Define searchable fields
  const searchableFields = ['name', 'employee', 'department', 'designation'];

  // Card render function
  const renderCard = (item: WorkHour, index: number) => {
    return (
      <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] p-6 hover:shadow-[var(--shadow-md)] transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0 flex-1">
            <div className="h-12 w-12 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-[color:var(--color-primary-foreground)] text-lg font-medium">
                {item.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[color:var(--color-card-foreground)] truncate text-base">
                {item.name}
              </h3>
              <p className="text-sm text-[color:var(--color-muted-foreground)] truncate">
                {item.employee} • {item.department}
              </p>
              {isDateRange && (item as any).days_worked && (
                <p className="text-xs text-[color:var(--color-muted-foreground)] truncate">
                  {(item as any).days_worked} days worked
                </p>
              )}
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {getStatusIndicator(item)}
          </div>
        </div>

        {/* Designation */}
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
            {item.designation}
          </span>
        </div>

        {/* Time Stats Grid */}
        <div className={`grid gap-4 mb-4 ${isDateRange ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <div className="text-center">
            <div className={`text-lg font-bold ${item.time_in ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-muted-foreground)]'}`}>
              {formatTime(item.time_in)}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">
              {isDateRange ? 'First In' : 'Time In'}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${item.time_out ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-muted-foreground)]'}`}>
              {formatTime(item.time_out)}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">
              {isDateRange ? 'Last Out' : 'Time Out'}
            </div>
          </div>
          {isDateRange && (
            <div className="text-center">
              <div className="text-lg font-bold text-[color:var(--color-info)]">
                {(item as any).days_worked || 0}
              </div>
              <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Days Worked</div>
            </div>
          )}
          <div className="text-center">
            <div className={`text-lg font-bold ${
              item.total_hours >= 8 ? 'text-[color:var(--color-success)]' : 
              item.total_hours >= 6 ? 'text-[color:var(--color-warning)]' : 
              'text-[color:var(--color-error)]'
            }`}>
              {formatHours(item.total_hours)}h
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">
              {isDateRange ? 'Total Hours' : 'Total Hours'}
            </div>
          </div>
        </div>

        {/* Progress Bar for Hours */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--color-muted-foreground)]">Work Progress</span>
            <span className="font-medium text-[color:var(--color-card-foreground)]">
              {isDateRange 
                ? `${formatHours(item.total_hours)}h total (${formatHours((item as any).average_hours_per_day || 0)}h/day avg)`
                : `${Math.round((item.total_hours / 8) * 100)}% of 8h`
              }
            </span>
          </div>
          <div className="w-full bg-[color:var(--color-muted)] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                item.total_hours >= (isDateRange ? (item as any).days_worked * 8 : 8) ? 'bg-[color:var(--color-success)]' : 
                item.total_hours >= (isDateRange ? (item as any).days_worked * 6 : 6) ? 'bg-[color:var(--color-warning)]' : 
                'bg-[color:var(--color-error)]'
              }`}
              style={{ 
                width: `${Math.min(100, Math.max(5, isDateRange 
                  ? (item.total_hours / ((item as any).days_worked * 8)) * 100
                  : (item.total_hours / 8) * 100
                ))}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // View Toggle Component
  const ViewToggle = () => (
    <div className="flex rounded-lg border border-[color:var(--color-border)] overflow-hidden bg-[color:var(--color-card)]">
      <button
        onClick={() => setViewMode('table')}
        className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
          viewMode === 'table' 
            ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]' 
            : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]'
        }`}
      >
        <List className="h-4 w-4 mr-2" />
        Table View
      </button>
      <button
        onClick={() => setViewMode('cards')}
        className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
          viewMode === 'cards' 
            ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]' 
            : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]'
        }`}
      >
        <Grid className="h-4 w-4 mr-2" />
        Card View
      </button>
    </div>
  );

  // Date Range Picker Component
  const DateRangePicker = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-2">
        <CalendarDays className="h-4 w-4 text-[color:var(--color-foreground)] flex-shrink-0" />
        <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-[color:var(--color-foreground)] flex-shrink-0" />
        <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
        />
      </div>
    </div>
  );

  // Summary Stats Component
  const SummaryStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
        <div className="text-2xl font-bold text-[color:var(--color-primary)]">{summaryStats.totalEmployees}</div>
        <div className="text-sm text-[color:var(--color-muted-foreground)]">Total Employees</div>
      </div>
      <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
        <div className="text-2xl font-bold text-[color:var(--color-success)]">{formatHours(summaryStats.totalHours)}</div>
        <div className="text-sm text-[color:var(--color-muted-foreground)]">Total Hours</div>
      </div>
      <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
        <div className="text-2xl font-bold text-[color:var(--color-warning)]">{summaryStats.currentlyClocked}</div>
        <div className="text-sm text-[color:var(--color-muted-foreground)]">Currently Clocked In</div>
      </div>
      <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
        <div className="text-2xl font-bold text-[color:var(--color-info)]">{formatHours(summaryStats.avgHoursPerEmployee)}</div>
        <div className="text-sm text-[color:var(--color-muted-foreground)]">Avg Hours/Employee</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200 pb-6">
      {/* Header with Date Range Picker and View Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">Work Hours Report</h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {viewMode === 'table' ? 'Tabular view of' : 'Card view of'} employee work hours 
              {isDateRange ? ` from ${startDate} to ${endDate}` : ` for ${startDate}`}
            </p>
          </div>
          <DateRangePicker />
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle />
        </div>
      </div>

      {/* Summary Statistics */}
      {processedData.length > 0 && !loading && <SummaryStats />}

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-[color:var(--color-card)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] overflow-hidden">
          <DataTable
            data={processedData}
            columns={columns}
            searchableFields={searchableFields}
            filters={filters}
            loading={loading}
            error={error}
            defaultSortField="name"
            defaultSortDirection="asc"
            defaultItemsPerPage={25}
            emptyMessage={`No work hours data found for ${isDateRange ? 'the selected date range' : startDate}`}
            className="min-w-[1200px]"
            additionalControls={(filteredData) => (
              <ExportButton currentFilteredData={filteredData} />
            )}
            onFiltersChange={setCurrentFilters}
          />
        </div>
      ) : (
        <CardGrid
          data={processedData}
          searchableFields={searchableFields}
          filters={filters}
          loading={loading}
          error={error}
          defaultItemsPerPage={24}
          emptyMessage={`No work hours data found for ${isDateRange ? 'the selected date range' : startDate}`}
          renderCard={renderCard}
          gridCols={{ sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 }}
          additionalControls={(filteredData) => (
            <ExportButton currentFilteredData={filteredData} />
          )}
          onCardClick={(item) => {
            console.log('Card clicked:', item);
            // You can add navigation or modal logic here
          }}
          onFiltersChange={setCurrentFilters}
        />
      )}
    </div>
  );
}