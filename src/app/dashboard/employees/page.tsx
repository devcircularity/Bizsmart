'use client';

import React, { useState, useEffect } from 'react';
import EmployeeView from '@/components/reports/EmployeeView';

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

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_API_SECRET;

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch(
          `${apiUrl}/api/method/hrms.api.employee.get_all_employees`,
          {
            headers: {
              'Authorization': `token ${apiKey}:${apiSecret}`,
            },
          }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const json = await res.json();
        console.log('Employee data response:', json);
        
        if (json.message) {
          setEmployees(json.message);
        } else {
          setError('No employee data received');
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl && apiKey && apiSecret) {
      fetchEmployees();
    } else {
      setError('API configuration missing');
    }
  }, [apiUrl, apiKey, apiSecret]);

  return (
    <EmployeeView 
      data={employees}
      loading={loading}
      error={error}
    />
  );
}