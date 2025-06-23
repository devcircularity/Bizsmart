'use client';

import React, { useMemo } from 'react';
import { Grid, List, Calendar, Clock } from 'lucide-react';
import DataTable from '../common/DataTable';
import CardGrid from '../common/CardGrid';

export interface WorkHour {
  employee: string;
  name: string;
  department: string;
  designation: string;
  time_in: string;
  time_out: string;
  total_hours: number;
  is_currently_clocked_in?: boolean;
}

interface WorkHoursViewProps {
  data: WorkHour[];
  date: string;
  onDateChange: (date: string) => void;
  loading: boolean;
  error: string;
}

export default function WorkHoursView({ 
  data: workHours, 
  date, 
  onDateChange, 
  loading, 
  error 
}: WorkHoursViewProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(workHours.map(wh => wh.department))].sort();
    return depts.map(dept => ({ value: dept, label: dept }));
  }, [workHours]);

  // Get unique designations for filter
  const designations = useMemo(() => {
    const desigs = [...new Set(workHours.map(wh => wh.designation))].sort();
    return desigs.map(desig => ({ value: desig, label: desig }));
  }, [workHours]);

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
      label: 'Time In',
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
      label: 'Time Out',
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
      label: 'Total Hours',
      sortable: true,
      width: 'w-32',
      render: (value: number) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHoursStatusColor(value)}`}>
          {formatHours(value)}h
        </span>
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
    }
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
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${item.time_in ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-muted-foreground)]'}`}>
              {formatTime(item.time_in)}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Time In</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${item.time_out ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-muted-foreground)]'}`}>
              {formatTime(item.time_out)}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Time Out</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${
              item.total_hours >= 8 ? 'text-[color:var(--color-success)]' : 
              item.total_hours >= 6 ? 'text-[color:var(--color-warning)]' : 
              'text-[color:var(--color-error)]'
            }`}>
              {formatHours(item.total_hours)}h
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Total Hours</div>
          </div>
        </div>

        {/* Progress Bar for Hours */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--color-muted-foreground)]">Work Progress</span>
            <span className="font-medium text-[color:var(--color-card-foreground)]">
              {Math.round((item.total_hours / 8) * 100)}% of 8h
            </span>
          </div>
          <div className="w-full bg-[color:var(--color-muted)] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                item.total_hours >= 8 ? 'bg-[color:var(--color-success)]' : 
                item.total_hours >= 6 ? 'bg-[color:var(--color-warning)]' : 
                'bg-[color:var(--color-error)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (item.total_hours / 8) * 100))}%` }}
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

  // Date Picker Component
  const DatePicker = () => (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-[color:var(--color-foreground)] flex-shrink-0" />
      <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
      />
    </div>
  );

  return (
    <div className="space-y-4 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200 min-h-screen px-6 pt-4 pb-2">
      {/* Header with Date Picker and View Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">Work Hours Report</h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {viewMode === 'table' ? 'Tabular view of' : 'Card view of'} employee work hours for {date}
            </p>
          </div>
          <DatePicker />
        </div>
        <ViewToggle />
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-[color:var(--color-card)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] overflow-hidden">
          <DataTable
            data={workHours}
            columns={columns}
            searchableFields={searchableFields}
            filters={filters}
            loading={loading}
            error={error}
            defaultSortField="name"
            defaultSortDirection="asc"
            defaultItemsPerPage={25}
            emptyMessage={`No work hours data found for ${date}`}
            className="min-w-[1200px]"
          />
        </div>
      ) : (
        <CardGrid
          data={workHours}
          searchableFields={searchableFields}
          filters={filters}
          loading={loading}
          error={error}
          defaultItemsPerPage={24}
          emptyMessage={`No work hours data found for ${date}`}
          renderCard={renderCard}
          gridCols={{ sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 }}
          onCardClick={(item) => {
            console.log('Card clicked:', item);
            // You can add navigation or modal logic here
          }}
        />
      )}
    </div>
  );
}