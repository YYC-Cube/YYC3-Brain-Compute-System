import { motion, AnimatePresence } from 'motion/react';
import { Lock, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FuturisticPanel } from '../FuturisticPanel';
import { NeonBorder } from '../NeonBorder';
import { ChartContainer } from '../ChartContainer';

export function NetworkLayer() {
  const throughputData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    up: Math.random() * 50 + 50,
    down: Math.random() * 80 + 100
  }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">网络传输层 (Network Layer)</h2>
          <p className="text-gray-400 text-sm">量子加密通信与超低延迟传输通道</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-none">
         <NeonBorder color="blue" intensity="medium" className="p-6 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
               <div className="text-gray-400">上行速率 (Uplink)</div>
               <ArrowUp className="text-blue-400 w-5 h-5"/>
            </div>
            <div className="text-3xl font-mono font-bold text-white">98.2 <span className="text-sm text-gray-500">Mbps</span></div>
            <div className="text-xs text-green-400 mt-2">Peak: 120 Mbps</div>
         </NeonBorder>
         
         <NeonBorder color="purple" intensity="medium" className="p-6 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
               <div className="text-gray-400">下行速率 (Downlink)</div>
               <ArrowDown className="text-purple-400 w-5 h-5"/>
            </div>
            <div className="text-3xl font-mono font-bold text-white">245.8 <span className="text-sm text-gray-500">Mbps</span></div>
            <div className="text-xs text-green-400 mt-2">Peak: 500 Mbps</div>
         </NeonBorder>

         <NeonBorder color="green" intensity="medium" className="p-6 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
               <div className="text-gray-400">网络延迟 (Latency)</div>
               <Activity className="text-green-400 w-5 h-5"/>
            </div>
            <div className="text-3xl font-mono font-bold text-white">1.2 <span className="text-sm text-gray-500">ms</span></div>
            <div className="text-xs text-green-400 mt-2">Jitter: 0.1ms</div>
         </NeonBorder>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
         <FuturisticPanel title="实时吞吐量 (Throughput)" className="lg:col-span-2 flex flex-col">
            <ChartContainer height={300}>
              {(w, h) => (
                <AreaChart width={w} height={h} data={throughputData}>
                   <defs>
                      <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
                   <XAxis dataKey="time" hide/>
                   <YAxis stroke="#666"/>
                   <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}/>
                   <Area type="monotone" dataKey="down" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDown)" />
                   <Area type="monotone" dataKey="up" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUp)" />
                </AreaChart>
              )}
            </ChartContainer>
         </FuturisticPanel>

         <FuturisticPanel title="量子加密状态 (Quantum Security)" className="flex flex-col">
            <div className="flex flex-col items-center justify-center flex-1 space-y-6">
               <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"/>
                  <div className="relative w-24 h-24 rounded-full border-4 border-green-500/50 flex items-center justify-center bg-gray-900">
                     <Lock className="w-10 h-10 text-green-400"/>
                  </div>
               </div>
               
               <div className="text-center">
                  <div className="text-lg font-bold text-white">QKD Link Active</div>
                  <div className="text-sm text-gray-400">BB84 Protocol</div>
               </div>

               <div className="w-full space-y-3 px-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Key Rate</span>
                     <span className="text-green-400 font-mono">14 kbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Error Rate (QBER)</span>
                     <span className="text-green-400 font-mono">1.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Buffer</span>
                     <span className="text-green-400 font-mono">100%</span>
                  </div>
               </div>
            </div>
         </FuturisticPanel>
      </div>
    </div>
  );
}
