import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Lateral */}
      <DashboardSidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
