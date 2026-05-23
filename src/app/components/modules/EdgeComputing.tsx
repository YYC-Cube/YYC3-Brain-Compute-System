import { Clock, Cpu, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { FuturisticGrid } from '../FuturisticGrid';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';

export function EdgeComputing() {
  const processData = [
    { name: 'Core 1', load: 85, temp: 42 },
    { name: 'Core 2', load: 65, temp: 38 },
    { name: 'Core 3', load: 92, temp: 45 },
    { name: 'Core 4', load: 45, temp: 36 },
    { name: 'NPU A', load: 78, temp: 41 },
    { name: 'NPU B', load: 88, temp: 43 },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">边缘计算层 (Edge Computing)</h2>
          <p className="text-gray-400 text-sm">本地实时数据处理与隐私计算引擎</p>
        </div>
        <div className="flex gap-4">
          <div className="px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs">
            NMP-1000 CHIP: ONLINE
          </div>
        </div>
      </div>

      <FuturisticGrid columns={3} className="flex-none">
        <NeonBorder color="blue" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><Clock size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">处理延迟</div>
            <div className="text-2xl font-mono font-bold text-white">4.2 <span className="text-xs text-gray-500">ms</span></div>
          </div>
        </NeonBorder>
        <NeonBorder color="orange" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-orange-900/30 rounded-lg text-orange-400"><Cpu size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">算力负载</div>
            <div className="text-2xl font-mono font-bold text-white">72 <span className="text-xs text-gray-500">%</span></div>
          </div>
        </NeonBorder>
        <NeonBorder color="red" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-red-900/30 rounded-lg text-red-400"><Zap size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">实时功耗</div>
            <div className="text-2xl font-mono font-bold text-white">12 <span className="text-xs text-gray-500">mW</span></div>
          </div>
        </NeonBorder>
      </FuturisticGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <FuturisticPanel title="核心负载监控 (Core Load)" className="flex flex-col">
          <ChartContainer height={300}>
            {(w, h) => (
              <BarChart width={w} height={h} data={processData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" stroke="#888" width={60} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#ffffff10' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                />
                <Bar dataKey="load" name="Load %" radius={[0, 4, 4, 0]}>
                  {processData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.load > 90 ? '#ef4444' : entry.load > 70 ? '#f97316' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        </FuturisticPanel>

        <div className="flex flex-col gap-6">
          <FuturisticPanel title="实时处理流水线 (Pipeline)" className="flex-1">
            <div className="space-y-4">
              {[
                { step: "信号预处理 (Pre-process)", status: "done", time: "0.5ms" },
                { step: "特征提取 (Feature Ext)", status: "processing", time: "1.2ms" },
                { step: "意图分类 (Classification)", status: "pending", time: "waiting" },
                { step: "指令生成 (Command Gen)", status: "pending", time: "waiting" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.status === 'done' ? 'bg-green-500' : item.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
                    {i < 3 && <div className="w-0.5 h-6 bg-gray-800 my-1" />}
                  </div>
                  <div className={`flex-1 p-3 rounded border ${item.status === 'processing' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-900/30 border-gray-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${item.status === 'processing' ? 'text-blue-300' : 'text-gray-400'}`}>{item.step}</span>
                      <span className="text-xs font-mono text-gray-500">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FuturisticPanel>
        </div>
      </div>
    </div>
  );
}
