'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Building,
  Award,
  PieChart,
  BarChart3,
  Heart,
  Coffee,
  Target,
  Activity,
  Zap,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface Employee {
  employee: string;
  employee_name: string;
  department: string;
  designation: string;
  status: string;
  date_of_joining: string;
  company: string;
  branch: string;
}

interface LeaveBalance {
  employee_name: string;
  department: string;
  leave_type: string;
  total_allocated: number;
  used: number;
  remaining: number;
  on_leave: boolean;
}

interface WorkHour {
  employee: string;
  name: string;
  department: string;
  designation: string;
  time_in: string;
  time_out: string;
  total_hours: number;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
  <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow)] p-6 border border-[color:var(--color-border)] hover:shadow-[var(--shadow-md)] transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-[color:var(--color-muted-foreground)] mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-[color:var(--color-card-foreground)]">{value}</p>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}`}>
              {trend > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">{subtitle}</p>
      </div>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, color, label }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-[color:var(--color-card-foreground)]">{label}</span>
      <span className="text-sm text-[color:var(--color-muted-foreground)]">{value}/{max}</span>
    </div>
    <div className="h-3 bg-[color:var(--color-muted)] rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
    <div className="text-xs text-[color:var(--color-muted-foreground)]">
      {((value / max) * 100).toFixed(1)}% utilization
    </div>
  </div>
);

export default function FriendlyHRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-url.com';
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'your-api-key';
  const apiSecret = process.env.NEXT_PUBLIC_API_SECRET || 'your-api-secret';

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesRes = await fetch(
          `${apiUrl}/api/method/hrms.api.employee.get_all_employees`,
          {
            headers: {
              'Authorization': `token ${apiKey}:${apiSecret}`,
            },
          }
        );
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData.message || []);
        }

        // Fetch leave balances
        const leaveRes = await fetch(
          `${apiUrl}/api/method/hrms.api.leave_dashboard.get_leave_dashboard`,
          {
            headers: {
              Authorization: `token ${apiKey}:${apiSecret}`,
            },
          }
        );
        if (leaveRes.ok) {
          const leaveData = await leaveRes.json();
          const balances = leaveData.message?.leave_balances || [];
          const onLeaveList = leaveData.message?.on_leave || [];
          const onLeaveSet = new Set(onLeaveList.map((r: any) => r.employee));
          const enrichedBalances = balances.map((r: any) => ({
            ...r,
            on_leave: onLeaveSet.has(r.employee),
          }));
          setLeaveBalances(enrichedBalances);
        }

        // Fetch work hours for selected date
        const workHoursRes = await fetch(
          `${apiUrl}/api/method/hrms.api.employee_checkin.get_employee_work_hours?date_str=${selectedDate}`,
          {
            headers: {
              'Authorization': `token ${apiKey}:${apiSecret}`,
            },
          }
        );
        if (workHoursRes.ok) {
          const workHoursData = await workHoursRes.json();
          setWorkHours(workHoursData.message || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedDate, apiUrl, apiKey, apiSecret]);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const uniqueOnLeave = new Set(leaveBalances.filter(lb => lb.on_leave).map(lb => lb.employee_name)).size;
    
    // Department analysis
    const departmentCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Work hours analysis
    const totalHoursToday = workHours.reduce((sum, wh) => sum + (wh.total_hours || 0), 0);
    const avgHoursToday = workHours.length > 0 ? totalHoursToday / workHours.length : 0;
    const presentToday = workHours.filter(wh => wh.time_in && wh.time_in !== '').length;
    const fullDayWorkers = workHours.filter(wh => wh.total_hours >= 8).length;
    const partTimeWorkers = workHours.filter(wh => wh.total_hours > 0 && wh.total_hours < 8).length;

    // Leave analysis
    const totalLeaveAllocated = leaveBalances.reduce((sum, lb) => sum + lb.total_allocated, 0);
    const totalLeaveUsed = leaveBalances.reduce((sum, lb) => sum + lb.used, 0);
    const leaveUtilization = totalLeaveAllocated > 0 ? (totalLeaveUsed / totalLeaveAllocated) * 100 : 0;

    // Productivity insights
    const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;
    const fullDayRate = presentToday > 0 ? (fullDayWorkers / presentToday) * 100 : 0;

    return {
      totalEmployees,
      activeEmployees,
      uniqueOnLeave,
      departmentCounts,
      totalHoursToday,
      avgHoursToday,
      presentToday,
      fullDayWorkers,
      partTimeWorkers,
      leaveUtilization,
      attendanceRate,
      fullDayRate,
      totalLeaveAllocated,
      totalLeaveUsed
    };
  }, [employees, leaveBalances, workHours]);

  // Enhanced department analysis
  const departmentAnalysis = useMemo(() => {
    return Object.entries(metrics.departmentCounts)
      .map(([dept, count]) => ({
        department: dept,
        count,
        percentage: ((count / metrics.totalEmployees) * 100).toFixed(1),
        onLeave: leaveBalances.filter(lb => lb.department === dept && lb.on_leave).length,
        present: workHours.filter(wh => wh.department === dept && wh.time_in).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [metrics, leaveBalances, workHours]);

  // Leave types breakdown with enhanced insights
  const leaveTypesBreakdown = useMemo(() => {
    const breakdown = leaveBalances.reduce((acc, lb) => {
      if (!acc[lb.leave_type]) {
        acc[lb.leave_type] = { allocated: 0, used: 0, remaining: 0, employees: new Set() };
      }
      acc[lb.leave_type].allocated += lb.total_allocated;
      acc[lb.leave_type].used += lb.used;
      acc[lb.leave_type].remaining += lb.remaining;
      acc[lb.leave_type].employees.add(lb.employee_name);
      return acc;
    }, {} as Record<string, {allocated: number, used: number, remaining: number, employees: Set<string>}>);

    return Object.entries(breakdown)
      .map(([type, data]) => ({
        type,
        allocated: data.allocated,
        used: data.used,
        remaining: data.remaining,
        employeeCount: data.employees.size,
        utilization: data.allocated > 0 ? (data.used / data.allocated) * 100 : 0
      }))
      .sort((a, b) => b.allocated - a.allocated);
  }, [leaveBalances]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤️";
    return "Good evening! 🌙";
  };

  const getMotivationalInsight = () => {
    if (metrics.attendanceRate > 90) return "Excellent attendance today! Your team is crushing it! 🚀";
    if (metrics.attendanceRate > 80) return "Great attendance rate! Keep up the good work! 💪";
    if (metrics.attendanceRate > 70) return "Good attendance today! There's room for improvement! 📈";
    return "Let's work on boosting attendance! Every person matters! 🎯";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[color:var(--color-primary)] mx-auto mb-4"></div>
          <div className="text-lg font-medium text-[color:var(--color-foreground)]">Loading your HR insights...</div>
          <div className="text-sm text-[color:var(--color-muted-foreground)] mt-2">Preparing the best experience for you</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)] transition-colors duration-200">
      <div className="p-6 space-y-8 lg:max-h-screen lg:overflow-y-auto">


        {/* Date Selector */}
        <div className="flex items-center justify-center space-x-3 mt-6">
          <Calendar className="h-5 w-5 text-[color:var(--color-muted-foreground)]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] text-[color:var(--color-card-foreground)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] shadow-sm transition-colors duration-200"
          />
          <span className="text-sm text-[color:var(--color-muted-foreground)]">Data for selected date</span>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Team Members"
            value={metrics.totalEmployees}
            subtitle={`${metrics.activeEmployees} actively working`}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          
          <MetricCard
            title="Present Today"
            value={metrics.presentToday}
            subtitle={`${metrics.attendanceRate.toFixed(1)}% attendance rate`}
            icon={UserCheck}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={metrics.attendanceRate > 85 ? 5 : metrics.attendanceRate > 70 ? 0 : -3}
          />
          
          <MetricCard
            title="On Leave"
            value={metrics.uniqueOnLeave}
            subtitle={`${metrics.leaveUtilization.toFixed(1)}% leave utilization`}
            icon={Coffee}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          
          <MetricCard
            title="Avg Work Hours"
            value={metrics.avgHoursToday.toFixed(1)}
            subtitle={`${metrics.fullDayWorkers} full-day heroes`}
            icon={Clock}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Insights */}
          <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow)] p-6 border border-[color:var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[color:var(--color-card-foreground)]">Department Insights</h3>
              <Building className="h-6 w-6 text-[color:var(--color-primary)]" />
            </div>
            <div className="space-y-4">
              {departmentAnalysis.map((dept, index) => (
                <div key={dept.department} className="bg-[color:var(--color-muted)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[color:var(--color-card-foreground)]">{dept.department}</span>
                    <span className="text-2xl font-bold text-[color:var(--color-primary)]">{dept.count}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-[color:var(--color-muted-foreground)]">Total</div>
                      <div className="text-lg font-bold text-[color:var(--color-card-foreground)]">{dept.count}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[color:var(--color-success)]">Present</div>
                      <div className="text-lg font-bold text-[color:var(--color-success)]">{dept.present}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[color:var(--color-warning)]">On Leave</div>
                      <div className="text-lg font-bold text-[color:var(--color-warning)]">{dept.onLeave}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-[color:var(--color-background)] rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-[color:var(--color-muted-foreground)] mt-1">{dept.percentage}% of total workforce</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Analytics */}
          <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow)] p-6 border border-[color:var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[color:var(--color-card-foreground)]">Leave Analytics</h3>
              <PieChart className="h-6 w-6 text-[color:var(--color-primary)]" />
            </div>
            <div className="space-y-6">
              {leaveTypesBreakdown.slice(0, 4).map((leave, index) => (
                <div key={leave.type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[color:var(--color-card-foreground)]">{leave.type}</span>
                    <span className="text-sm bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)] px-2 py-1 rounded-full">
                      {leave.employeeCount} employees
                    </span>
                  </div>
                  <ProgressBar
                    value={leave.used}
                    max={leave.allocated}
                    color="bg-gradient-to-r from-purple-400 to-purple-600"
                    label={`Used ${leave.used} / Allocated ${leave.allocated}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productivity Score */}
          <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow)] p-6 border border-[color:var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--color-card-foreground)]">Productivity Pulse</h3>
              <Activity className="h-5 w-5 text-[color:var(--color-success)]" />
            </div>
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="var(--color-muted)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="var(--color-success)" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${(metrics.fullDayRate * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[color:var(--color-card-foreground)]">{metrics.fullDayRate.toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">Full-day completion rate</div>
            </div>
          </div>

          {/* Today's Champions */}
          <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow-lg)] p-6 border border-[color:var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--color-card-foreground)]">Today's Stats</h3>
              <Target className="h-5 w-5 text-[color:var(--color-primary)]" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[color:var(--color-success)] bg-opacity-10 rounded-lg border border-[color:var(--color-success)] border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-[color:var(--color-success)]" />
                  <span className="text-sm font-medium text-[color:var(--color-success)]">Full Day Workers</span>
                </div>
                <span className="text-lg font-bold text-[color:var(--color-success)]">{metrics.fullDayWorkers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[color:var(--color-info)] bg-opacity-10 rounded-lg border border-[color:var(--color-info)] border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[color:var(--color-info)]" />
                  <span className="text-sm font-medium text-[color:var(--color-info)]">Part Time Workers</span>
                </div>
                <span className="text-lg font-bold text-[color:var(--color-info)]">{metrics.partTimeWorkers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[color:var(--color-primary)] bg-opacity-10 rounded-lg border border-[color:var(--color-primary)] border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-[color:var(--color-primary)]" />
                  <span className="text-sm font-medium text-[color:var(--color-primary)]">Total Hours</span>
                </div>
                <span className="text-lg font-bold text-[color:var(--color-primary)]">{metrics.totalHoursToday.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Smart Alerts */}
          <div className="bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-2xl shadow-[var(--shadow-lg)] p-6 border border-[color:var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--color-card-foreground)]">Smart Alerts</h3>
              <AlertTriangle className="h-5 w-5 text-[color:var(--color-warning)]" />
            </div>
            <div className="space-y-3">
              {metrics.leaveUtilization > 80 && (
                <div className="flex items-start space-x-3 p-3 bg-[color:var(--color-error)] bg-opacity-10 rounded-lg border-l-4 border-[color:var(--color-error)]">
                  <AlertTriangle className="h-4 w-4 text-[color:var(--color-error)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-error)]">High Leave Usage</p>
                    <p className="text-xs text-[color:var(--color-error)] opacity-80">Consider reviewing leave policies</p>
                  </div>
                </div>
              )}
              {metrics.attendanceRate < 70 && (
                <div className="flex items-start space-x-3 p-3 bg-[color:var(--color-warning)] bg-opacity-10 rounded-lg border-l-4 border-[color:var(--color-warning)]">
                  <AlertTriangle className="h-4 w-4 text-[color:var(--color-warning)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-warning)]">Low Attendance Alert</p>
                    <p className="text-xs text-[color:var(--color-warning)] opacity-80">Attendance below target threshold</p>
                  </div>
                </div>
              )}
              {metrics.attendanceRate >= 85 && metrics.leaveUtilization <= 70 && (
                <div className="flex items-start space-x-3 p-3 bg-[color:var(--color-success)] bg-opacity-10 rounded-lg border-l-4 border-[color:var(--color-success)]">
                  <UserCheck className="h-4 w-4 text-[color:var(--color-success)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-success)]">All Systems Green! 🎉</p>
                    <p className="text-xs text-[color:var(--color-success)] opacity-80">Everything looks great today</p>
                  </div>
                </div>
              )}
              {metrics.totalEmployees === 0 && (
                <div className="flex items-start space-x-3 p-3 bg-[color:var(--color-info)] bg-opacity-10 rounded-lg border-l-4 border-[color:var(--color-info)]">
                  <Users className="h-4 w-4 text-[color:var(--color-info)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-info)]">No Data Available</p>
                    <p className="text-xs text-[color:var(--color-info)] opacity-80">Check your API configuration</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[color:var(--color-muted-foreground)] text-sm">
            💼 Powered by your HR team • Last updated: {new Date().toLocaleTimeString()} • 
            <span className="text-[color:var(--color-primary)] font-medium"> Keep making work awesome!</span>
          </p>
        </div>
      </div>
    </div>
  );
}