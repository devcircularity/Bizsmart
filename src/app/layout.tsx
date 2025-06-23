'use client';

import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth');

    if (!stored && pathname !== '/login') {
      router.push('/login');
    }

    if (stored && pathname === '/') {
      router.push('/dashboard');
    }
  }, [pathname, router]);

  const isAuthPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          {isAuthPage ? (
            // Just show children (i.e. login page) without layout
            children
          ) : (
            <div className="min-h-screen">
              <Topbar onMenuClick={toggleSidebar} />
              <div className="flex pt-16">
                <Sidebar open={sidebarOpen} onClose={closeSidebar} />
                {/* Main content wrapper with proper spacing */}
                <main className="flex-1 min-h-[calc(100vh-4rem)]">
                  <div className="p-4 lg:p-6 overflow-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}