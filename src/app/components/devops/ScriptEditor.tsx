import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCode, Play, ChevronRight, ChevronDown, Clock, Shield, AlertTriangle,
  CheckCircle, XCircle, Loader2, Copy, Plus, Layers, BarChart3, Hash,
  Terminal as TerminalIcon, RefreshCw, Pause, SkipForward,
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';
import { useApi, useMutation } from '../../api/hooks';
import type { ScriptTemplate, ScriptExecution } from '../../api/types';

type ViewTab = 'templates' | 'executions' | 'batch';

const riskConfig = {
  low: { label: '低', labelEn: 'Low', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/30' },
  medium: { label: '中', labelEn: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' },
  high: { label: '高', labelEn: 'High', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30' },
};

const execStatusConfig = {
  queued: { label: '排队中', labelEn: 'Queued', color: 'text-gray-400', icon: Clock },
  running: { label: '运行中', labelEn: 'Running', color: 'text-cyan-400', icon: Loader2 },
  success: { label: '成功', labelEn: 'Success', color: 'text-green-400', icon: CheckCircle },
  failed: { label: '失败', labelEn: 'Failed', color: 'text-red-400', icon: XCircle },
  cancelled: { label: '已取消', labelEn: 'Cancelled', color: 'text-gray-500', icon: Pause },
};

const langConfig: Record<string, { label: string; color: string }> = {
  bash: { label: 'Bash', color: 'text-green-400' },
  python: { label: 'Python', color: 'text-blue-400' },
  yaml: { label: 'YAML', color: 'text-orange-400' },
};

export function ScriptEditor() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [activeTab, setActiveTab] = useState<ViewTab>('templates');
  const [selectedScript, setSelectedScript] = useState<ScriptTemplate | null>(null);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState<string | null>(null);
  const [batchScripts, setBatchScripts] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'sequential' | 'parallel'>('sequential');

  const { data: templates } = useApi<ScriptTemplate[]>('GET', '/scripts/templates');
  const { data: executions } = useApi<ScriptExecution[]>('GET', '/scripts/executions');

  const { mutate: executeScript } = useMutation<any, any>('POST', '/scripts/execute');
  const { mutate: executeBatch } = useMutation<any, any>('POST', '/scripts/batch');

  const handleSelectScript = (script: ScriptTemplate) => {
    setSelectedScript(script);
    // Initialize variables with defaults
    const defaults: Record<string, string> = {};
    script.variables.forEach(v => { defaults[v.name] = v.default; });
    setVariables(defaults);
  };

  const handleExecute = useCallback(async (scriptId: string) => {
    setExecuting(scriptId);
    await executeScript({ scriptId, variables });
    setTimeout(() => setExecuting(null), 2000);
  }, [executeScript, variables]);

  const handleBatchExecute = useCallback(async () => {
    if (batchScripts.length === 0) return;
    await executeBatch({ jobId: `BATCH-${Date.now()}`, mode: batchMode, scriptIds: batchScripts });
  }, [executeBatch, batchScripts, batchMode]);

  const toggleBatchScript = (id: string) => {
    setBatchScripts(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const tabs: { id: ViewTab; label: string; labelEn: string }[] = [
    { id: 'templates', label: '脚本模板', labelEn: 'Templates' },
    { id: 'executions', label: '执行历史', labelEn: 'Executions' },
    { id: 'batch', label: '批量编排', labelEn: 'Batch Jobs' },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <FileCode className="w-6 h-6" />
            {isZh ? '脚本化操作' : 'Script Editor'}
            <span className="text-xs font-mono px-2 py-0.5 rounded border bg-purple-900/30 text-purple-300 border-purple-500/30" style={{ fontSize: '0.65rem' }}>
              {(templates || []).length} {isZh ? '模板' : 'TEMPLATES'}
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '操作模板转可执行脚本 — 支持变量注入与批量编排' : 'Operation templates to executable scripts — variable injection & batch orchestration'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: isZh ? '脚本模板' : 'Templates', value: (templates || []).length, color: 'text-cyan-400' },
          { label: isZh ? '总执行' : 'Total Runs', value: (executions || []).length, color: 'text-purple-400' },
          { label: isZh ? '运行中' : 'Running', value: (executions || []).filter(e => e.status === 'running').length, color: 'text-yellow-400' },
          { label: isZh ? '成功率' : 'Success Rate', value: `${Math.round(((executions || []).filter(e => e.status === 'success').length / Math.max((executions || []).length, 1)) * 100)}%`, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{s.label}</div>
            <div className={`text-xl font-mono ${s.color}`} style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-xs transition-all ${
              activeTab === tab.id ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {isZh ? tab.label : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'templates' && (
            <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 flex-1 min-h-0 overflow-hidden w-full">
              {/* Left: Template List */}
              <div className="w-80 shrink-0 overflow-auto space-y-2">
                {(templates || []).map(script => {
                  const risk = riskConfig[script.risk];
                  const lang = langConfig[script.language] || { label: script.language, color: 'text-gray-400' };
                  const isExpanded = expandedScript === script.id;
                  const isSelected = selectedScript?.id === script.id;

                  return (
                    <div
                      key={script.id}
                      className={`rounded-lg border overflow-hidden transition-colors cursor-pointer ${
                        isSelected ? 'border-cyan-500/40 bg-cyan-900/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                      onClick={() => handleSelectScript(script)}
                    >
                      <div className="px-3 py-2.5 flex items-start gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setExpandedScript(isExpanded ? null : script.id); }}>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-gray-500 mt-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-200 truncate" style={{ fontSize: '0.8rem' }}>
                              {isZh ? script.name : script.nameEn}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${lang.color} bg-gray-800 font-mono`} style={{ fontSize: '0.55rem' }}>
                              {lang.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5 truncate" style={{ fontSize: '0.6rem' }}>
                            {isZh ? script.description : script.descriptionEn}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${risk.bg} ${risk.color} ${risk.border} border font-mono`} style={{ fontSize: '0.5rem' }}>
                              <Shield className="w-2.5 h-2.5 inline mr-0.5" />
                              {isZh ? risk.label : risk.labelEn}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono" style={{ fontSize: '0.5rem' }}>
                              <Clock className="w-2.5 h-2.5 inline mr-0.5" />{script.estimatedTime}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono" style={{ fontSize: '0.5rem' }}>
                              <Hash className="w-2.5 h-2.5 inline mr-0.5" />{script.usageCount}x
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded: Variables */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-gray-800 pt-2 ml-6">
                              <div className="text-[9px] text-gray-500 font-mono mb-1" style={{ fontSize: '0.55rem' }}>
                                {isZh ? '变量' : 'Variables'} ({script.variables.length})
                              </div>
                              {script.variables.map(v => (
                                <div key={v.name} className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] text-cyan-400 font-mono w-24 shrink-0" style={{ fontSize: '0.6rem' }}>${v.name}</span>
                                  <span className="text-[10px] text-gray-500 truncate" style={{ fontSize: '0.6rem' }}>{v.default}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Right: Script Editor / Preview */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {selectedScript ? (
                  <FuturisticPanel className="flex-1 !p-0 overflow-hidden flex flex-col">
                    {/* Script Header */}
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
                      <div>
                        <div className="text-sm text-white" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {isZh ? selectedScript.name : selectedScript.nameEn}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>
                          {selectedScript.id} · {langConfig[selectedScript.language]?.label} · {selectedScript.estimatedTime}
                        </div>
                      </div>
                      <button
                        onClick={() => handleExecute(selectedScript.id)}
                        disabled={executing === selectedScript.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/80 border border-green-500/50 text-white hover:bg-green-500 transition-colors text-xs disabled:opacity-50"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {executing === selectedScript.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Play className="w-3.5 h-3.5" />
                        }
                        {isZh ? (executing === selectedScript.id ? '执行中...' : '执行脚本') : (executing === selectedScript.id ? 'Running...' : 'Execute')}
                      </button>
                    </div>

                    {/* Variables Panel */}
                    {selectedScript.variables.length > 0 && (
                      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900/30 shrink-0">
                        <div className="text-[10px] text-gray-500 font-mono mb-2" style={{ fontSize: '0.6rem' }}>
                          {isZh ? '变量配置' : 'Variable Configuration'}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedScript.variables.map(v => (
                            <div key={v.name} className="flex items-center gap-2">
                              <label className="text-[10px] text-cyan-400 font-mono w-20 shrink-0 truncate" style={{ fontSize: '0.6rem' }}>
                                ${v.name}
                              </label>
                              {v.type === 'select' && v.options ? (
                                <select
                                  value={variables[v.name] || v.default}
                                  onChange={e => setVariables(prev => ({ ...prev, [v.name]: e.target.value }))}
                                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-cyan-500/50"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {v.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input
                                  value={variables[v.name] || v.default}
                                  onChange={e => setVariables(prev => ({ ...prev, [v.name]: e.target.value }))}
                                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-cyan-500/50"
                                  style={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Script Content */}
                    <div className="flex-1 overflow-auto bg-[#0d1117] p-4 font-mono text-xs" style={{ fontSize: '0.7rem' }}>
                      {selectedScript.content.split('\n').map((line, i) => {
                        let colorClass = 'text-gray-300';
                        if (line.startsWith('#')) colorClass = 'text-gray-500';
                        else if (line.startsWith('echo')) colorClass = 'text-green-400';
                        else if (line.includes('if ') || line.includes('for ') || line.includes('done') || line.includes('fi')) colorClass = 'text-purple-400';
                        else if (line.includes('$')) colorClass = 'text-cyan-300';

                        // Highlight variables
                        let processedLine = line;
                        Object.keys(variables).forEach(varName => {
                          processedLine = processedLine.replace(new RegExp(`\\$\\{?${varName}\\}?`, 'g'), variables[varName] || `\${${varName}}`);
                        });

                        return (
                          <div key={i} className="flex">
                            <span className="text-gray-600 w-8 text-right mr-4 select-none shrink-0">{i + 1}</span>
                            <span className={colorClass}>{processedLine}</span>
                          </div>
                        );
                      })}
                    </div>
                  </FuturisticPanel>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600">
                    <div className="text-center">
                      <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm" style={{ fontSize: '0.875rem' }}>{isZh ? '选择一个脚本模板查看详情' : 'Select a script template to view details'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'executions' && (
            <motion.div key="executions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-auto space-y-2">
              {(executions || []).map((exec, idx) => {
                const st = execStatusConfig[exec.status];
                const StIcon = st.icon;
                return (
                  <motion.div
                    key={exec.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-lg border overflow-hidden ${
                      exec.status === 'failed' ? 'border-red-500/20 bg-red-900/5' : 'border-gray-800 bg-gray-900/30'
                    }`}
                  >
                    <div className="px-4 py-3 flex items-center gap-3">
                      <StIcon className={`w-5 h-5 shrink-0 ${st.color} ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-200" style={{ fontSize: '0.8rem' }}>{exec.scriptName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${st.color} bg-gray-800 font-mono`} style={{ fontSize: '0.55rem' }}>
                            {isZh ? st.label : st.labelEn}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5" style={{ fontSize: '0.6rem' }}>
                          {exec.id} · {exec.operator} · {exec.startedAt}
                          {exec.completedAt && ` → ${exec.completedAt}`}
                        </div>
                      </div>
                      {/* Progress */}
                      {exec.status === 'running' && (
                        <div className="w-24 shrink-0">
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-cyan-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${exec.progress}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-cyan-400 font-mono text-right mt-0.5" style={{ fontSize: '0.5rem' }}>{exec.progress}%</div>
                        </div>
                      )}
                    </div>
                    {/* Output */}
                    {exec.output && exec.output.length > 0 && (
                      <div className="px-4 pb-3 pt-1 border-t border-gray-800/50">
                        <div className="bg-[#0a0e1a] rounded p-2 font-mono text-[10px] text-gray-400 space-y-0.5" style={{ fontSize: '0.6rem' }}>
                          {exec.output.map((line, i) => <div key={i}>{line}</div>)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'batch' && (
            <motion.div key="batch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 flex-1 min-h-0 overflow-hidden w-full">
              {/* Left: Available Scripts */}
              <div className="w-72 shrink-0 overflow-auto">
                <div className="text-[10px] text-gray-500 font-mono uppercase mb-2 px-1" style={{ fontSize: '0.6rem' }}>
                  {isZh ? '选择脚本' : 'Select Scripts'}
                </div>
                {(templates || []).map(script => {
                  const isSelected = batchScripts.includes(script.id);
                  return (
                    <button
                      key={script.id}
                      onClick={() => toggleBatchScript(script.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border mb-1.5 transition-colors ${
                        isSelected ? 'border-cyan-500/40 bg-cyan-900/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-cyan-500 border-cyan-400' : 'border-gray-600'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs text-gray-300 truncate" style={{ fontSize: '0.75rem' }}>
                          {isZh ? script.name : script.nameEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Batch Config */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <FuturisticPanel className="shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-white" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      <Layers className="w-4 h-4 inline mr-2" />
                      {isZh ? '批量编排' : 'Batch Orchestration'}
                    </div>
                    <button
                      onClick={handleBatchExecute}
                      disabled={batchScripts.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/80 border border-purple-500/50 text-white hover:bg-purple-500 transition-colors text-xs disabled:opacity-50"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isZh ? '执行批量' : 'Run Batch'}
                    </button>
                  </div>

                  {/* Mode Select */}
                  <div className="flex gap-2 mb-3">
                    {(['sequential', 'parallel'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setBatchMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          batchMode === mode ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {mode === 'sequential' ? (isZh ? '顺序执行' : 'Sequential') : (isZh ? '并行执行' : 'Parallel')}
                      </button>
                    ))}
                  </div>

                  {/* Selected Scripts Order */}
                  {batchScripts.length > 0 ? (
                    <div className="space-y-1.5">
                      {batchScripts.map((id, idx) => {
                        const script = (templates || []).find(t => t.id === id);
                        if (!script) return null;
                        return (
                          <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800">
                            <span className="text-[10px] text-cyan-400 font-mono w-5 text-center" style={{ fontSize: '0.6rem' }}>
                              {batchMode === 'sequential' ? `${idx + 1}.` : '//'}
                            </span>
                            <span className="text-xs text-gray-300 flex-1" style={{ fontSize: '0.75rem' }}>
                              {isZh ? script.name : script.nameEn}
                            </span>
                            <span className={`text-[9px] font-mono ${riskConfig[script.risk].color}`} style={{ fontSize: '0.5rem' }}>
                              {script.estimatedTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-600 text-sm" style={{ fontSize: '0.8rem' }}>
                      {isZh ? '从左侧选择脚本添加到批量任务' : 'Select scripts from the left to add to batch'}
                    </div>
                  )}
                </FuturisticPanel>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
