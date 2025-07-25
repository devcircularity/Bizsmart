'use client';

import React, { useState, useEffect } from 'react';
import WorkHoursView from './WorkHoursView';

export interface WorkHour {
  employee: string;
  name: string;
  department: string;
  designation: string;
  date: string;
  time_in: string;
  time_out: string;
  total_hours: number;
  is_currently_clocked_in?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export default function WorkHoursReport() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setData([]);

      try {
        // Validate date range on frontend too
        if (new Date(startDate) > new Date(endDate)) {
          setError('Start date cannot be after end date');
          setLoading(false);
          return;
        }

        // Calculate days difference
        const daysDiff = Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 31) {
          setError('Date range cannot exceed 31 days');
          setLoading(false);
          return;
        }

        console.log('Fetching data for date range:', { startDate, endDate });

        // Use the updated API with date range support
        const url = startDate === endDate 
          ? `${API_URL}/api/method/hrms.api.employee_checkin.get_employee_work_hours?date_str=${startDate}`
          : `${API_URL}/api/method/hrms.api.employee_checkin.get_employee_work_hours?start_date=${startDate}&end_date=${endDate}`;

        const res = await fetch(url, {
          headers: {
            'Authorization': `token ${API_KEY}:${API_SECRET}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        console.log('Backend response:', json);

        if (json.message && Array.isArray(json.message)) {
          console.log('Work hours data:', json.message);
          setData(json.message);
        } else {
          console.warn('Unexpected response format:', json);
          setData([]);
        }

      } catch (err) {
        console.error('Error fetching work hours:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work hours data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate: string) => {
    setEndDate(newDate);
  };

  return (
    <WorkHoursView 
      data={data}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      loading={loading}
      error={error}
    />
  );
}