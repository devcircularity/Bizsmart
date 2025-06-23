'use client';

import React, { useMemo } from 'react';
import { Grid, List, User, Mail, Phone, Calendar, Building } from 'lucide-react';
import DataTable from '../common/DataTable';
import CardGrid from '../common/CardGrid';

export interface Employee {
  employee: string;
  employee_name: string;
  gender: string;
  date_of_birth: string;
  date_of_joining: string;
  status: string;
  company: string;
  department: string;
  designation: string;
  branch: string;
  cell_number: string;
  personal_email: string;
  company_email: string;
  default_shift: string;
  reports_to: string;
  custom_national_id: string;
  custom_kra_pin: string;
  custom_nhif_sha: string;
  custom_nssf_no: string;
  image?: string;
}

interface EmployeeViewProps {
  data: Employee[];
  loading: boolean;
  error: string;
}

export default function EmployeeView({ data: employees, loading, error }: EmployeeViewProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  // Get unique values for filters
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map(emp => emp.department).filter(Boolean))].sort();
    return depts.map(dept => ({ value: dept, label: dept }));
  }, [employees]);

  const statuses = useMemo(() => {
    const statusList = [...new Set(employees.map(emp => emp.status).filter(Boolean))].sort();
    return statusList.map(status => ({ value: status, label: status }));
  }, [employees]);

  const companies = useMemo(() => {
    const companyList = [...new Set(employees.map(emp => emp.company).filter(Boolean))].sort();
    return companyList.map(company => ({ value: company, label: company }));
  }, [employees]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]';
      case 'inactive':
        return 'bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]';
      case 'left':
        return 'bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]';
      default:
        return 'bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)]';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Define columns for the DataTable
  const columns = [
    {
      key: 'image',
      label: 'Photo',
      sortable: false,
      width: 'w-20',
      render: (value: string, row: Employee) => (
        value ? (
          <img
            src={value}
            alt={row.employee_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center">
            <span className="text-[color:var(--color-primary-foreground)] text-sm font-medium">
              {row.employee_name?.charAt(0) || '?'}
            </span>
          </div>
        )
      )
    },
    {
      key: 'employee',
      label: 'Employee ID',
      sortable: true,
      width: 'w-32',
      render: (value: string) => (
        <div className="font-medium text-[color:var(--color-foreground)]">{value}</div>
      )
    },
    {
      key: 'employee_name',
      label: 'Name',
      sortable: true,
      width: 'w-48',
      render: (value: string) => (
        <div className="truncate">
          <div className="font-medium truncate text-[color:var(--color-foreground)]">{value}</div>
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
      key: 'designation',
      label: 'Designation',
      sortable: true,
      width: 'w-40',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
          <div className="truncate">{value}</div>
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 'w-28',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'company_email',
      label: 'Email',
      sortable: true,
      width: 'w-48',
      render: (value: string) => (
        <div className="truncate text-[color:var(--color-foreground)]">{value || '-'}</div>
      )
    },
    {
      key: 'cell_number',
      label: 'Phone',
      sortable: true,
      width: 'w-32',
      render: (value: string) => (
        <div className="text-[color:var(--color-foreground)]">{value || '-'}</div>
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
      key: 'status',
      label: 'Status',
      options: statuses
    },
    {
      key: 'company',
      label: 'Company',
      options: companies
    }
  ];

  // Define searchable fields
  const searchableFields = ['employee_name', 'employee', 'department', 'designation', 'company_email'];

  // Card render function
  const renderCard = (employee: Employee, index: number) => {
    return (
      <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] p-6 hover:shadow-[var(--shadow-md)] transition-all duration-200">
        {/* Header with Photo and Basic Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center min-w-0 flex-1">
            {employee.image ? (
              <img
                src={employee.image}
                alt={employee.employee_name}
                className="h-16 w-16 rounded-full object-cover border-2 border-[color:var(--color-border)] mr-4 flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-[color:var(--color-primary-foreground)] text-xl font-medium">
                  {employee.employee_name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[color:var(--color-card-foreground)] truncate text-lg">
                {employee.employee_name}
              </h3>
              <p className="text-sm text-[color:var(--color-muted-foreground)] truncate">
                {employee.employee} • {employee.department}
              </p>
              <p className="text-sm text-[color:var(--color-muted-foreground)] truncate">
                {employee.designation}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Company and Branch */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
            <Building className="h-3 w-3 mr-1" />
            {employee.company}
          </span>
          {employee.branch && (
            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]">
              {employee.branch}
            </span>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          {employee.company_email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 text-[color:var(--color-muted-foreground)] mr-2 flex-shrink-0" />
              <span className="text-[color:var(--color-card-foreground)] truncate">{employee.company_email}</span>
            </div>
          )}
          {employee.cell_number && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 text-[color:var(--color-muted-foreground)] mr-2 flex-shrink-0" />
              <span className="text-[color:var(--color-card-foreground)]">{employee.cell_number}</span>
            </div>
          )}
          {employee.reports_to && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-[color:var(--color-muted-foreground)] mr-2 flex-shrink-0" />
              <span className="text-[color:var(--color-muted-foreground)] truncate">
                Reports to: {employee.reports_to}
              </span>
            </div>
          )}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[color:var(--color-border)]">
          <div>
            <div className="flex items-center text-xs text-[color:var(--color-muted-foreground)] mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              Joined
            </div>
            <div className="text-sm font-medium text-[color:var(--color-card-foreground)]">
              {formatDate(employee.date_of_joining)}
            </div>
          </div>
          <div>
            <div className="flex items-center text-xs text-[color:var(--color-muted-foreground)] mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              DOB
            </div>
            <div className="text-sm font-medium text-[color:var(--color-card-foreground)]">
              {formatDate(employee.date_of_birth)}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(employee.default_shift || employee.gender) && (
          <div className="mt-4 pt-4 border-t border-[color:var(--color-border)]">
            <div className="flex flex-wrap gap-2 text-xs">
              {employee.gender && (
                <span className="px-2 py-1 bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] rounded">
                  {employee.gender}
                </span>
              )}
              {employee.default_shift && (
                <span className="px-2 py-1 bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] rounded">
                  Shift: {employee.default_shift}
                </span>
              )}
            </div>
          </div>
        )}
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
    <div className="space-y-4 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200 min-h-screen px-6 pt-4 pb-2">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">Employee Directory</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-1">
            {viewMode === 'table' ? 'Tabular view of' : 'Card view of'} all employees ({employees.length} total)
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-[color:var(--color-card)] rounded-lg shadow-[var(--shadow)] border border-[color:var(--color-border)] overflow-hidden">
          <DataTable
            data={employees}
            columns={columns}
            searchableFields={searchableFields}
            filters={filters}
            loading={loading}
            error={error}
            defaultSortField="employee_name"
            defaultSortDirection="asc"
            defaultItemsPerPage={25}
            emptyMessage="No employee records found"
            className="min-w-[1100px]"
          />
        </div>
      ) : (
        <CardGrid
          data={employees}
          searchableFields={searchableFields}
          filters={filters}
          loading={loading}
          error={error}
          defaultItemsPerPage={24}
          emptyMessage="No employee records found"
          renderCard={renderCard}
          gridCols={{ sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 }}
          onCardClick={(employee) => {
            console.log('Employee card clicked:', employee);
            // You can add navigation or modal logic here
          }}
        />
      )}
    </div>
  );
}