"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 메인 콘텐츠: lg에서 사이드바 너비만큼 왼쪽 마진 */}
      <main className="lg:ml-64">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
