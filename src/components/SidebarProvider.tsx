"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored) {
      setIsCollapsed(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  // Prevent hydration mismatch or flash by waiting for mount (optional, 
  // but if we want to avoid initial flicker we can render 'null' or default).
  // For now, we render children. The UI might snap.

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
