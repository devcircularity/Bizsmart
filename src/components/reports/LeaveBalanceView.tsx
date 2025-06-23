'use client';

import React, { useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import DataTable from '../common/DataTable';
import CardGrid from '../common/CardGrid';

export interface LeaveBalance {
  employee_name: string;
  department: string;
  leave_type: string;
  total_allocated: number;
  used: number;
  remaining: number;
  on_leave: boolean;
}

interface LeaveBalanceViewProps {
  data: LeaveBalance[];
  loading: boolean;
  error: string;
}

export default function LeaveBalanceView({ data: leaveBalances, loading, error }: LeaveBalanceViewProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(leaveBalances.map(lb => lb.department))].sort();
    return depts.map(dept => ({ value: dept, label: dept }));
  }, [leaveBalances]);

  // Get remaining leave status color classes (theme-responsive)
  const getRemainingStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]';
    if (percentage >= 40) return 'bg-[color:var(--color-warning)] text-[color:var(--color-warning-foreground)]';
    return 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]';
  };

  // Get remaining leave status text color
  const getRemainingTextColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'text-[color:var(--color-success)]';
    if (percentage >= 40) return 'text-[color:var(--color-warning)]';
    return 'text-[color:var(--color-error)]';
  };

  // Get remaining leave status bg color for progress bar
  const getRemainingBgColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'bg-[color:var(--color-success)]';
    if (percentage >= 40) return 'bg-[color:var(--color-warning)]';
    return 'bg-[color:var(--color-error)]';
  };

  // Define columns for the DataTable
  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      sortable: true,
      width: 'w-48',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center mr-3">
            <span className="text-[color:var(--color-primary-foreground)] text-sm font-medium">
              {value?.charAt(0) || '?'}
            </span>
          </div>
          <div className="truncate">
            <div className="font-medium truncate text-[color:var(--color-foreground)]">{value}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      width: 'w-36',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)]">
          <div className="truncate">{value}</div>
        </span>
      )
    },
    {
      key: 'leave_type',
      label: 'Leave Type',
      sortable: true,
      width: 'w-32',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
          <div className="truncate">{value}</div>
        </span>
      )
    },
    {
      key: 'total_allocated',
      label: 'Allocated',
      sortable: true,
      width: 'w-24',
      render: (value: number) => (
        <div className="truncate font-medium text-[color:var(--color-foreground)]">{value}</div>
      )
    },
    {
      key: 'used',
      label: 'Used',
      sortable: true,
      width: 'w-20',
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[color:var(--color-warning)] text-[color:var(--color-warning-foreground)]">
          {value}
        </span>
      )
    },
    {
      key: 'remaining',
      label: 'Remaining',
      sortable: true,
      width: 'w-24',
      render: (value: number, row: LeaveBalance) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getRemainingStatus(value, row.total_allocated)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'on_leave',
      label: 'Status',
      sortable: true,
      width: 'w-28',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]' 
            : 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]'
        }`}>
          {value ? 'On Leave' : 'Available'}
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
    }
  ];

  // Define searchable fields
  const searchableFields = ['employee_name', 'department', 'leave_type'];

  // Card render function
  const renderCard = (item: LeaveBalance, index: number) => {
    return (
      <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] p-6 hover:shadow-[var(--shadow-md)] transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0 flex-1">
            <div className="h-12 w-12 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-[color:var(--color-primary-foreground)] text-lg font-medium">
                {item.employee_name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[color:var(--color-card-foreground)] truncate text-base">
                {item.employee_name}
              </h3>
              <p className="text-sm text-[color:var(--color-muted-foreground)] truncate">{item.department}</p>
            </div>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${
            item.on_leave 
              ? 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]' 
              : 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]'
          }`}>
            {item.on_leave ? 'On Leave' : 'Available'}
          </span>
        </div>

        {/* Leave Type */}
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
            {item.leave_type}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">{item.total_allocated}</div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Allocated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[color:var(--color-warning)]">{item.used}</div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Used</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRemainingTextColor(item.remaining, item.total_allocated)}`}>
              {item.remaining}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--color-muted-foreground)]">Leave Usage</span>
            <span className="font-medium text-[color:var(--color-card-foreground)]">
              {Math.round((item.remaining / item.total_allocated) * 100)}% left
            </span>
          </div>
          <div className="w-full bg-[color:var(--color-muted)] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getRemainingBgColor(item.remaining, item.total_allocated)}`}
              style={{ width: `${Math.max(5, (item.remaining / item.total_allocated) * 100)}%` }}
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

  return (
<div className="space-y-4 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200 min-h-screen px-6 pt-4 pb-2">      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">Leave Balances Report</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-1">
            {viewMode === 'table' ? 'Tabular view of' : 'Card view of'} employee leave balances
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-[color:var(--color-card)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] overflow-hidden">
          <DataTable
            data={leaveBalances}
            columns={columns}
            searchableFields={searchableFields}
            filters={filters}
            loading={loading}
            error={error}
            defaultSortField="employee_name"
            defaultSortDirection="asc"
            defaultItemsPerPage={25}
            emptyMessage="No leave balance records found"
            className="min-w-[1000px]"
          />
        </div>
      ) : (
        <CardGrid
          data={leaveBalances}
          searchableFields={searchableFields}
          filters={filters}
          loading={loading}
          error={error}
          defaultItemsPerPage={24}
          emptyMessage="No leave balance records found"
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