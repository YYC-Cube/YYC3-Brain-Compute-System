import { AlertTriangle, Eye, FileText, Shield, UserCheck } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { FuturisticGrid } from '../FuturisticGrid';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';

export function SecuritySystem() {
  const radarData = [
    { subject: 'Privacy', A: 100, fullMark: 100 },
    { subject: 'Encryption', A: 95, fullMark: 100 },
    { subject: 'Integrity', A: 90, fullMark: 100 },
    { subject: 'Access', A: 98, fullMark: 100 },
    { subject: 'Audit', A: 85, fullMark: 100 },
    { subject: 'Ethics', A: 92, fullMark: 100 },
  ];

  const logs = [
    { time: '10:42:12', type: 'info', msg: 'System integrity check passed' },
    { time: '10:45:00', type: 'warn', msg: 'Unusual access pattern detected from Node-7' },
    { time: '10:45:01', type: 'success', msg: 'Automatic mitigation applied' },
    { time: '10:48:33', type: 'info', msg: 'Quantum key rotation completed' },
    { time: '10:50:11', type: 'info', msg: 'User consent updated' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-400">安全防护层 (Security System)</h2>
          <p className="text-gray-400 text-sm">多层级防御、隐私计算与伦理边界守护</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-900/20 border border-red-500/30 text-red-400 text-xs">
            <Shield className="w-3 h-3" /> Defense Level: MAXIMUM
          </div>
        </div>
      </div>

      <FuturisticGrid columns={3} className="flex-none">
        <NeonBorder color="red" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-red-900/30 rounded-lg text-red-400"><AlertTriangle size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Threats Blocked</div>
            <div className="text-2xl font-mono font-bold text-white">42 <span className="text-xs text-gray-500">Today</span></div>
          </div>
        </NeonBorder>
        <NeonBorder color="green" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-green-900/30 rounded-lg text-green-400"><UserCheck size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Auth Status</div>
            <div className="text-2xl font-mono font-bold text-white">Verified</div>
          </div>
        </NeonBorder>
        <NeonBorder color="blue" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><Eye size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Privacy Score</div>
            <div className="text-2xl font-mono font-bold text-white">98/100</div>
          </div>
        </NeonBorder>
      </FuturisticGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <FuturisticPanel title="安全态势感知 (Security Radar)" className="flex flex-col">
          <ChartContainer height={350}>
            {(w, h) => (
              <RadarChart cx="50%" cy="50%" outerRadius="80%" width={w} height={h} data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
              </RadarChart>
            )}
          </ChartContainer>
        </FuturisticPanel>

        <FuturisticPanel title="实时安全日志 (Security Logs)" className="flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                <div className="mt-1">
                  {log.type === 'info' && <FileText className="w-4 h-4 text-blue-400" />}
                  {log.type === 'warn' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                  {log.type === 'success' && <Shield className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-300">{log.msg}</div>
                  <div className="text-xs font-mono text-gray-500">{log.time}</div>
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-600 text-center py-2 animate-pulse">Scanning system events...</div>
          </div>
        </FuturisticPanel>
      </div>
    </div>
  );
}
