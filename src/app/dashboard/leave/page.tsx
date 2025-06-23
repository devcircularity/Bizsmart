'use client';

import React, { useEffect, useState } from 'react';
import LeaveBalanceView from '@/components/reports/LeaveBalanceView';

export interface LeaveBalance {
  employee_name: string;
  department: string;
  leave_type: string;
  total_allocated: number;
  used: number;
  remaining: number;
  on_leave: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export default function LeaveBalancesPage() {
  const [data, setData] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      setLoading(true);
      setError('');
      setData([]);

      try {
        const res = await fetch(
          `${API_URL}/api/method/hrms.api.leave_dashboard.get_leave_dashboard`,
          {
            headers: {
              Authorization: `token ${API_KEY}:${API_SECRET}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const balances = json.message?.leave_balances || [];

        const onLeaveList = json.message?.on_leave || [];
        const onLeaveSet = new Set(onLeaveList.map((r: any) => r.employee));
        const enrichedBalances = balances.map((r: any) => ({
          ...r,
          on_leave: onLeaveSet.has(r.employee),
        }));

        setData(enrichedBalances);
      } catch (err) {
        console.error('Error fetching leave balances:', err);
        setError('Failed to load leave balances.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalances();
  }, []);

  return (
    <LeaveBalanceView 
      data={data}
      loading={loading}
      error={error}
    />
  );
}