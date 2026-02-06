import { useState, useEffect } from 'react';

export function useSidebarMode() {
  const [sidebarMode, setSidebarMode] = useState<'full' | 'slim' | 'hidden'>('full');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('dashboardSidebarMode');
    if (saved) {
      try {
        setSidebarMode(JSON.parse(saved));
      } catch (e) {
        setSidebarMode('full');
      }
    }

    // Detect mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    setMounted(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    let newMode: 'full' | 'slim' | 'hidden';
    if (isMobile) {
      newMode = sidebarMode === 'full' ? 'hidden' : 'full';
    } else {
      newMode = sidebarMode === 'full' ? 'slim' : 'full';
    }
    setSidebarMode(newMode);
    localStorage.setItem('dashboardSidebarMode', JSON.stringify(newMode));
  };

  return {
    sidebarMode,
    isMobile,
    mounted,
    toggleSidebar,
  };
}
