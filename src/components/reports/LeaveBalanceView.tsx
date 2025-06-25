'use client';

import React, { useMemo } from 'react';
import { Grid, List, Filter } from 'lucide-react';
import DataTable from '../common/DataTable';
import CardGrid from '../common/CardGrid';

export interface LeaveBalance {
  employee_name: string;
  department: string;
  leave_type: string;
  total_allocated: number;
  used: number;
  remaining?: number; // Make this optional since we'll calculate it
  on_leave: boolean;
}

interface LeaveBalanceViewProps {
  data: LeaveBalance[];
  loading: boolean;
  error: string;
}

export default function LeaveBalanceView({ data: leaveBalances, loading, error }: LeaveBalanceViewProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  // Calculate remaining leaves on the frontend, showing ALL employees
  const processedLeaveBalances = useMemo(() => {
    return leaveBalances
      // Removed the filter that was only showing employees on leave
      .map(balance => ({
        ...balance,
        remaining: Math.max(0, balance.total_allocated - balance.used),
        remaining_range: getRemainingRange(Math.max(0, balance.total_allocated - balance.used), balance.total_allocated),
        utilization_range: getUtilizationRange(balance.used, balance.total_allocated),
        // Add string version for filtering
        on_leave_string: balance.on_leave.toString() // Convert boolean to string for filtering
      }));
  }, [leaveBalances]);

  // Helper function to categorize remaining leave
  function getRemainingRange(remaining: number, total: number) {
    if (total === 0) return 'no-allocation';
    const percentage = (remaining / total) * 100;
    if (percentage >= 80) return 'high'; // 80%+ remaining
    if (percentage >= 50) return 'medium'; // 50-79% remaining
    if (percentage >= 20) return 'low'; // 20-49% remaining
    return 'critical'; // < 20% remaining
  }

  // Helper function to categorize leave utilization
  function getUtilizationRange(used: number, total: number) {
    if (total === 0) return 'no-allocation';
    const percentage = (used / total) * 100;
    if (percentage >= 80) return 'high-usage'; // 80%+ used
    if (percentage >= 50) return 'medium-usage'; // 50-79% used
    if (percentage >= 20) return 'low-usage'; // 20-49% used
    return 'minimal-usage'; // < 20% used
  }

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(processedLeaveBalances.map(lb => lb.department))].filter(Boolean).sort();
    return depts.map(dept => ({ value: dept, label: dept }));
  }, [processedLeaveBalances]);

  // Get unique leave types for filter
  const leaveTypes = useMemo(() => {
    const types = [...new Set(processedLeaveBalances.map(lb => lb.leave_type))].filter(Boolean).sort();
    return types.map(type => ({ value: type, label: type }));
  }, [processedLeaveBalances]);

  // Get remaining leave status color classes (theme-responsive)
  const getRemainingStatus = (remaining: number, total: number) => {
    if (total === 0) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  // Get remaining leave status text color
  const getRemainingTextColor = (remaining: number, total: number) => {
    if (total === 0) return 'text-gray-500 dark:text-gray-400';
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get remaining leave status bg color for progress bar
  const getRemainingBgColor = (remaining: number, total: number) => {
    if (total === 0) return 'bg-gray-400';
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
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
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
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
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
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
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
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
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {value ? 'On Leave' : 'Available'}
        </span>
      )
    }
  ];

  // Define comprehensive filters with fixed boolean handling
  const filters = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'leave_type',
      label: 'Leave Type',
      options: leaveTypes
    },
    {
      key: 'on_leave_string', // Use the string field for filtering
      label: 'Current Status',
      options: [
        { value: 'true', label: 'On Leave' },
        { value: 'false', label: 'Available' }
      ]
    },
    {
      key: 'remaining_range',
      label: 'Remaining Leave',
      options: [
        { value: 'high', label: 'High (80%+)' },
        { value: 'medium', label: 'Medium (50-79%)' },
        { value: 'low', label: 'Low (20-49%)' },
        { value: 'critical', label: 'Critical (<20%)' },
        { value: 'no-allocation', label: 'No Allocation' }
      ]
    },
    {
      key: 'utilization_range',
      label: 'Leave Usage',
      options: [
        { value: 'high-usage', label: 'High Usage (80%+)' },
        { value: 'medium-usage', label: 'Medium Usage (50-79%)' },
        { value: 'low-usage', label: 'Low Usage (20-49%)' },
        { value: 'minimal-usage', label: 'Minimal Usage (<20%)' },
        { value: 'no-allocation', label: 'No Allocation' }
      ]
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
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            {item.on_leave ? 'On Leave' : 'Available'}
          </span>
        </div>

        {/* Leave Type */}
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
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
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{item.used}</div>
            <div className="text-xs text-[color:var(--color-muted-foreground)] uppercase tracking-wide">Used</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRemainingTextColor(item.remaining!, item.total_allocated)}`}>
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
              {item.total_allocated > 0 ? Math.round((item.remaining! / item.total_allocated) * 100) : 0}% left
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getRemainingBgColor(item.remaining!, item.total_allocated)}`}
              style={{ 
                width: `${item.total_allocated > 0 ? Math.max(5, (item.remaining! / item.total_allocated) * 100) : 0}%` 
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

  return (
    <div className="space-y-4 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200 px-6 pt-4 pb-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">Leave Balances Report</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-1">
            {viewMode === 'table' ? 'Tabular view of' : 'Card view of'} employee leave balances with advanced filtering
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-[color:var(--color-card)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] overflow-hidden">
          <DataTable
            data={processedLeaveBalances}
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
          data={processedLeaveBalances}
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