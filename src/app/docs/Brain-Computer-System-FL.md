# Brain-Computer-System 脑机领域专业术语表

**适配场景**：技术研发、论文撰写、场景落地、行业交流，涵盖接口/算法/硬件/应用全领域，可直接复制使用，也可一键转换为Word文档（附转换方法）。

## 一、核心基础术语

| 英文（缩写） | 中文 | 备注 |
|--------------|------|------|
| Brain-Computer System (BCS) | 脑机系统 | 全域通用核心术语 |
| Brain-Computer Interface (BCI) | 脑机接口 | 脑机系统的核心底层技术 |
| Brain-Computer Interaction (BCI) | 脑机交互 | 含主动/被动交互模式 |
| Brain-Computer Fusion (BCF) | 脑机融合 | 脑机协同的高阶形态 |
| Neural Interface (NI) | 神经接口 | 脑机接口的广义统称 |
| Brain Signal | 脑信号 | 脑机系统的核心输入源 |
| Human-Machine Interaction (HMI) | 人机交互 | 脑机交互的上位概念 |
| Brain-Computer Interface System (BCIS) | 脑机接口系统 | 含采集/处理/输出全模块 |
| Neuroengineering | 神经工程 | 脑机领域的交叉学科 |
| Cognitive Neuroscience | 认知神经科学 | 支撑脑机技术的基础学科 |

## 二、脑机接口（BCI）核心分类

### 2.1 按植入方式（最主流分类）

| 英文（缩写） | 中文 | 适用场景 |
|--------------|------|----------|
| Invasive BCI | 侵入式脑机接口 | 颅内植入，高精度医疗场景 |
| Semi-invasive BCI / Percutaneous BCI | 半侵入式脑机接口 | 颅骨下/硬膜外，兼顾精度与安全性 |
| Non-invasive BCI | 非侵入式脑机接口 | 头皮外采集，民用/轻医疗场景 |
| Minimally invasive BCI | 微创式脑机接口 | 微针/光纤植入，新兴研究方向 |

### 2.2 按脑信号类型

| 英文（缩写） | 中文 | 核心特征 |
|--------------|------|----------|
| EEG-Based BCI | 基于脑电图的脑机接口 | 非侵入式，工业界最常用 |
| ECoG-Based BCI (Electrocorticography) | 基于皮层脑电图的脑机接口 | 半侵入式，高时空分辨率 |
| LFP-Based BCI (Local Field Potential) | 基于局部场电位的脑机接口 | 侵入式，神经元集群信号采集 |
| Spike-Based BCI / Single-Neuron Activity BCI | 基于锋电位的脑机接口 | 侵入式，最高精度，单细胞信号采集 |
| fNIRS-Based BCI (functional Near-Infrared Spectroscopy) | 基于功能性近红外光谱的脑机接口 | 非侵入式，血氧信号采集，无电干扰 |
| fMRI-Based BCI (functional Magnetic Resonance Imaging) | 基于功能磁共振的脑机接口 | 非侵入式，脑区定位精准，设备体积大 |
| MEG-Based BCI (Magnetoencephalography) | 基于脑磁图的脑机接口 | 非侵入式，无电极接触，时空分辨率高 |

### 2.3 按交互模式

| 英文 | 中文 | 核心逻辑 |
|------|------|----------|
| Active BCI | 主动式脑机接口 | 依赖用户主动认知操作（如想象运动、思维指令） |
| Passive BCI | 被动式脑机接口 | 捕获用户无意识脑信号（如情绪、注意力、疲劳度） |
| Reactive BCI | 反应式脑机接口 | 响应外部刺激产生的脑信号（如视觉/听觉诱发电位） |
| Hybrid BCI | 混合式脑机接口 | 融合两种及以上脑信号/交互模式，提升鲁棒性 |

## 三、脑电信号处理全流程术语

### 3.1 信号采集

| 英文（缩写） | 中文 |
|--------------|------|
| Signal Acquisition | 信号采集 |
| Electrodes | 电极 |
| Scalp Electrodes | 头皮电极（非侵入式） |
| Intracranial Electrodes | 颅内电极（侵入式） |
| Electrode Array | 电极阵列 |
| Sampling Rate | 采样率 |
| Signal Amplification | 信号放大 |
| Analog-to-Digital Conversion (ADC) | 模数转换 |
| Baseline Drift | 基线漂移 |
| Artifact | 伪迹 |
| Ocular Artifact (OA) | 眼电伪迹 |
| Electromyographic Artifact (EMA) | 肌电伪迹 |
| Electrocardiographic Artifact (ECA) | 心电伪迹 |

### 3.2 信号预处理

| 英文（缩写） | 中文 |
|--------------|------|
| Signal Preprocessing | 信号预处理 |
| Filtering | 滤波 |
| Band-Pass Filter | 带通滤波 |
| Low-Pass Filter | 低通滤波 |
| High-Pass Filter | 高通滤波 |
| Notch Filter | 陷波滤波（主流50/60Hz工频去噪） |
| Denoising | 去噪 |
| Independent Component Analysis (ICA) | 独立成分分析（伪迹分离核心算法） |
| Principal Component Analysis (PCA) | 主成分分析（降维+辅助去噪） |
| Signal Segmentation | 信号分段 |
| Normalization | 归一化 |
| Baseline Correction | 基线校正 |

### 3.3 特征提取与选择

| 英文（缩写） | 中文 |
|--------------|------|
| Feature Extraction | 特征提取 |
| Feature Selection | 特征选择 |
| Time Domain Feature | 时域特征 |
| Frequency Domain Feature | 频域特征 |
| Time-Frequency Domain Feature | 时频域特征 |
| Amplitude | 幅值 |
| Mean Value | 均值 |
| Variance | 方差 |
| Peak Value | 峰值 |
| Power Spectral Density (PSD) | 功率谱密度 |
| Band Power | 频段功率（如α/β/θ/γ波功率） |
| Event-Related Potential (ERP) | 事件相关电位 |
| P300 Potential | P300诱发电位（视觉刺激相关核心电位） |
| Steady-State Visual Evoked Potential (SSVEP) | 稳态视觉诱发电位 |
| Motor Imagery (MI) | 运动想象（BCI核心特征源） |
| Event-Related Desynchronization (ERD) | 事件相关去同步 |
| Event-Related Synchronization (ERS) | 事件相关同步 |

### 3.4 特征分类与解码

| 英文（缩写） | 中文 |
|--------------|------|
| Feature Classification | 特征分类 |
| Signal Decoding | 信号解码 |
| Classification Accuracy | 分类准确率 |
| Decoding Efficiency | 解码效率 |
| Prediction | 预测 |
| Labeled Data | 标注数据 |
| Unlabeled Data | 未标注数据 |

## 四、脑机领域核心算法

### 4.1 特征提取算法

| 英文（缩写） | 中文 | 核心应用 |
|--------------|------|----------|
| Fast Fourier Transform (FFT) | 快速傅里叶变换 | 频域特征提取，基础算法 |
| Wavelet Transform (WT) / Continuous Wavelet Transform (CWT) | 小波变换/连续小波变换 | 时频域特征提取，适配非平稳脑信号 |
| Short-Time Fourier Transform (STFT) | 短时傅里叶变换 | 非平稳信号时频分析，时间分辨率固定 |
| Empirical Mode Decomposition (EMD) | 经验模态分解 | 复杂脑信号自适应分解 |
| ICA/PCA | 独立成分分析/主成分分析 | 特征降维+伪迹分离 |

### 4.2 分类识别算法（核心解码算法）

| 英文（缩写） | 中文 | 适用场景 |
|--------------|------|----------|
| Support Vector Machine (SVM) | 支持向量机 | 小样本、高维特征分类，BCI工业界主流 |
| Artificial Neural Network (ANN) | 人工神经网络 | 复杂非线性特征解码 |
| Convolutional Neural Network (CNN) | 卷积神经网络 | 基于脑电信号时空特征提取与分类 |
| Recurrent Neural Network (RNN) / Long Short-Term Memory (LSTM) | 循环神经网络/长短期记忆网络 | 时序脑电信号解码，适配连续指令 |
| Transformer | 变换器 | 长序列脑电信号特征提取，前沿研究方向 |
| K-Nearest Neighbor (KNN) | K近邻算法 | 简单特征快速分类，适合轻量化部署 |
| Linear Discriminant Analysis (LDA) | 线性判别分析 | 线性特征分类，计算量小，实时性高 |
| Random Forest (RF) | 随机森林 | 高维特征降维+分类，抗过拟合能力强 |
| Naive Bayes (NB) | 朴素贝叶斯 | 概率型特征分类，适用于简单特征场景 |

### 4.3 信号处理与优化算法

| 英文（缩写） | 中文 | 核心作用 |
|--------------|------|----------|
| Adaptive Filtering | 自适应滤波 | 动态去噪，适配脑信号实时变化 |
| Particle Swarm Optimization (PSO) | 粒子群优化 | 算法参数寻优、特征选择 |
| Genetic Algorithm (GA) | 遗传算法 | 全局优化，适配特征选择/模型结构优化 |
| Bayesian Optimization | 贝叶斯优化 | 小样本下模型超参数高效调优 |
| Reinforcement Learning (RL) | 强化学习 | 脑机交互策略优化、自适应解码 |

## 五、硬件与系统组件

### 5.1 信号采集硬件

| 英文（缩写） | 中文 |
|--------------|------|
| BCI Acquisition System | BCI采集系统 |
| EEG Amplifier | 脑电放大器 |
| Portable EEG Device | 便携式脑电设备 |
| Wireless EEG System | 无线脑电系统 |
| Implantable Neural Recorder | 植入式神经记录器 |
| Optrode | 光电极（光遗传结合专用） |
| Microelectrode Array (MEA) | 微电极阵列（侵入式BCI核心硬件） |

### 5.2 信号处理与控制模块

| 英文（缩写） | 中文 |
|--------------|------|
| Signal Processing Unit (SPU) | 信号处理单元 |
| Microcontroller Unit (MCU) | 微控制单元 |
| Field-Programmable Gate Array (FPGA) | 现场可编程门阵列 |
| Central Processing Unit (CPU) | 中央处理器 |
| Graphics Processing Unit (GPU) | 图形处理器（算法加速） |
| Edge Computing Module | 边缘计算模块 |
| Cloud Computing Platform | 云计算平台 |

### 5.3 输出与交互外设

| 英文 | 中文 |
|------|------|
| Actuator | 执行器 |
| Brain-Controlled Robot | 脑控机器人 |
| Brain-Controlled Prosthesis | 脑控假肢 |
| Brain-Controlled Wheelchair | 脑控轮椅 |
| Virtual Reality (VR) Device | 虚拟现实设备 |
| Augmented Reality (AR) Device | 增强现实设备 |
| Haptic Feedback Device | 触觉反馈设备 |
| Neurofeedback Device | 神经反馈设备 |

### 5.4 植入式器件核心组件

| 英文 | 中文 |
|------|------|
| Biocompatible Material | 生物相容性材料 |
| Neural Implant | 神经植入体 |
| Stimulation Electrode | 刺激电极 |
| Wireless Transceiver | 无线收发器 |
| Power Management Unit (PMU) | 电源管理单元 |
| Biofuel Cell | 生物燃料电池（植入式设备自供电前沿） |

## 六、核心应用场景

### 6.1 医疗康复（最成熟场景）

| 英文（缩写） | 中文 | 应用方向 |
|--------------|------|----------|
| Neurorehabilitation | 神经康复 | 脑卒中、脊髓损伤、脑瘫患者运动功能恢复 |
| Motor Impairment | 运动功能障碍 | 肢体运动重建、自主行为能力恢复 |
| Brain-Controlled Prosthetics | 脑控假肢 | 上肢/下肢假肢精准操控、体感反馈 |
| Assistive Technology | 辅助技术 | 渐冻症/闭锁综合征患者沟通渠道搭建 |
| Augmentative and Alternative Communication (AAC) | 增强与替代沟通 | 脑控文字/语音输出、意念打字 |
| Epilepsy Monitoring | 癫痫监测 | 脑电信号实时采集、癫痫发作预警 |
| Parkinson's Disease | 帕金森病 | 脑电信号调控+电刺激治疗 |
| Deep Brain Stimulation (DBS) | 脑深部电刺激 | 帕金森/癫痫/强迫症的侵入式治疗 |
| Transcranial Magnetic Stimulation (TMS) | 经颅磁刺激 | 非侵入式神经调控，认知/运动功能修复 |
| Transcranial Direct Current Stimulation (tDCS) | 经颅直流电刺激 | 轻中度认知障碍、抑郁症辅助治疗 |

### 6.2 人机交互与智能控制

| 英文 | 中文 | 应用方向 |
|------|------|----------|
| Brain-Controlled Human-Machine Interaction | 脑控人机交互 | 无接触设备操控、意念指令执行 |
| Brain-Controlled UI/UX | 脑控界面/用户体验 | 脑电信号驱动的智能界面适配 |
| Brain-Controlled Drone | 脑控无人机 | 无人机自主飞行、精准操控 |
| Brain-Controlled Vehicle | 脑控车辆 | 智能汽车脑电辅助驾驶、无人车操控 |
| Brain-Computer Gaming | 脑机游戏 | 意念操控游戏角色、脑电驱动游戏交互 |
| Neuroergonomics | 神经工效学 | 优化人机系统的脑机适配性与操作效率 |

### 6.3 认知与神经调控

| 英文（缩写） | 中文 | 应用方向 |
|--------------|------|----------|
| Cognitive Enhancement | 认知增强 | 注意力、记忆力、学习能力提升 |
| Attention Monitoring | 注意力监测 | 教育/工业场景的注意力状态实时评估 |
| Emotion Recognition | 情绪识别 | 脑电信号驱动的情绪感知与分类 |
| Mental Fatigue Detection | 脑力疲劳检测 | 工业/航空/电竞场景的疲劳度预警 |
| Neurofeedback Training (NFT) | 神经反馈训练 | 注意力/情绪/睡眠调控、心理干预 |
| Sleep Monitoring | 睡眠监测 | 脑电信号分析睡眠阶段、睡眠质量评估 |

### 6.4 工业/军事/航空航天

| 英文 | 中文 | 应用方向 |
|------|------|----------|
| Industrial BCI Application | 脑机工业应用 | 工业机器人脑控、无人设备远程操作 |
| Military BCI Application | 脑机军事应用 | 单兵装备脑控、战场态势感知、无人作战平台操控 |
| Aerospace BCI Application | 脑机航空航天应用 | 航天员脑电监测、航天器辅助操控、太空环境适应评估 |
| Human Factors Engineering | 人因工程 | 提升复杂系统的人机协同效率与安全性 |

### 6.5 消费电子与日常应用

| 英文 | 中文 | 应用方向 |
|------|------|----------|
| Consumer BCI Device | 消费级脑机设备 | 脑电耳机、专注力手环、睡眠仪、情绪监测设备 |
| Brain-Controlled Smart Home | 脑控智能家居 | 意念操控家电、智能环境自适应调节 |
| BCI in Education | 脑机教育应用 | 学生学习状态监测、个性化教学适配、专注力训练 |
| BCI in Sports | 脑机体育应用 | 运动员心理状态调控、训练效果评估、竞技状态优化 |

## 七、前沿研究方向术语

| 英文（缩写） | 中文 | 研究核心 |
|--------------|------|----------|
| Brain-Machine-Brain Interface (BMBI) | 脑-机-脑接口 | 双向信息传输（感知反馈+运动指令），跨主体脑机交互 |
| Closed-Loop BCI | 闭环脑机接口 | 信号采集-解码-输出-反馈的闭环实时调控 |
| Optogenetics | 光遗传学 | 光控神经元精准激活/抑制，侵入式BCI前沿核心技术 |
| Neuroprosthetics | 神经假肢 | 与神经系统深度融合的智能假肢，实现体感与运动一体化 |
| Digital Brain Twin | 数字孪生脑 | 人脑的数字化建模与仿真，适配BCI个性化设计 |
| Brain Cloud System | 脑机云系统 | 脑电信号的云端存储、分布式处理与共享 |
| Non-invasive Brain Stimulation (NIBS) | 非侵入式神经调控 | TMS/tDCS等技术的临床转化与民用落地 |
| Brain Connectome | 脑连接组 | 脑区神经连接图谱构建，解析脑信号产生机制 |
| Neuromorphic Computing | 神经形态计算 | 模拟人脑的计算架构，适配BCI信号实时处理 |
| Brain-Computer Symbiosis | 脑机共生 | 人脑与机器的深度融合，实现智能协同增强 |
| Ethical and Legal Issues of BCI | 脑机接口伦理与法律问题 | 脑信号隐私、技术滥用、人权保障相关研究 |

## 八、脑机领域常用缩写对照表

| 缩写 | 英文全称 | 中文 |
|------|----------|------|
| BCI | Brain-Computer Interface | 脑机接口 |
| BCS | Brain-Computer System | 脑机系统 |
| EEG | Electroencephalography | 脑电图 |
| ECoG | Electrocorticography | 皮层脑电图 |
| LFP | Local Field Potential | 局部场电位 |
| fNIRS | functional Near-Infrared Spectroscopy | 功能性近红外光谱 |
| fMRI | functional Magnetic Resonance Imaging | 功能磁共振 |
| MEG | Magnetoencephalography | 脑磁图 |
| ERP | Event-Related Potential | 事件相关电位 |
| SSVEP | Steady-State Visual Evoked Potential | 稳态视觉诱发电位 |
| MI | Motor Imagery | 运动想象 |
| ERD | Event-Related Desynchronization | 事件相关去同步 |
| ERS | Event-Related Synchronization | 事件相关同步 |
| ICA | Independent Component Analysis | 独立成分分析 |
| PCA | Principal Component Analysis | 主成分分析 |
| SVM | Support Vector Machine | 支持向量机 |
| CNN | Convolutional Neural Network | 卷积神经网络 |
| LSTM | Long Short-Term Memory | 长短期记忆网络 |
| FFT | Fast Fourier Transform | 快速傅里叶变换 |
| DBS | Deep Brain Stimulation | 脑深部电刺激 |
| TMS | Transcranial Magnetic Stimulation | 经颅磁刺激 |
| tDCS | Transcranial Direct Current Stimulation | 经颅直流电刺激 |
| MEA | Microelectrode Array | 微电极阵列 |
| FPGA | Field-Programmable Gate Array | 现场可编程门阵列 |
| NFT | Neurofeedback Training | 神经反馈训练 |
| BMBI | Brain-Machine-Brain Interface | 脑-机-脑接口 |
| NIBS | Non-invasive Brain Stimulation | 非侵入式神经调控 |
| ADC | Analog-to-Digital Conversion | 模数转换 |
| PSD | Power Spectral Density | 功率谱密度 |
| SPU | Signal Processing Unit | 信号处理单元 |
| MCU | Microcontroller Unit | 微控制单元 |
| GPU | Graphics Processing Unit | 图形处理器 |
| HMI | Human-Machine Interaction | 人机交互 |
| AAC | Augmentative and Alternative Communication | 增强与替代沟通 |
| PMU | Power Management Unit | 电源管理单元 |

---
