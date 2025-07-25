'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

// Types
interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface CardGridProps<T = any> {
  data: T[];
  searchableFields?: string[];
  filters?: Filter[];
  loading?: boolean;
  error?: string;
  defaultItemsPerPage?: number;
  emptyMessage?: string;
  additionalControls?: ReactNode | ((filteredData: T[]) => ReactNode);
  onCardClick?: (item: T, index: number) => void;
  onFiltersChange?: (filters: Record<string, string>) => void;
  className?: string;
  cardClassName?: string;
  renderCard: (item: T, index: number) => ReactNode;
  gridCols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

export default function CardGrid<T = any>({
  data,
  searchableFields = [],
  filters = [],
  loading = false,
  error = '',
  defaultItemsPerPage = 8,
  emptyMessage = 'No items found',
  additionalControls,
  onCardClick,
  onFiltersChange,
  className = '',
  cardClassName = '',
  renderCard,
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4, '2xl': 4 }
}: CardGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: filter.defaultValue || 'all' }), {})
  );

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
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
  }, [data, searchTerm, filterValues, searchableFields, filters]);

  // Notify parent component of filter changes
  React.useEffect(() => {
    if (onFiltersChange) {
      const activeFilters = { ...filterValues };
      if (searchTerm) {
        activeFilters.search = searchTerm;
      }
      onFiltersChange(activeFilters);
    }
  }, [filterValues, searchTerm, onFiltersChange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  // Generate grid classes with proper responsive behavior
  const getGridClasses = () => {
    const classes = ['grid', 'gap-4', 'w-full'];
    
    // Use safe grid column classes that work with standard Tailwind
    if (gridCols.sm === 1) classes.push('grid-cols-1');
    if (gridCols.md === 2) classes.push('md:grid-cols-2');
    if (gridCols.lg === 3) classes.push('lg:grid-cols-3');
    if (gridCols.xl === 4) classes.push('xl:grid-cols-4');
    if (gridCols['2xl'] === 4) classes.push('2xl:grid-cols-4');
    
    // Fallback to responsive defaults if custom values
    if (!classes.some(c => c.startsWith('grid-cols-'))) {
      classes.push('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    }
    
    return classes.join(' ');
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
        <div className="text-[color:var(--color-error)]">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-hidden ${className}`}>
      {/* Header with search and controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 px-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap w-full xl:w-auto">
          {/* Filters */}
          {filters.map(filter => (
            <div key={filter.key} className="flex items-center space-x-2 min-w-0">
              <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">
                {filter.label}:
              </label>
              <select
                value={filterValues[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="border border-[color:var(--color-border)] bg-[color:var(--color-input)] text-[color:var(--color-foreground)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-ring)] focus:border-transparent min-w-0 max-w-48 transition-colors duration-200"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-muted-foreground)] h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[color:var(--color-border)] bg-[color:var(--color-input)] text-[color:var(--color-foreground)] placeholder-[color:var(--color-muted-foreground)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-ring)] focus:border-transparent w-64 max-w-full transition-colors duration-200"
              />
            </div>
          )}
          
          {/* Items per page */}
          <div className="flex items-center space-x-2 min-w-0">
            <label className="text-sm text-[color:var(--color-foreground)] whitespace-nowrap">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-[color:var(--color-border)] bg-[color:var(--color-input)] text-[color:var(--color-foreground)] rounded px-2 py-1 text-sm min-w-0 transition-colors duration-200"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
          </div>

          {/* Additional controls - FIXED TO HANDLE FUNCTION */}
          {typeof additionalControls === 'function' 
            ? additionalControls(filteredData)
            : additionalControls
          }
        </div>
        
        <div className="text-sm text-[color:var(--color-muted-foreground)] whitespace-nowrap">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} items
        </div>
      </div>

      {/* Card Grid Container - Added overflow handling like DataTable */}
      <div className="bg-[color:var(--color-background)] rounded-lg shadow overflow-hidden w-full mb-6">
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div className="p-4">
              {currentData.length > 0 ? (
                <div className={getGridClasses()}>
                  {currentData.map((item, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-200 hover:shadow-lg hover:shadow-[color:var(--shadow-md)] min-w-0 w-full ${
                        onCardClick ? 'cursor-pointer hover:scale-[1.02]' : ''
                      } ${cardClassName}`}
                      onClick={onCardClick ? () => onCardClick(item, index) : undefined}
                    >
                      <div className="w-full h-full">
                        {renderCard(item, index)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Grid className="mx-auto h-12 w-12 text-[color:var(--color-muted-foreground)] mb-4" />
                    <p className="text-sm text-[color:var(--color-muted-foreground)]">{emptyMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === pageNum
                        ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]'
                        : 'text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]'
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
              className="flex items-center px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-background)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="text-sm text-[color:var(--color-muted-foreground)] whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}