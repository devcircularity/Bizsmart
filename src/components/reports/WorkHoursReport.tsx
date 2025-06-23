'use client';

import React, { useState, useEffect } from 'react';
import WorkHoursView from './WorkHoursView';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export default function WorkHoursReport() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setData([]);

      try {
        const res = await fetch(
          `${API_URL}/api/method/hrms.api.employee_checkin.get_employee_work_hours?date_str=${date}`,
          {
            headers: {
              'Authorization': `token ${API_KEY}:${API_SECRET}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        console.log('Backend response:', json);

        // Process the data to handle cases where time_out equals time_in
        const processedData = (json.message || []).map((item: any) => {
          const name = item.employee_name || item.name || '?';

          if (item.time_out && item.time_in && item.time_out === item.time_in) {
            return {
              ...item,
              name,
              time_out: '',
              is_currently_clocked_in: true,
              total_hours: 0
            };
          }

          if (!item.time_out || item.time_out === '') {
            return {
              ...item,
              name,
              is_currently_clocked_in: true,
              total_hours: 0
            };
          }

          return {
            ...item,
            name,
            is_currently_clocked_in: false
          };
        });
        
        console.log('Processed work hours data:', processedData);
        setData(processedData);
      } catch (err) {
        console.error('Error fetching work hours:', err);
        setError('Failed to load work hours data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  return (
    <WorkHoursView 
      data={data}
      date={date}
      onDateChange={handleDateChange}
      loading={loading}
      error={error}
    />
  );
}