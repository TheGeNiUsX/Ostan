"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    nameAr?: string | null;
    email: string;
    role: string;
    isProtected?: boolean;
  } | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="app-main">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        <main className="app-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
