'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => ReactNode;
}

interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  searchableFields?: string[];
  filters?: Filter[];
  loading?: boolean;
  error?: string;
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultItemsPerPage?: number;
  emptyMessage?: string;
  additionalControls?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

export default function DataTable<T = any>({
  data,
  columns,
  searchableFields = [],
  filters = [],
  loading = false,
  error = '',
  defaultSortField = '',
  defaultSortDirection = 'asc',
  defaultItemsPerPage = 25,
  emptyMessage = 'No data found',
  additionalControls,
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortField, setSortField] = useState(defaultSortField || columns[0]?.key || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: filter.defaultValue || 'all' }), {})
  );

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = searchableFields.length === 0 || searchableFields.some(field => {
        const value = item[field as keyof T];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Custom filters
      const matchesFilters = filters.every(filter => {
        const filterValue = filterValues[filter.key];
        if (filterValue === 'all') return true;
        return item[filter.key as keyof T] === filterValue;
      });

      return matchesSearch && matchesFilters;
    });

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField as keyof T] || '';
        const bVal = b[sortField as keyof T] || '';
        
        if (sortDirection === 'asc') {
          return aVal.toString().localeCompare(bVal.toString());
        } else {
          return bVal.toString().localeCompare(aVal.toString());
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, filterValues, searchableFields, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterKey]: value }));
  };

  // Reset to page 1 when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues]);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[color:var(--color-foreground)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-hidden ${className}`}>
      {/* Header with search and controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 px-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          {/* Filters */}
          {filters.map(filter => (
            <div key={filter.key} className="flex items-center space-x-2 min-w-0">
              <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">
                {filter.label}:
              </label>
              <select
                value={filterValues[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="border border-[color:var(--color-foreground)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent min-w-0"
              >
                <option value="all">All {filter.label}</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {/* Search */}
          {searchableFields.length > 0 && (
            <div className="relative min-w-0 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-foreground)] h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[color:var(--color-foreground)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent w-64 max-w-full"
              />
            </div>
          )}
          
          {/* Items per page */}
          <div className="flex items-center space-x-2 min-w-0">
            <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-[color:var(--color-foreground)] rounded px-2 py-1 text-sm min-w-0"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Additional controls */}
          {additionalControls}
        </div>
        
        <div className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[color:var(--color-background)] rounded-lg shadow overflow-hidden w-full">
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            <table className="w-full min-w-fit divide-y divide-[color:var(--color-foreground)]">
              <thead className="bg-[color:var(--color-background)] sticky top-0 z-10">
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={`${column.width || 'w-auto'} px-4 py-3 text-left text-xs font-medium text-[color:var(--color-foreground)] uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer hover:bg-[color:var(--color-background)]' : ''
                      }`}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="truncate">{column.label}</span>
                        {column.sortable && (
                          <span className="text-[color:var(--color-foreground)] flex-shrink-0">
                            {getSortIcon(column.key)}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[color:var(--color-background)] divide-y divide-[color:var(--color-foreground)]">
                {currentData.length > 0 ? (
                  currentData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-[color:var(--color-background)] ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    >
                      {columns.map(column => (
                        <td 
                          key={column.key} 
                          className={`${column.width || 'w-auto'} px-4 py-4 text-sm text-[color:var(--color-foreground)]`}
                        >
                          {column.render 
                            ? column.render(row[column.key as keyof T], row, index)
                            : <div className="truncate">{row[column.key as keyof T]?.toString() || ''}</div>
                          }
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-[color:var(--color-foreground)]">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-foreground)] rounded-md hover:bg-[color:var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md min-w-0 ${
                      currentPage === pageNum
                        ? 'bg-[color:var(--color-primary)] text-white'
                        : 'text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-foreground)] hover:bg-[color:var(--color-background)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-foreground)] rounded-md hover:bg-[color:var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}