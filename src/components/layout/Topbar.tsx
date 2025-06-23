'use client';

import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 shadow-sm"
      style={{
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--foreground) 15%, transparent)'
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md transition-colors"
            style={{ 
              color: 'color-mix(in srgb, var(--foreground) 70%, transparent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--foreground) 8%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'color-mix(in srgb, var(--foreground) 70%, transparent)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/logo/logo.png" 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover" 
            />
            <h1 
              className="text-xl font-semibold hidden sm:block"
              style={{ color: 'var(--foreground)' }}
            >
              BizSmart HR Reports
            </h1>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="p-2 rounded-full relative transition-colors"
            style={{ 
              color: 'color-mix(in srgb, var(--foreground) 70%, transparent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--foreground) 8%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'color-mix(in srgb, var(--foreground) 70%, transparent)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute -top-1 -right-1 h-4 w-4 text-white text-xs rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
              style={{ 
                color: 'color-mix(in srgb, var(--foreground) 70%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--foreground) 8%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'color-mix(in srgb, var(--foreground) 70%, transparent)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)' }}
              >
                <span 
                  className="font-medium text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span 
                className="hidden md:block text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {user?.name || 'Guest'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid',
                  borderColor: 'color-mix(in srgb, var(--foreground) 15%, transparent)'
                }}
              >
                <div className="py-1">
                  <div 
                    className="px-4 py-2 text-xs"
                    style={{
                      color: 'color-mix(in srgb, var(--foreground) 50%, transparent)',
                      borderBottom: '1px solid',
                      borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)'
                    }}
                  >
                    Logged in as
                  </div>
                  <div 
                    className="px-4 py-2 text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {user?.email}
                  </div>
                  <div 
                    style={{
                      borderTop: '1px solid',
                      borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)'
                    }}
                  >
                    <button 
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #ef4444 10%, transparent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}