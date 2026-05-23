import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useIsMobile } from '../ui/use-mobile';
import { AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (_id: string) => void;
  onOpenCommandPalette?: () => void;
}

export function MainLayout({ children, activeModule, setActiveModule, onOpenCommandPalette }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarPinned(false);
    } else {
      setSidebarOpen(true);
      setSidebarPinned(true);
    }
  }, [isMobile]);

  const bg = currentTheme.background || { type: 'color', value: '#0a0f1c', opacity: 100, blur: 0, position: 'center center', size: 'cover' };

  return (
    <div
      className="flex h-screen text-white overflow-hidden font-sans selection:bg-cyan-500/30"
      style={{
        background: bg.type === 'color' ? `var(--theme-bg-color, #0a0f1c)` : 'transparent',
        backgroundImage: bg.type === 'image' ? `var(--theme-bg-image, none)` : 'none',
        backgroundPosition: `var(--theme-bg-position, center center)`,
        backgroundSize: `var(--theme-bg-size, cover)`,
        backgroundRepeat: 'no-repeat',
        fontFamily: `var(--theme-font-sans)`,
        color: `var(--theme-background-fg, white)`,
      }}
    >
      {/* Video Background */}
      {bg.type === 'video' && bg.value && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            src={bg.value}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              opacity: bg.opacity / 100,
              filter: bg.blur > 0 ? `blur(${bg.blur}px)` : 'none',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Image/Color Background Overlay for blur/opacity */}
      {bg.type === 'image' && bg.blur > 0 && (
        <div className="fixed inset-0 z-0 pointer-events-none"
          style={{ backdropFilter: `blur(${bg.blur}px)`, opacity: bg.opacity / 100 }} />
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(!isMobile || sidebarOpen) && (
          <Sidebar 
            activeModule={activeModule} 
            setActiveModule={(id) => {
              setActiveModule(id);
              if (isMobile) setSidebarOpen(false);
            }} 
            isOpen={sidebarOpen}
            onTogglePin={(pinned) => {
              setSidebarPinned(pinned);
              if (!pinned) setSidebarOpen(false);
              else setSidebarOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
         {/* Background Effects - theme aware */}
         <div
           className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at top right, var(--theme-primary, rgba(59,130,246,0.1)) 0%, transparent 50%)',
             opacity: 0.15,
           }}
         />
         
         <Navbar 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            currentTime={currentTime}
            onOpenCommandPalette={onOpenCommandPalette}
         />

         {/* Main Workspace */}
         <main className="flex-1 overflow-hidden relative p-4 sm:p-6 lg:p-8">
            <div className="h-full flex flex-col w-full max-w-[1920px] mx-auto">
               {children}
            </div>
         </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}