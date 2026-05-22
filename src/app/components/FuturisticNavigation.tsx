import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Settings, 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  Radio,
  BookOpen,
  Layers,
  Brain
} from 'lucide-react';
import { HexagonalButton } from './HexagonalButton';
import { useLanguage } from './LanguageContext';
import logo from 'figma:asset/e53d9619a35d8a04f00785f03278798ee0e23e49.png';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  notifications?: number;
}

interface FuturisticNavigationProps {
  onNavigate?: (id: string) => void;
  currentView?: string;
  isMobile?: boolean;
}

export function FuturisticNavigation({ onNavigate, currentView, isMobile }: FuturisticNavigationProps) {
  const [activeItem, setActiveItem] = useState(currentView || 'dashboard');
  const { t } = useLanguage();

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <Home className="w-4 h-4" /> },
    { id: 'whitepaper', label: t('whitepaper'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'perception', label: t('perception'), icon: <Activity className="w-4 h-4" /> },
    { id: 'computing', label: t('computing'), icon: <Cpu className="w-4 h-4" /> },
    { id: 'platform', label: t('platform'), icon: <Layers className="w-4 h-4" /> },
    { id: 'network', label: t('network'), icon: <Radio className="w-4 h-4" /> },
    { id: 'security', label: t('security'), icon: <Shield className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> }
  ];

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    onNavigate?.(id);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Navigation */}
      <div className="flex flex-col gap-3 p-4 bg-gray-900/40 backdrop-blur-md border border-blue-500/20 rounded-lg shadow-glow">
        <motion.div
          className="flex items-center gap-2 mb-4 pb-4 border-b border-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <img 
              src={logo} 
              alt="YYC3" 
              className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
            />
          </div>
        </motion.div>

        <div className="space-y-2">
          {navigationItems.map((item, index) => (
            <div key={item.id}>
              <HexagonalButton
                active={activeItem === item.id}
                onClick={() => handleItemClick(item.id)}
                variant={activeItem === item.id ? 'primary' : 'secondary'}
                className="w-full justify-start p-3 h-auto"
              >
                <div className="flex items-center gap-3 w-full">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                  {item.notifications && (
                    <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white shadow-glow">
                      {item.notifications}
                    </div>
                  )}
                </div>
              </HexagonalButton>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-4 pt-4 border-t border-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-xs text-gray-400 mb-2">{t('quickActions')}</div>
          <div className="flex gap-2">
            <HexagonalButton size="sm" variant="accent">
              <Zap className="w-3 h-3" />
            </HexagonalButton>
            <HexagonalButton size="sm" variant="secondary">
              <Shield className="w-3 h-3" />
            </HexagonalButton>
            <HexagonalButton size="sm" variant="primary">
              <Brain className="w-3 h-3" />
            </HexagonalButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
