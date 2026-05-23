import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle,
  Code,
  Cpu,
  Flag,
  Globe,
  GraduationCap,
  Grid,
  Heart,
  Layout,
  Lock,
  Network,
  RefreshCw,
  Rocket,
  Scale,
  Server,
  Shield,
  UserCheck,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { FuturisticGrid } from './FuturisticGrid';
import { FuturisticPanel } from './FuturisticPanel';
import { NeonBorder } from './NeonBorder';

export function WhitepaperViewer() {
  const [activeChapter, setActiveChapter] = useState(1);

  const chapters = [
    { id: 1, title: "概览与核心架构", icon: <Layout className="w-4 h-4" /> },
    { id: 2, title: "设计哲学与核心机制", icon: <Brain className="w-4 h-4" /> },
    { id: 3, title: "技术架构蓝图", icon: <Cpu className="w-4 h-4" /> },
    { id: 4, title: "应用场景与产业化", icon: <Briefcase className="w-4 h-4" /> },
    { id: 5, title: "伦理框架与治理结构", icon: <Scale className="w-4 h-4" /> },
    { id: 6, title: "研发路线图与战略合作", icon: <Flag className="w-4 h-4" /> },
    { id: 7, title: "商业价值与未来愿景", icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent text-white w-full">
      {/* Chapter Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-4 mb-4 scrollbar-hide w-full">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => setActiveChapter(chapter.id)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-sm transition-all duration-300 min-w-[200px] flex-shrink-0
              ${activeChapter === chapter.id
                ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/60 hover:border-gray-700'}
            `}
          >
            <div className={`text-2xl font-mono font-bold ${activeChapter === chapter.id ? 'text-cyan-400' : 'text-gray-600'}`}>
              {String(chapter.id).padStart(2, '0')}
            </div>
            <div className={`text-sm font-medium text-left ${activeChapter === chapter.id ? 'text-white' : 'text-gray-400'}`}>
              {chapter.title}
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
        <AnimatePresence mode="wait">
          {activeChapter === 1 && <ChapterOne key="c1" />}
          {activeChapter === 2 && <ChapterTwo key="c2" />}
          {activeChapter === 3 && <ChapterThree key="c3" />}
          {activeChapter === 4 && <ChapterFour key="c4" />}
          {activeChapter === 5 && <ChapterFive key="c5" />}
          {activeChapter === 6 && <ChapterSix key="c6" />}
          {activeChapter === 7 && <ChapterSeven key="c7" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Chapter 1: Overview ---
function ChapterOne() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="cyan" intensity="medium" className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Layout className="w-40 h-40 text-cyan-400" /></div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500 mb-4">第一章：概览与核心架构</h1>
        <p className="text-gray-300 max-w-3xl leading-relaxed">
          AI-π脑机系统基于智能行业的“五高、五标、五化”核心机制设计，旨在构建下一代高性能、高智能、高安全的脑机融合平台。
        </p>
      </NeonBorder>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConceptCard title="五高" subtitle="核心特性" color="blue" items={["高性能计算", "高精度交互", "高安全可靠", "高自适应进化", "高能效比"]} icon={<Zap />} />
        <ConceptCard title="五标" subtitle="规范体系" color="purple" items={["标准接口协议", "标准安全框架", "标准评估体系", "标准开发环境", "标准服务体系"]} icon={<Scale />} />
        <ConceptCard title="五化" subtitle="发展路径" color="green" items={["智能化层级", "平台化生态", "服务化转型", "产业化融合", "国际化布局"]} icon={<Globe />} />
      </div>

      <FuturisticPanel title="系统总体架构分层">
        <div className="space-y-4">
          <LayerRow title="感知交互层" desc="多模态信号采集 (EEG/fNIRS) 与闭环反馈" icon={<Activity />} color="blue" />
          <LayerRow title="边缘计算层" desc="本地实时信号处理，隐私计算，低延迟响应" icon={<Cpu />} color="cyan" />
          <LayerRow title="网络传输层" desc="量子加密通信，高带宽低延迟数据通道" icon={<Network />} color="purple" />
          <LayerRow title="平台服务层" desc="云脑模型训练，数据湖，API服务接口" icon={<Server />} color="green" />
          <LayerRow title="应用生态层" desc="医疗康复，教育增强，工业控制，消费娱乐" icon={<Grid />} color="orange" />
        </div>
      </FuturisticPanel>
    </motion.div>
  );
}

// --- Chapter 2: Philosophy ---
function ChapterTwo() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="purple" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-4">第二章：设计哲学与核心机制</h1>
        <p className="text-gray-300">遵循“生物兼容性、认知增强性、社会适应性”三位一体的设计哲学。</p>
      </NeonBorder>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FuturisticPanel title="神经信号类型解析">
          <div className="space-y-3">
            <SignalTypeRow type="EEG (脑电图)" res="低 (1cm)" invas="无创" app="意图识别" />
            <SignalTypeRow type="fNIRS (近红外)" res="中 (5mm)" invas="无创" app="认知负荷" />
            <SignalTypeRow type="ECoG (皮层电)" res="高 (1mm)" invas="微创" app="运动控制" />
            <SignalTypeRow type="LFP (场电位)" res="超高 (100μm)" invas="植入" app="神经元分析" />
          </div>
        </FuturisticPanel>

        <div>
          <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><Code className="w-4 h-4" /> 脑机融合度评估算法</h3>
          <CodePanel filename="BrainMachineFusionLevel.py">
            <div className="text-xs font-mono text-gray-300 space-y-1">
              <div><span className="text-purple-400">def</span> <span className="text-blue-400">evaluate_level</span>(score):</div>
              <div className="pl-4"><span className="text-purple-400">if</span> score &lt; 20: <span className="text-purple-400">return</span> <span className="text-green-300">"L1: 监控级"</span></div>
              <div className="pl-4"><span className="text-purple-400">elif</span> score &lt; 40: <span className="text-purple-400">return</span> <span className="text-green-300">"L2: 交互级"</span></div>
              <div className="pl-4"><span className="text-purple-400">elif</span> score &lt; 60: <span className="text-purple-400">return</span> <span className="text-green-300">"L3: 协作级"</span></div>
              <div className="pl-4"><span className="text-purple-400">elif</span> score &lt; 80: <span className="text-purple-400">return</span> <span className="text-green-300">"L4: 增强级"</span></div>
              <div className="pl-4"><span className="text-purple-400">else</span>: <span className="text-purple-400">return</span> <span className="text-green-300">"L5: 融合级"</span></div>
            </div>
          </CodePanel>
        </div>
      </div>
    </motion.div>
  );
}

// --- Chapter 3: Tech Architecture ---
function ChapterThree() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="blue" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-blue-300 mb-4">第三章：技术架构蓝图</h1>
        <p className="text-gray-300">从纳米接口到云端智能的四层一体化技术栈。</p>
      </NeonBorder>

      <FuturisticGrid columns={2}>
        <FuturisticPanel title="纳米接口层" variant="secondary">
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> 柔性纳米电极阵列</li>
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> 无线能量与数据传输</li>
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> 生物相容性封装</li>
          </ul>
        </FuturisticPanel>
        <FuturisticPanel title="边缘处理层" variant="secondary">
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 神经形态计算单元</li>
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 实时信号处理引擎</li>
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 本地隐私计算模块</li>
          </ul>
        </FuturisticPanel>
      </FuturisticGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><Code className="w-4 h-4" /> 实时神经处理器</h3>
          <CodePanel filename="RealTimeNeuroProcessor.py">
            <div className="text-xs font-mono text-gray-300 space-y-1">
              <div><span className="text-purple-400">class</span> <span className="text-yellow-300">RealTimeNeuroProcessor</span>:</div>
              <div className="pl-4"><span className="text-purple-400">def</span> <span className="text-blue-400">adaptive_filter</span>(signal):</div>
              <div className="pl-8">notch = <span className="text-yellow-300">self</span>.notch_filter(signal, 50)</div>
              <div className="pl-8">denoised = <span className="text-yellow-300">self</span>.wavelet_denoise(notch)</div>
              <div className="pl-8">features = <span className="text-yellow-300">self</span>.extract_features(denoised)</div>
              <div className="pl-8"><span className="text-purple-400">return</span> features</div>
            </div>
          </CodePanel>
        </div>
        <div>
          <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><Code className="w-4 h-4" /> 联邦脑模型学习</h3>
          <CodePanel filename="FederatedBrainLearning.py">
            <div className="text-xs font-mono text-gray-300 space-y-1">
              <div><span className="text-purple-400">def</span> <span className="text-blue-400">client_update</span>(model, data):</div>
              <div className="pl-4"><span className="text-gray-500"># 差分隐私保护</span></div>
              <div className="pl-4">grads = compute_gradients(model, data)</div>
              <div className="pl-4">noisy_grads = add_noise(grads, scale=0.1)</div>
              <div className="pl-4"><span className="text-purple-400">return</span> noisy_grads</div>
            </div>
          </CodePanel>
        </div>
      </div>
    </motion.div>
  );
}

// --- Chapter 4: Applications ---
function ChapterFour() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="green" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-green-300 mb-4">第四章：应用场景与产业化路径</h1>
        <p className="text-gray-300">医疗先行、教育突破、工业深化、消费普及。</p>
      </NeonBorder>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FuturisticPanel title="教育增强解决方案">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="text-cyan-400 mt-1" />
              <div>
                <div className="font-bold text-gray-200">K-12 专注力训练</div>
                <div className="text-xs text-gray-400">通过神经反馈游戏帮助提升注意力</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="text-cyan-400 mt-1" />
              <div>
                <div className="font-bold text-gray-200">高等教育认知增强</div>
                <div className="text-xs text-gray-400">识别困惑点，提供针对性解释与强化</div>
              </div>
            </div>
          </div>
        </FuturisticPanel>

        <CodePanel filename="PersonalizedLearningEngine.py">
          <div className="text-xs font-mono text-gray-300 space-y-1">
            <div><span className="text-purple-400">if</span> cognitive_load &gt; 0.85:</div>
            <div className="pl-4">content = simplify_content(difficulty=0.5)</div>
            <div className="pl-4">mode = <span className="text-green-300">"visual_summary"</span></div>
            <div><span className="text-purple-400">elif</span> attention &lt; 0.4:</div>
            <div className="pl-4">content = increase_interactivity()</div>
            <div className="pl-4">mode = <span className="text-green-300">"gamified"</span></div>
          </div>
        </CodePanel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FuturisticPanel title="消费级应用：日常认知助手">
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex justify-between"><span>早晨唤醒</span> <span className="text-green-400">优化清醒状态</span></li>
            <li className="flex justify-between"><span>深度工作</span> <span className="text-green-400">专注力增强</span></li>
            <li className="flex justify-between"><span>睡眠准备</span> <span className="text-green-400">放松与助眠</span></li>
          </ul>
        </FuturisticPanel>
        <CodePanel filename="DailyCognitiveAssistant.py">
          <div className="text-xs font-mono text-gray-300 space-y-1">
            <div><span className="text-purple-400">if</span> context.is_work_time():</div>
            <div className="pl-4"><span className="text-purple-400">if</span> focus &lt; 0.7:</div>
            <div className="pl-8">apply_focus_enhancement()</div>
            <div><span className="text-purple-400">if</span> context.is_sleep_time():</div>
            <div className="pl-4">apply_relaxation_protocol()</div>
          </div>
        </CodePanel>
      </div>
    </motion.div>
  );
}

// --- Chapter 5: Ethics (Re-integrated) ---
function ChapterFive() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="red" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-red-300 mb-4">第五章：伦理框架与治理结构</h1>
        <p className="text-gray-300">七项核心伦理原则：自主性、隐私性、公平性、安全性、透明性、受益性、可逆性。</p>
      </NeonBorder>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ConceptCard title="自主性" subtitle="用户控制权" color="blue" items={[]} icon={<UserCheck />} />
        <ConceptCard title="隐私性" subtitle="神经数据保护" color="purple" items={[]} icon={<Lock />} />
        <ConceptCard title="公平性" subtitle="普惠技术" color="green" items={[]} icon={<Scale />} />
        <ConceptCard title="安全性" subtitle="不可逾越红线" color="red" items={[]} icon={<Shield />} />
      </div>
      <CodePanel filename="AIPiEthicsFramework.py">
        <div className="text-xs font-mono text-gray-300 space-y-1">
          <div><span className="text-purple-400">if</span> compliance_score &lt; 0.8:</div>
          <div className="pl-4">violations.append(<span className="text-green-300">"Ethics Violation"</span>)</div>
          <div className="pl-4">block_action()</div>
        </div>
      </CodePanel>
    </motion.div>
  );
}

// --- Chapter 6: Roadmap (Re-integrated) ---
function ChapterSix() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="orange" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-orange-300 mb-4">第六章：研发路线图</h1>
        <p className="text-gray-300">基础突破(2026-27) &rarr; 技术融合(2028-29) &rarr; 生态成熟(2030+)</p>
      </NeonBorder>
      <div className="space-y-4">
        <LayerRow title="2026-2027 基础突破" desc="核心硬件研发，医疗验证试点，标准体系建立" icon={<Flag />} color="blue" />
        <LayerRow title="2028-2029 技术融合" desc="多模态集成，消费产品开发，教育应用推广" icon={<RefreshCw />} color="purple" />
        <LayerRow title="2030-2035 生态成熟" desc="全球脑网络，认知增强普及，社会融合深化" icon={<Globe />} color="green" />
      </div>
    </motion.div>
  );
}

// --- Chapter 7: Business (Re-integrated) ---
function ChapterSeven() {
  const data = [{ name: '2026', v: 50 }, { name: '2029', v: 2000 }, { name: '2031', v: 8000 }, { name: '2035', v: 50000 }];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      <NeonBorder color="green" intensity="medium" className="p-8">
        <h1 className="text-3xl font-bold text-green-300 mb-4">第七章：商业价值与未来愿景</h1>
        <p className="text-gray-300">万亿级蓝海市场，负责任的商业创新。</p>
      </NeonBorder>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FuturisticPanel title="营收预测 (百万元)">
          <ChartContainer height={192}>
            {(w, h) => (
              <AreaChart width={w} height={h} data={data}><XAxis dataKey="name" /><YAxis /><Area type="monotone" dataKey="v" stroke="#82ca9d" fill="#82ca9d" /></AreaChart>
            )}
          </ChartContainer>
        </FuturisticPanel>
        <div className="space-y-4">
          <LayerRow title="短期 (3年)" desc="医疗康复：改变瘫痪患者命运" icon={<Heart />} color="red" />
          <LayerRow title="中期 (5-7年)" desc="教育消费：提升认知效率" icon={<Zap />} color="yellow" />
          <LayerRow title="长期 (10年+)" desc="创新平台：人机共生新纪元" icon={<Rocket />} color="purple" />
        </div>
      </div>
    </motion.div>
  );
}

// --- Shared Components ---

interface ConceptCardProps {
  title: string;
  subtitle: string;
  items: string[];
  color: 'blue' | 'purple' | 'green' | 'red';
  icon: React.ReactNode;
}

type ColorMap = {
  [key: string]: string;
};

function ConceptCard({ title, subtitle, items, color, icon }: ConceptCardProps) {
  const colors: ColorMap = {
    blue: "border-blue-500/30 bg-blue-900/10 text-blue-300",
    purple: "border-purple-500/30 bg-purple-900/10 text-purple-300",
    green: "border-green-500/30 bg-green-900/10 text-green-300",
    red: "border-red-500/30 bg-red-900/10 text-red-300",
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[color]} hover:scale-105 transition-transform`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-full bg-gray-800">{icon}</div>
        <div>
          <div className="font-bold text-lg">{title}</div>
          <div className="text-xs opacity-70">{subtitle}</div>
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-xs opacity-80 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-current" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface LayerRowProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: 'blue' | 'cyan' | 'purple' | 'green' | 'orange' | 'red' | 'yellow';
}

function LayerRow({ title, desc, icon, color }: LayerRowProps) {
  const colors: ColorMap = {
    blue: "text-blue-400 border-blue-500/30",
    cyan: "text-cyan-400 border-cyan-500/30",
    purple: "text-purple-400 border-purple-500/30",
    green: "text-green-400 border-green-500/30",
    orange: "text-orange-400 border-orange-500/30",
    red: "text-red-400 border-red-500/30",
    yellow: "text-yellow-400 border-yellow-500/30",
  };
  return (
    <div className={`flex items-center gap-4 p-3 rounded border bg-gray-900/30 ${colors[color].split(' ')[1]}`}>
      <div className={`p-2 rounded-lg bg-gray-800 ${colors[color].split(' ')[0]}`}>{icon}</div>
      <div>
        <div className="font-bold text-gray-200">{title}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </div>
  );
}

interface SignalTypeRowProps {
  type: string;
  res: string;
  invas: string;
  app: string;
}

function SignalTypeRow({ type, res, invas, app }: SignalTypeRowProps) {
  return (
    <div className="grid grid-cols-4 gap-2 text-xs border-b border-gray-800 pb-2 mb-2 last:border-0">
      <div className="font-bold text-cyan-300">{type}</div>
      <div className="text-gray-400">{res}</div>
      <div className="text-gray-400">{invas}</div>
      <div className="text-gray-300">{app}</div>
    </div>
  );
}

interface CodePanelProps {
  children: React.ReactNode;
  filename: string;
}

function CodePanel({ children, filename }: CodePanelProps) {
  return <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden font-mono text-sm shadow-inner"><div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2"><div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50" /></div><span className="text-xs text-gray-500 ml-2">{filename}</span></div><div className="p-4 overflow-x-auto">{children}</div></div>;
}
