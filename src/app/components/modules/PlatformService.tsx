import { Globe, Server, Share2 } from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { FuturisticGrid } from '../FuturisticGrid';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';

export function PlatformService() {
  const dataDistribution = [
    { name: 'EEG Data', value: 45 },
    { name: 'Model Params', value: 25 },
    { name: 'Logs', value: 15 },
    { name: 'User Profiles', value: 15 },
  ];
  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">平台服务层 (Platform Service)</h2>
          <p className="text-gray-400 text-sm">云脑模型训练、数据湖与API服务接口</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Globe className="w-4 h-4" /> Global Node: <span className="text-green-400">Asia-East-1</span>
          </div>
        </div>
      </div>

      <FuturisticGrid columns={4} className="flex-none">
        <NeonBorder color="purple" intensity="low" className="p-4 flex flex-col items-center justify-center bg-gray-900/50">
          <div className="text-gray-400 text-xs mb-1">Total Datasets</div>
          <div className="text-xl font-bold text-purple-400">4.2 PB</div>
        </NeonBorder>
        <NeonBorder color="blue" intensity="low" className="p-4 flex flex-col items-center justify-center bg-gray-900/50">
          <div className="text-gray-400 text-xs mb-1">Active Models</div>
          <div className="text-xl font-bold text-blue-400">1,284</div>
        </NeonBorder>
        <NeonBorder color="green" intensity="low" className="p-4 flex flex-col items-center justify-center bg-gray-900/50">
          <div className="text-gray-400 text-xs mb-1">API Requests</div>
          <div className="text-xl font-bold text-green-400">8.5k/s</div>
        </NeonBorder>
        <NeonBorder color="orange" intensity="low" className="p-4 flex flex-col items-center justify-center bg-gray-900/50">
          <div className="text-gray-400 text-xs mb-1">Contributors</div>
          <div className="text-xl font-bold text-orange-400">342</div>
        </NeonBorder>
      </FuturisticGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <FuturisticPanel title="分布式训练进度 (Training Progress)" className="lg:col-span-2 flex flex-col">
          <div className="space-y-6 flex-1 p-2">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Global Brain Model V4.2</span>
                <span className="text-cyan-400">Training... 78%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full w-[78%] relative">
                  <div className="absolute top-0 right-0 h-full w-2 bg-white/50 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Epoch: 842/1000</span>
                <span>ETA: 4h 23m</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/30 p-4 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-gray-200">联邦学习节点</span>
                </div>
                <div className="text-2xl font-mono text-white">42 <span className="text-sm text-gray-500">Nodes</span></div>
                <div className="text-xs text-green-400 mt-1">All Online</div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-gray-200">GPU Cluster</span>
                </div>
                <div className="text-2xl font-mono text-white">128 <span className="text-sm text-gray-500">Units</span></div>
                <div className="text-xs text-orange-400 mt-1">92% Utilized</div>
              </div>
            </div>
          </div>
        </FuturisticPanel>

        <FuturisticPanel title="数据湖存储分布 (Data Lake)" className="flex flex-col">
          <div className="relative">
            <ChartContainer height={250}>
              {(w, h) => (
                <PieChart width={w} height={h}>
                  <Pie
                    data={dataDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                </PieChart>
              )}
            </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-2xl font-bold text-white">4.2</div>
              <div className="text-xs text-gray-500">PB</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </FuturisticPanel>
      </div>
    </div>
  );
}
