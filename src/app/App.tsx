import { AnimatePresence, motion } from 'motion/react';
import React, { Suspense, useCallback, useState } from 'react';
import { ErrorBoundary, GlobalErrorFallback } from './components/ErrorBoundary';
import { LanguageProvider } from './components/LanguageContext';
import { ThemeProvider } from './components/ThemeContext';
import { CommandPalette, useGlobalShortcuts } from './components/devops/CommandPalette';
import { MainLayout } from './components/layout/MainLayout';
import { useNetworkStatus } from './hooks/useNetworkStatus';

const SystemOverview = React.lazy(() => import('./components/modules/SystemOverview').then(m => ({ default: m.SystemOverview })));
const WhitepaperViewer = React.lazy(() => import('./components/WhitepaperViewer').then(m => ({ default: m.WhitepaperViewer })));
const PerceptionLayer = React.lazy(() => import('./components/modules/PerceptionLayer').then(m => ({ default: m.PerceptionLayer })));
const EdgeComputing = React.lazy(() => import('./components/modules/EdgeComputing').then(m => ({ default: m.EdgeComputing })));
const PlatformService = React.lazy(() => import('./components/modules/PlatformService').then(m => ({ default: m.PlatformService })));
const NetworkLayer = React.lazy(() => import('./components/modules/NetworkLayer').then(m => ({ default: m.NetworkLayer })));
const SecuritySystem = React.lazy(() => import('./components/modules/SecuritySystem').then(m => ({ default: m.SecuritySystem })));
const SystemSettings = React.lazy(() => import('./components/modules/SystemSettings').then(m => ({ default: m.SystemSettings })));
const DeviceManagement = React.lazy(() => import('./components/devops/DeviceManagement').then(m => ({ default: m.DeviceManagement })));
const MonitorDashboard = React.lazy(() => import('./components/devops/MonitorDashboard').then(m => ({ default: m.MonitorDashboard })));
const AuditLogs = React.lazy(() => import('./components/devops/AuditLogs').then(m => ({ default: m.AuditLogs })));
const PermissionManager = React.lazy(() => import('./components/devops/PermissionManager').then(m => ({ default: m.PermissionManager })));
const OperationCenter = React.lazy(() => import('./components/devops/OperationCenter').then(m => ({ default: m.OperationCenter })));
const PatrolMode = React.lazy(() => import('./components/devops/PatrolMode').then(m => ({ default: m.PatrolMode })));
const FollowUpSystem = React.lazy(() => import('./components/devops/FollowUpSystem').then(m => ({ default: m.FollowUpSystem })));
const AISuggestionPanel = React.lazy(() => import('./components/devops/AISuggestionPanel').then(m => ({ default: m.AISuggestionPanel })));
const LocalFileManager = React.lazy(() => import('./components/devops/LocalFileManager').then(m => ({ default: m.LocalFileManager })));
const CLITerminal = React.lazy(() => import('./components/devops/CLITerminal').then(m => ({ default: m.CLITerminal })));
const IDEPluginView = React.lazy(() => import('./components/devops/IDEPluginView').then(m => ({ default: m.IDEPluginView })));
const ScriptEditor = React.lazy(() => import('./components/devops/ScriptEditor').then(m => ({ default: m.ScriptEditor })));
const ThemeCustomizer = React.lazy(() => import('./components/devops/ThemeCustomizer').then(m => ({ default: m.ThemeCustomizer })));
const ModelSettings = React.lazy(() => import('./components/devops/ModelSettings').then(m => ({ default: m.ModelSettings })));
const ComparisonDashboard = React.lazy(() => import('./components/devops/ComparisonDashboard').then(m => ({ default: m.ComparisonDashboard })));
const HistoricalComparison = React.lazy(() => import('./components/devops/HistoricalComparison').then(m => ({ default: m.HistoricalComparison })));
const AlertThresholdConfig = React.lazy(() => import('./components/devops/AlertThresholdConfig').then(m => ({ default: m.AlertThresholdConfig })));
const TestRunner = React.lazy(() => import('./components/devops/TestRunner').then(m => ({ default: m.TestRunner })));

function ModuleLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    </div>
  )
}

const moduleMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  overview: SystemOverview,
  docs: WhitepaperViewer,
  perception: PerceptionLayer,
  edge: EdgeComputing,
  platform: PlatformService,
  network: NetworkLayer,
  security: SecuritySystem,
  settings: SystemSettings,
  devices: DeviceManagement,
  monitor: MonitorDashboard,
  audit: AuditLogs,
  permissions: PermissionManager,
  operations: OperationCenter,
  patrol: PatrolMode,
  followup: FollowUpSystem,
  'ai-suggestion': AISuggestionPanel,
  'local-files': LocalFileManager,
  'cli-terminal': CLITerminal,
  'ide-plugin': IDEPluginView,
  'script-editor': ScriptEditor,
  'theme-customizer': ThemeCustomizer,
  comparison: ComparisonDashboard,
  historical: HistoricalComparison,
  thresholds: AlertThresholdConfig,
  tests: TestRunner,
}

function AppContent() {
  const [activeModule, setActiveModule] = useState('overview')
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false)

  const handleNavigate = useCallback((module: string) => {
    if (module === 'model-settings') {
      setModelSettingsOpen(true)
    } else {
      setActiveModule(module)
    }
  }, [])

  const { commandPaletteOpen, setCommandPaletteOpen } = useGlobalShortcuts(handleNavigate)

  const LazyModule = moduleMap[activeModule] || SystemOverview
  const moduleProps = activeModule === 'overview' || activeModule === 'default'
    ? { onNavigate: handleNavigate }
    : {}

  return (
    <>
      <MainLayout
        activeModule={activeModule}
        setActiveModule={handleNavigate}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <ErrorBoundary module={activeModule}>
              <Suspense fallback={<ModuleLoadingFallback />}>
                <LazyModule {...moduleProps} />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </MainLayout>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <ErrorBoundary module="AI模型设置">
        <Suspense fallback={null}>
          <ModelSettings isOpen={modelSettingsOpen} onClose={() => setModelSettingsOpen(false)} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary fallback={<GlobalErrorFallback error={null} onReset={() => window.location.reload()} />}>
      <LanguageProvider>
        <ThemeProvider>
          <NetworkStatusBar />
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

function NetworkStatusBar() {
  const { isOnline } = useNetworkStatus()
  if (isOnline) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-1.5 text-sm font-medium">
      ⚠️ 网络连接已断开 — 部分功能可能不可用
    </div>
  )
}
