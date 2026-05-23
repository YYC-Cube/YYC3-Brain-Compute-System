
import { Activity, Brain, Radio, Wifi, Zap } from 'lucide-react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { FuturisticGrid } from '../FuturisticGrid';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';

export function PerceptionLayer() {
  // Mock data for EEG signals
  const eegData = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    alpha: Math.sin(i * 0.2) * 20 + 50 + Math.random() * 5,
    beta: Math.cos(i * 0.5) * 15 + 40 + Math.random() * 5,
    theta: Math.sin(i * 0.1) * 30 + 60 + Math.random() * 5,
    delta: Math.cos(i * 0.05) * 40 + 30 + Math.random() * 5,
  }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">感知交互层 (Perception Layer)</h2>
          <p className="text-gray-400 text-sm">多模态神经信号采集与闭环反馈控制</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 信号同步中
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
            <Wifi className="w-3 h-3" /> 连接稳定 (12ms)
          </div>
        </div>
      </div>

      <FuturisticGrid columns={3} className="flex-none">
        <NeonBorder color="cyan" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-cyan-900/30 rounded-lg text-cyan-400"><Brain size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">接入通道数</div>
            <div className="text-2xl font-mono font-bold text-white">1,024 <span className="text-xs text-gray-500">CH</span></div>
          </div>
        </NeonBorder>
        <NeonBorder color="purple" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400"><Activity size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">采样频率</div>
            <div className="text-2xl font-mono font-bold text-white">2.0 <span className="text-xs text-gray-500">kHz</span></div>
          </div>
        </NeonBorder>
        <NeonBorder color="green" intensity="low" className="p-4 flex items-center gap-4 bg-gray-900/50">
          <div className="p-3 bg-green-900/30 rounded-lg text-green-400"><Zap size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">信噪比 (SNR)</div>
            <div className="text-2xl font-mono font-bold text-white">85 <span className="text-xs text-gray-500">dB</span></div>
          </div>
        </NeonBorder>
      </FuturisticGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <FuturisticPanel title="实时脑电波形 (Real-time EEG)" className="lg:col-span-2 flex flex-col" glowEffect>
          <ChartContainer height={300}>
            {(w, h) => (
              <LineChart width={w} height={h} data={eegData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" domain={[0, 120]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="alpha" stroke="#22d3ee" strokeWidth={2} dot={false} name="Alpha (8-13Hz)" />
                <Line type="monotone" dataKey="beta" stroke="#a855f7" strokeWidth={2} dot={false} name="Beta (13-30Hz)" />
                <Line type="monotone" dataKey="theta" stroke="#22c55e" strokeWidth={2} dot={false} name="Theta (4-8Hz)" />
              </LineChart>
            )}
          </ChartContainer>
        </FuturisticPanel>

        <div className="flex flex-col gap-6 h-full">
          <FuturisticPanel title="设备状态 (Device Status)" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">纳米电极阵列</span>
                <span className="text-green-400 font-bold">在线</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">无线传输模块</span>
                <span className="text-green-400 font-bold">在线</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">电池电量</span>
                <span className="text-yellow-400 font-bold">76%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '76%' }}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">温度监控</span>
                <span className="text-green-400 font-bold">36.8°C</span>
              </div>
            </div>
          </FuturisticPanel>

          <FuturisticPanel title="神经反馈 (Feedback)" className="flex-1">
            <div className="grid grid-cols-2 gap-2 text-center h-full">
              <div className="bg-blue-500/10 rounded border border-blue-500/20 flex flex-col justify-center p-2">
                <Radio className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-xs text-gray-400">视觉刺激</div>
                <div className="text-sm font-bold text-white">Active</div>
              </div>
              <div className="bg-gray-800/30 rounded border border-gray-700 flex flex-col justify-center p-2 opacity-50">
                <Activity className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <div className="text-xs text-gray-400">触觉反馈</div>
                <div className="text-sm font-bold text-gray-500">Standby</div>
              </div>
            </div>
          </FuturisticPanel>
        </div>
      </div>
    </div>
  );
}
