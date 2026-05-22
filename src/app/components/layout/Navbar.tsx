import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Search, Bell, Shield, Menu, Wifi, WifiOff, Command, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { API_CONFIG } from '../../api/config';

interface NavbarProps {
  toggleSidebar: () => void;
  currentTime: Date;
  onOpenCommandPalette?: () => void;
}

export function Navbar({ toggleSidebar, currentTime, onOpenCommandPalette }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      className="h-20 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-10 shrink-0 sticky top-0"
      style={{
        background: 'color-mix(in srgb, var(--theme-bg-color, #0a0f1c) 80%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--theme-border, #1f2937) 50%, transparent)',
        fontFamily: 'var(--theme-font-sans)',
      }}
    >
      {/* Left: Toggle & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <motion.h2 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-white tracking-wide flex items-center gap-2"
          >
            {t('appTitle')} 
            
          </motion.h2>
          <div className="text-xs text-gray-500 font-mono hidden sm:block">
            SYSTEM_STATUS: <span className="text-green-400">{t('systemOptimal')}</span>
          </div>
        </div>
      </div>

      {/* Center: Time */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <motion.div 
            whileHover={{ scale: 1.05, borderColor: 'rgba(6,182,212,0.3)' }}
            className="flex flex-col items-center bg-black/40 px-6 py-2 rounded-lg border border-gray-800 shadow-inner cursor-default backdrop-blur-sm"
          >
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">{t('systemTime')}</div>
            <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums shadow-cyan-glow">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </motion.div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
          {/* API Status Indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono shrink-0 ${
            API_CONFIG.TEST_MODE
              ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
              : 'bg-green-900/20 border-green-500/30 text-green-400'
          }`} style={{ fontSize: '0.625rem' }}>
            {API_CONFIG.TEST_MODE ? <WifiOff size={10} /> : <Wifi size={10} />}
            {API_CONFIG.TEST_MODE ? 'MOCK' : 'LIVE'}
          </div>

          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all"
              style={{ fontSize: '0.625rem' }}
            >
              <Command size={10} />
              <span className="font-mono">⌘K</span>
            </button>
          )}

          <button 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all hover:border-gray-600"
          >
            <Globe size={16} />
            <span className="text-xs font-bold w-4">{language === 'zh' ? 'ZH' : 'EN'}</span>
          </button>
          
          <motion.div 
            animate={{ width: isSearchFocused ? 300 : 'auto' }}
            className="relative group hidden sm:block"
          >
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-cyan-400' : 'text-gray-500'}`} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                bg-gray-900/50 border rounded-lg pl-9 pr-4 py-2 text-sm w-48 lg:w-64 focus:outline-none transition-all text-gray-300 placeholder-gray-600
                ${isSearchFocused ? 'border-cyan-500/50 bg-gray-900 w-full shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-gray-700'}
              `}
            />
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors group"
          >
            <Bell size={18} className="group-hover:text-cyan-400 transition-colors"/>
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Shield size={18} />
          </motion.button>
      </div>
    </header>
  );
}