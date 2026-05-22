import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ChevronRight, Trash2, Copy, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';
import { useApi, useMutation } from '../../api/hooks';
import type { CLIExecuteResponse } from '../../api/types';

interface HistoryEntry {
  id: string;
  command: string;
  output: string;
  outputType: string;
  timestamp: string;
  duration: number;
  exitCode: number;
}

const OUTPUT_COLORS: Record<string, string> = {
  text: 'text-gray-300',
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  json: 'text-cyan-300',
  table: 'text-gray-200',
};

const AUTOCOMPLETE_DATA = {
  'yyc3': ['status', 'node', 'alerts', 'patrol', 'config', 'report', 'version', 'help'],
  'yyc3 node': ['restart', 'Max-Server', 'NAS-Server', 'yyc3-125-ECS', 'yyc3-202-ECS', 'yyc3-33-ECS'],
  'yyc3 patrol': ['run', 'history', 'schedule'],
  'yyc3 config': ['get', 'set', 'list'],
};

export function CLITerminal() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { mutate: executeCmd } = useMutation<{ command: string }, CLIExecuteResponse>(
    'POST', '/cli/execute'
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Welcome message
  useEffect(() => {
    setHistory([{
      id: 'welcome',
      command: '',
      output: `YYC³ Matrix Dashboard CLI v1.0.0\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWelcome to the YYC³ command line interface.\nType "yyc3 help" for available commands.\nType "yyc3 status" for system overview.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      outputType: 'text',
      timestamp: new Date().toLocaleTimeString(),
      duration: 0,
      exitCode: 0,
    }]);
  }, []);

  // Autocomplete logic
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const parts = input.trim().split(/\s+/);
    const prefix = parts.slice(0, -1).join(' ');
    const current = parts[parts.length - 1].toLowerCase();

    // Find matching completions
    const completionKey = prefix || (parts.length === 1 ? '' : '');
    let candidates: string[] = [];

    if (parts.length === 1) {
      candidates = ['yyc3'].filter(c => c.startsWith(current));
    } else {
      const key = Object.keys(AUTOCOMPLETE_DATA).find(k => prefix === k || `${prefix}`.startsWith(k));
      if (key && AUTOCOMPLETE_DATA[key as keyof typeof AUTOCOMPLETE_DATA]) {
        candidates = AUTOCOMPLETE_DATA[key as keyof typeof AUTOCOMPLETE_DATA]
          .filter(c => c.toLowerCase().startsWith(current));
      }
    }

    setSuggestions(candidates.slice(0, 6));
    setSelectedSuggestion(0);
  }, [input]);

  const handleExecute = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsExecuting(true);
    setCmdHistory(prev => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 50));
    setHistoryIndex(-1);

    const startTime = Date.now();
    const result = await executeCmd({ command: cmd });
    const duration = Date.now() - startTime;

    const entry: HistoryEntry = {
      id: `cmd-${Date.now()}`,
      command: cmd,
      output: result?.output || 'Command executed',
      outputType: result?.outputType || 'text',
      timestamp: new Date().toLocaleTimeString(),
      duration: result?.duration || duration,
      exitCode: result?.exitCode ?? 0,
    };

    setHistory(prev => [...prev, entry]);
    setInput('');
    setSuggestions([]);
    setIsExecuting(false);
  }, [executeCmd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const parts = input.trim().split(/\s+/);
        parts[parts.length - 1] = suggestions[selectedSuggestion];
        setInput(parts.join(' ') + ' ');
        setSuggestions([]);
      }
      return;
    }

    // Enter to execute
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && input.endsWith('\t')) {
        return;
      }
      handleExecute(input);
      return;
    }

    // Arrow up/down for history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1));
      } else if (cmdHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    // Escape to clear suggestions
    if (e.key === 'Escape') {
      setSuggestions([]);
    }

    // Ctrl+L to clear
    if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  }, [input, suggestions, selectedSuggestion, cmdHistory, historyIndex, handleExecute]);

  const handleClear = () => setHistory([]);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Terminal className="w-6 h-6" />
            {isZh ? 'CLI 终端' : 'CLI Terminal'}
            <span className="text-xs font-mono px-2 py-0.5 rounded border bg-green-900/30 text-green-300 border-green-500/30" style={{ fontSize: '0.65rem' }}>
              CONNECTED
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '内嵌命令行 — 支持 yyc3 命令集与自动补全' : 'Embedded CLI — supports yyc3 commands with auto-complete'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-xs"
            style={{ fontSize: '0.75rem' }}>
            <Trash2 className="w-3.5 h-3.5" />
            {isZh ? '清屏' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { label: isZh ? '已执行' : 'Executed', value: history.filter(h => h.command).length, color: 'text-cyan-400' },
          { label: isZh ? '成功' : 'Success', value: history.filter(h => h.exitCode === 0 && h.command).length, color: 'text-green-400' },
          { label: isZh ? '失败' : 'Failed', value: history.filter(h => h.exitCode !== 0 && h.command).length, color: 'text-red-400' },
          { label: isZh ? '历史' : 'History', value: cmdHistory.length, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{s.label}</div>
            <div className={`text-lg font-mono ${s.color}`} style={{ fontSize: '1.1rem', fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Terminal */}
      <FuturisticPanel className="flex-1 min-h-0 !p-0 overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-gray-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-gray-500 ml-2" style={{ fontSize: '0.7rem' }}>
            yyc3@matrix:~
          </span>
          <span className="text-xs font-mono text-cyan-500/50 ml-auto" style={{ fontSize: '0.65rem' }}>
            {isZh ? 'Tab 补全 | ↑↓ 历史 | Ctrl+L 清屏' : 'Tab complete | ↑↓ history | Ctrl+L clear'}
          </span>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto p-4 font-mono text-sm bg-[#0a0e1a] min-h-0"
          style={{ fontSize: '0.8rem', maxHeight: 'calc(100% - 80px)' }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry) => (
            <div key={entry.id} className="mb-3 group">
              {/* Command Line */}
              {entry.command && (
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">$</span>
                  <span className="text-white">{entry.command}</span>
                  <span className="text-gray-600 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2" style={{ fontSize: '0.65rem' }}>
                    <Clock className="w-3 h-3" />
                    {entry.duration}ms
                    <button onClick={() => handleCopy(entry.output)} className="hover:text-gray-400">
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
              {/* Output */}
              <div className={`whitespace-pre-wrap mt-1 ${OUTPUT_COLORS[entry.outputType] || 'text-gray-300'}`}>
                {entry.output}
              </div>
            </div>
          ))}

          {/* Input Line */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 shrink-0">$</span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-white outline-none font-mono caret-cyan-400"
                  style={{ fontSize: '0.8rem' }}
                  placeholder={isZh ? '输入 yyc3 命令...' : 'Type yyc3 command...'}
                  autoFocus
                  disabled={isExecuting}
                />
              </div>
              {isExecuting && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-6 bottom-full mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => {
                        const parts = input.trim().split(/\s+/);
                        parts[parts.length - 1] = s;
                        setInput(parts.join(' ') + ' ');
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                        i === selectedSuggestion ? 'bg-cyan-600/30 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {s}
                    </button>
                  ))}
                  <div className="px-3 py-1 text-[10px] text-gray-600 border-t border-gray-700 font-mono" style={{ fontSize: '0.6rem' }}>
                    Tab {isZh ? '确认' : 'to confirm'} | ↑↓ {isZh ? '选择' : 'select'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FuturisticPanel>

      {/* Quick Commands */}
      <div className="flex gap-2 flex-wrap shrink-0">
        {['yyc3 status', 'yyc3 node', 'yyc3 alerts', 'yyc3 patrol run', 'yyc3 config'].map(cmd => (
          <button
            key={cmd}
            onClick={() => handleExecute(cmd)}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors text-xs font-mono disabled:opacity-50"
            style={{ fontSize: '0.7rem' }}
          >
            <ChevronRight className="w-3 h-3 inline mr-1" />
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
