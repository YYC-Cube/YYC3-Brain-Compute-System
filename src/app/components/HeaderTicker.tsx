import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function HeaderTicker() {
  const [time, setTime] = useState(new Date());
  const [viewIndex, setViewIndex] = useState(0);
  const { t } = useLanguage();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate views every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setViewIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const views = [
    // View 1: Time
    {
      id: 'time',
      content: (
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t('systemTime')}</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            {formatTime(time)}
          </div>
        </div>
      )
    },
    // View 2: System Status
    {
      id: 'status',
      content: (
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t('systemStatus')}</div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-lg font-medium text-green-400 text-glow-green">
              {t('systemOptimal')}
            </span>
          </div>
        </div>
      )
    },
    // View 3: Alerts/Badges
    {
      id: 'badges',
      content: (
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t('monitoring')}</div>
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>OK</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>3 ALERTS</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative w-48 h-16 bg-gray-900/50 rounded-lg border border-white/5 overflow-hidden flex items-center justify-center backdrop-blur-sm shadow-inner">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)] opacity-20" />
      
      {/* Slide Navigation Dots (Subtle) */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`w-1 h-1 rounded-full transition-colors duration-300 ${i === viewIndex ? 'bg-cyan-400' : 'bg-gray-700'}`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={views[viewIndex].id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pb-2"
        >
          {views[viewIndex].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
