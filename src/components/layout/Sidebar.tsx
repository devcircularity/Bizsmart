// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  Calendar,
  FileText,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Work Hours', href: '/dashboard/attendance', icon: Clock },
  { name: 'Employee Directory', href: '/dashboard/employees', icon: Users },
  { name: 'Leave Balances', href: '/dashboard/leave', icon: Calendar },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto lg:top-0
          h-[calc(100vh-4rem)] flex flex-col
        `}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--background))',
          borderRight: '1px solid',
          borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)'
        }}
      >
        {/* Header - Only on mobile */}
        <div 
          className="flex items-center justify-between h-16 px-4 lg:hidden flex-shrink-0"
          style={{
            borderBottom: '1px solid',
            borderColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--primary) 12%, var(--background))'
          }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-white font-bold text-sm">BS</span>
            </div>
            <span 
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Bizsmart HR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors"
            style={{ 
              color: 'color-mix(in srgb, var(--foreground) 70%, transparent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 15%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'color-mix(in srgb, var(--foreground) 70%, transparent)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation - Takes remaining space */}
        <nav className="flex-1 px-4 py-4 lg:py-6 flex flex-col justify-start overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
                  style={{
                    ...(isActive ? {
                      backgroundColor: 'color-mix(in srgb, var(--primary) 20%, var(--background))',
                      color: 'var(--primary)',
                      borderLeft: '3px solid var(--primary)',
                      fontWeight: '600'
                    } : {
                      color: 'color-mix(in srgb, var(--foreground) 80%, transparent)'
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--foreground)';
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 12%, var(--background))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'color-mix(in srgb, var(--foreground) 80%, transparent)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon 
                    className="h-5 w-5 flex-shrink-0 transition-colors duration-200" 
                    style={{
                      color: isActive 
                        ? 'var(--primary)' 
                        : 'color-mix(in srgb, var(--foreground) 60%, transparent)'
                    }}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Optional: Add some branding/logo space */}
          <div className="mt-auto pt-6">
            <div 
              className="text-center p-4 rounded-lg"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--primary) 12%, var(--background))',
                border: '1px solid',
                borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)'
              }}
            >
              <div 
                className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span className="text-white font-bold text-lg">BS</span>
              </div>
              <div 
                className="text-xs font-medium"
                style={{ color: 'var(--primary)' }}
              >
                Bizsmart HR
              </div>
              <div 
                className="text-xs"
                style={{ color: 'color-mix(in srgb, var(--foreground) 60%, transparent)' }}
              >
                Enterprise Edition
              </div>
            </div>
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div 
          className="px-4 py-4 flex-shrink-0"
          style={{
            borderTop: '1px solid',
            borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--primary) 5%, var(--background))'
          }}
        >
          <div 
            className="text-xs text-center"
            style={{ color: 'color-mix(in srgb, var(--foreground) 60%, transparent)' }}
          >
            © 2025 Bizsmart Enterprises
          </div>
        </div>
      </aside>
    </>
  );
}