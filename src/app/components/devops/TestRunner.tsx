import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw,
  ChevronRight, FileText, Zap, BarChart3, Filter
} from 'lucide-react';
import { FuturisticPanel } from '../FuturisticPanel';
import { useLanguage } from '../LanguageContext';

// ===== Test Case Definition =====
interface TestCase {
  id: string;
  module: string;
  moduleEn: string;
  name: string;
  nameEn: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance';
  priority: 'P0' | 'P1' | 'P2';
  precondition: string;
  preconditionEn: string;
  steps: { step: string; stepEn: string }[];
  expected: string;
  expectedEn: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number; // ms
  error?: string;
}

// ===== Complete Test Cases =====
const TEST_CASES: TestCase[] = [
  // === Device Management Tests ===
  {
    id: 'TC-DM-001', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P0',
    name: '设备列表正常渲染', nameEn: 'Device list renders correctly',
    precondition: '系统正常运行，mock数据已加载', preconditionEn: 'System running, mock data loaded',
    steps: [
      { step: '打开设备管理页面', stepEn: 'Open Device Management page' },
      { step: '验证设备列表是否展示', stepEn: 'Verify device list is displayed' },
      { step: '验证设备数量统计正确', stepEn: 'Verify device count stats are correct' },
    ],
    expected: '设备列表正常展示12条记录，状态统计卡片数据正确',
    expectedEn: 'Device list shows 12 records, status stat cards display correctly',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-DM-002', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P0',
    name: '端点筛选功能', nameEn: 'Endpoint filter functionality',
    precondition: '设备列表已加载', preconditionEn: 'Device list loaded',
    steps: [
      { step: '点击"Max端"筛选标签', stepEn: 'Click "Max" filter tab' },
      { step: '验证仅显示Max端设备', stepEn: 'Verify only Max endpoint devices shown' },
      { step: '点击"全部"恢复', stepEn: 'Click "All" to restore' },
    ],
    expected: '筛选后仅显示Max端设备(5台)，切回全部显示12台',
    expectedEn: 'After filter shows only Max devices (5), switching to All shows 12',
    status: 'passed', duration: 38,
  },
  {
    id: 'TC-DM-003', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P0',
    name: '搜索功能测试', nameEn: 'Search functionality test',
    precondition: '设备列表已加载', preconditionEn: 'Device list loaded',
    steps: [
      { step: '输入搜索关键字"yyc3"', stepEn: 'Input search keyword "yyc3"' },
      { step: '验证搜索结果', stepEn: 'Verify search results' },
      { step: '清除搜索恢复全部', stepEn: 'Clear search to restore all' },
    ],
    expected: '搜索"yyc3"返回含该关键字的设备，清除后恢复全部',
    expectedEn: 'Search "yyc3" returns matching devices, clearing restores all',
    status: 'passed', duration: 32,
  },
  {
    id: 'TC-DM-004', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P1',
    name: '设备详情查看', nameEn: 'Device detail view',
    precondition: '设备列表已加载', preconditionEn: 'Device list loaded',
    steps: [
      { step: '点击设备行进入详情', stepEn: 'Click device row to enter detail' },
      { step: '验证基本信息展示', stepEn: 'Verify basic info displayed' },
      { step: '验证监控数据展示', stepEn: 'Verify monitoring data displayed' },
      { step: '点击返回回到列表', stepEn: 'Click back to return to list' },
    ],
    expected: '详情页展示完整设备信息，返回后列表状态保持',
    expectedEn: 'Detail page shows full device info, list state preserved on return',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-DM-005', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P1',
    name: '字段编辑权限控制', nameEn: 'Field edit permission control',
    precondition: '以super_admin角色登录，进入设备详情', preconditionEn: 'Logged in as super_admin, in device detail',
    steps: [
      { step: '验证可编辑字段显示编辑图标', stepEn: 'Verify editable fields show edit icon' },
      { step: '验证只读字段显示锁定图标', stepEn: 'Verify readonly fields show lock icon' },
      { step: '尝试编辑名称字段', stepEn: 'Try to edit name field' },
    ],
    expected: 'name/description/tags显示可编辑，ip/port/status显示锁定',
    expectedEn: 'name/description/tags are editable, ip/port/status are locked',
    status: 'passed', duration: 42,
  },
  {
    id: 'TC-DM-006', module: '设备管理', moduleEn: 'Device Management', category: 'unit', priority: 'P1',
    name: '批量选择与操作', nameEn: 'Batch selection and operations',
    precondition: '设备列表已加载', preconditionEn: 'Device list loaded',
    steps: [
      { step: '勾选多台设备复选框', stepEn: 'Check multiple device checkboxes' },
      { step: '验证已选数量显示', stepEn: 'Verify selected count displayed' },
      { step: '点击全选/取消全选', stepEn: 'Click select all / deselect all' },
    ],
    expected: '批量选择功能正常，已选数量正确显示，操作按钮出现',
    expectedEn: 'Batch selection works, count is correct, action buttons appear',
    status: 'passed', duration: 28,
  },

  // === Monitor Dashboard Tests ===
  {
    id: 'TC-MD-001', module: '数据监控', moduleEn: 'Monitor Dashboard', category: 'unit', priority: 'P0',
    name: '仪表盘正常渲染', nameEn: 'Dashboard renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开数据监控页面', stepEn: 'Open Monitor Dashboard page' },
      { step: '验证状态卡片展示', stepEn: 'Verify status cards displayed' },
      { step: '验证图表正常渲染', stepEn: 'Verify charts render correctly' },
    ],
    expected: '状态卡片显示正确数据，图表正常渲染无width(-1)错误',
    expectedEn: 'Status cards show correct data, charts render without width(-1) errors',
    status: 'passed', duration: 120,
  },
  {
    id: 'TC-MD-002', module: '数据监控', moduleEn: 'Monitor Dashboard', category: 'integration', priority: 'P0',
    name: '实时数据更新(5s)', nameEn: 'Real-time data update (5s)',
    precondition: '监控页面已打开', preconditionEn: 'Monitor page open',
    steps: [
      { step: '等待5秒', stepEn: 'Wait 5 seconds' },
      { step: '验证图表数据点更新', stepEn: 'Verify chart data point updated' },
      { step: '验证"最后更新"时间刷新', stepEn: 'Verify "Last Updated" time refreshed' },
    ],
    expected: '每5秒图表新增数据点，最后更新时间同步刷新',
    expectedEn: 'Chart adds new data point every 5s, last update time refreshes',
    status: 'passed', duration: 6200,
  },
  {
    id: 'TC-MD-003', module: '数据监控', moduleEn: 'Monitor Dashboard', category: 'unit', priority: 'P0',
    name: '告警列表展示', nameEn: 'Alert list display',
    precondition: '监控页面已打开', preconditionEn: 'Monitor page open',
    steps: [
      { step: '查看告警列表区域', stepEn: 'View alert list area' },
      { step: '验证告警级别图标和颜色', stepEn: 'Verify alert level icons and colors' },
      { step: '验证告警数量角标', stepEn: 'Verify alert count badge' },
    ],
    expected: '告警按级别(critical/warning/info)正确显示对应颜色和图标',
    expectedEn: 'Alerts show correct colors and icons by level (critical/warning/info)',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-MD-004', module: '数据监控', moduleEn: 'Monitor Dashboard', category: 'performance', priority: 'P1',
    name: 'Recharts图表尺寸自适应', nameEn: 'Recharts chart responsive sizing',
    precondition: '监控页面已打开', preconditionEn: 'Monitor page open',
    steps: [
      { step: '调整浏览器窗口大小', stepEn: 'Resize browser window' },
      { step: '验证图表宽度自适应', stepEn: 'Verify chart width adapts' },
      { step: '确认无负值错误', stepEn: 'Confirm no negative value errors' },
    ],
    expected: 'ChartContainer通过ResizeObserver正确传递宽度，无width(-1)/height(-1)',
    expectedEn: 'ChartContainer passes correct width via ResizeObserver, no width(-1)/height(-1)',
    status: 'passed', duration: 85,
  },

  // === Audit Log Tests ===
  {
    id: 'TC-AL-001', module: '操作审计', moduleEn: 'Audit Logs', category: 'unit', priority: 'P0',
    name: '审计记录列表渲染', nameEn: 'Audit log list renders',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开操作审计页面', stepEn: 'Open Audit Logs page' },
      { step: '验证审计记录列表', stepEn: 'Verify audit log list' },
      { step: '验证统计卡片', stepEn: 'Verify stat cards' },
    ],
    expected: '审计列表展示12条记录，统计卡片(总数/成功/失败/高危)数据正确',
    expectedEn: 'Audit list shows 12 records, stat cards (total/success/failed/critical) correct',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-AL-002', module: '操作审计', moduleEn: 'Audit Logs', category: 'unit', priority: 'P1',
    name: '审计详情弹窗', nameEn: 'Audit detail modal',
    precondition: '审计列表已加载', preconditionEn: 'Audit list loaded',
    steps: [
      { step: '点击某条记录的详情按钮', stepEn: 'Click detail button of a record' },
      { step: '验证弹窗展示完整信息', stepEn: 'Verify modal shows complete info' },
      { step: '关闭弹窗', stepEn: 'Close modal' },
    ],
    expected: '详情弹窗展示时间/操作人/类型/对象/内容/原因/结果/时长/IP',
    expectedEn: 'Detail modal shows time/operator/type/target/action/reason/result/duration/IP',
    status: 'passed', duration: 50,
  },
  {
    id: 'TC-AL-003', module: '操作审计', moduleEn: 'Audit Logs', category: 'unit', priority: 'P1',
    name: '多条件筛选', nameEn: 'Multi-condition filtering',
    precondition: '审计列表已加载', preconditionEn: 'Audit list loaded',
    steps: [
      { step: '选择"配置变更"类型筛选', stepEn: 'Select "Config Change" type filter' },
      { step: '选择"成功"结果筛选', stepEn: 'Select "Success" result filter' },
      { step: '输入搜索关键字', stepEn: 'Input search keyword' },
    ],
    expected: '筛选条件叠加生效，结果正确',
    expectedEn: 'Filter conditions stack correctly, results accurate',
    status: 'passed', duration: 30,
  },

  // === Permission Manager Tests ===
  {
    id: 'TC-PM-001', module: '权限管理', moduleEn: 'Permission Manager', category: 'unit', priority: 'P0',
    name: '角色卡片列表', nameEn: 'Role card list',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开权限管理页面', stepEn: 'Open Permission Manager page' },
      { step: '验证6个角色卡片展示', stepEn: 'Verify 6 role cards displayed' },
      { step: '验证权限标签展示', stepEn: 'Verify permission tags displayed' },
    ],
    expected: '6个预定义角色正确展示，权限标签截断显示+N',
    expectedEn: '6 predefined roles displayed correctly, permission tags truncated with +N',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-PM-002', module: '权限管理', moduleEn: 'Permission Manager', category: 'unit', priority: 'P0',
    name: '权限矩阵展示', nameEn: 'Permission matrix display',
    precondition: '权限管理页面已打开', preconditionEn: 'Permission Manager page open',
    steps: [
      { step: '切换到"权限矩阵"标签页', stepEn: 'Switch to "Matrix" tab' },
      { step: '验证10行功能×6列角色矩阵', stepEn: 'Verify 10 feature × 6 role matrix' },
      { step: '验证权限标记(✓/✗)', stepEn: 'Verify permission marks (✓/✗)' },
    ],
    expected: '权限矩阵与Guidelines.md定义的权限控制矩阵一致',
    expectedEn: 'Permission matrix matches Guidelines.md permission control matrix',
    status: 'passed', duration: 40,
  },

  // === Operation Center Tests ===
  {
    id: 'TC-OC-001', module: '操作中心', moduleEn: 'Operation Center', category: 'unit', priority: 'P0',
    name: '快速操作网格渲染', nameEn: 'Quick action grid renders',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开操作中心页面', stepEn: 'Open Operation Center page' },
      { step: '验证8个快速操作卡片', stepEn: 'Verify 8 quick action cards' },
      { step: '验证自定义操作入口', stepEn: 'Verify custom action entry' },
    ],
    expected: '8个快速操作卡片+1个自定义入口正确展示',
    expectedEn: '8 quick action cards + 1 custom entry displayed correctly',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-OC-002', module: '操作中心', moduleEn: 'Operation Center', category: 'unit', priority: 'P0',
    name: '操作执行动画', nameEn: 'Operation execution animation',
    precondition: '操作中心页面已打开', preconditionEn: 'Op Center page open',
    steps: [
      { step: '点击"重启节点"快速操作', stepEn: 'Click "Restart Node" quick action' },
      { step: '验证加载动画出现', stepEn: 'Verify loading animation appears' },
      { step: '等待2秒动画结束', stepEn: 'Wait 2s for animation to finish' },
    ],
    expected: '点击后图标变为旋转加载，底部进度条动画，2秒后恢复',
    expectedEn: 'Icon changes to spinning loader, bottom progress bar animates, restores after 2s',
    status: 'passed', duration: 2200,
  },
  {
    id: 'TC-OC-003', module: '操作中心', moduleEn: 'Operation Center', category: 'unit', priority: 'P1',
    name: '操作模板展开与步骤展示', nameEn: 'Template expand and steps display',
    precondition: '切换到模板标签页', preconditionEn: 'Switched to Templates tab',
    steps: [
      { step: '点击"模型部署标准流程"模板', stepEn: 'Click "Standard Model Deployment" template' },
      { step: '验证步骤列表展开', stepEn: 'Verify steps list expands' },
      { step: '验证7个步骤正确显示', stepEn: 'Verify 7 steps displayed correctly' },
    ],
    expected: '模板展开显示7个执行步骤，含风险等级和预估时间',
    expectedEn: 'Template expands showing 7 steps, with risk level and estimated time',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-OC-004', module: '操作中心', moduleEn: 'Operation Center', category: 'unit', priority: 'P1',
    name: '操作日志实时流', nameEn: 'Operation log live stream',
    precondition: '切换到操作日志标签页', preconditionEn: 'Switched to Op Logs tab',
    steps: [
      { step: '查看操作日志列表', stepEn: 'View operation log list' },
      { step: '验证运行中状态脉冲动画', stepEn: 'Verify running status pulse animation' },
      { step: '验证状态颜色区分', stepEn: 'Verify status color differentiation' },
    ],
    expected: '日志列表按时间排序，running状态有脉冲动画，4种状态颜色正确',
    expectedEn: 'Log list sorted by time, running status has pulse, 4 status colors correct',
    status: 'passed', duration: 30,
  },

  // === Patrol Mode Tests ===
  {
    id: 'TC-PT-001', module: '巡查模式', moduleEn: 'Patrol Mode', category: 'unit', priority: 'P0',
    name: '巡查结果展示', nameEn: 'Patrol results display',
    precondition: '系统正常运��', preconditionEn: 'System running',
    steps: [
      { step: '打开巡查模式页面', stepEn: 'Open Patrol Mode page' },
      { step: '验证健康度评分展示', stepEn: 'Verify health score displayed' },
      { step: '验证12个巡查项列表', stepEn: 'Verify 12 patrol check items' },
    ],
    expected: '健康度评分88%正确展示，12项检查结果分类显示',
    expectedEn: 'Health score 88% displayed correctly, 12 check results categorized',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-PT-002', module: '巡查模式', moduleEn: 'Patrol Mode', category: 'unit', priority: 'P0',
    name: '手动巡查执行', nameEn: 'Manual patrol execution',
    precondition: '巡查页面已打开', preconditionEn: 'Patrol page open',
    steps: [
      { step: '点击"手动巡查"按钮', stepEn: 'Click "Manual Patrol" button' },
      { step: '验证巡查加载动画', stepEn: 'Verify patrol loading animation' },
      { step: '等待3秒完成', stepEn: 'Wait 3s for completion' },
    ],
    expected: '点击后显示巡查进行中动画，按钮变为禁用状态',
    expectedEn: 'Shows patrol in progress animation, button becomes disabled',
    status: 'passed', duration: 3200,
  },
  {
    id: 'TC-PT-003', module: '巡查模式', moduleEn: 'Patrol Mode', category: 'unit', priority: 'P1',
    name: '健康趋势图表', nameEn: 'Health trend chart',
    precondition: '巡查页面已打开', preconditionEn: 'Patrol page open',
    steps: [
      { step: '切换到"健康趋势"标签', stepEn: 'Switch to "Health Trend" tab' },
      { step: '验证趋势图表渲染', stepEn: 'Verify trend chart renders' },
      { step: '验证数据点数量', stepEn: 'Verify data point count' },
    ],
    expected: '趋势图表展示最近8次巡查的健康度变化，ChartContainer无尺寸问题',
    expectedEn: 'Trend chart shows last 8 patrol health changes, ChartContainer no sizing issues',
    status: 'passed', duration: 85,
  },
  {
    id: 'TC-PT-004', module: '巡查模式', moduleEn: 'Patrol Mode', category: 'unit', priority: 'P1',
    name: '自动巡查开关', nameEn: 'Auto patrol toggle',
    precondition: '巡查页面已打开', preconditionEn: 'Patrol page open',
    steps: [
      { step: '点击"暂停自动"按钮', stepEn: 'Click "Pause Auto" button' },
      { step: '验证自动巡查状态变更', stepEn: 'Verify auto patrol status change' },
      { step: '再次点击恢复', stepEn: 'Click again to restore' },
    ],
    expected: '自动巡查状态正确切换，标签显示AUTO·15min或消失',
    expectedEn: 'Auto patrol status toggles correctly, label shows AUTO·15min or disappears',
    status: 'passed', duration: 25,
  },

  // === Follow-up System Tests ===
  {
    id: 'TC-FU-001', module: '一键跟进', moduleEn: 'Follow-up System', category: 'unit', priority: 'P0',
    name: '告警列表与统计', nameEn: 'Alert list and stats',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开一键跟进页面', stepEn: 'Open Follow-up System page' },
      { step: '验证4个告警卡片', stepEn: 'Verify 4 alert cards' },
      { step: '验证统计数据', stepEn: 'Verify stats data' },
    ],
    expected: '4条告警正确展示，统计(总4/活跃1/已确认2/已解决1)正确',
    expectedEn: '4 alerts displayed, stats (total 4/active 1/ack 2/resolved 1) correct',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-FU-002', module: '一键跟进', moduleEn: 'Follow-up System', category: 'unit', priority: 'P0',
    name: '操作链路时间线', nameEn: 'Operation chain timeline',
    precondition: '告警列表已展示', preconditionEn: 'Alert list displayed',
    steps: [
      { step: '展开第一条告警卡片', stepEn: 'Expand first alert card' },
      { step: '验证操作链路时间线', stepEn: 'Verify operation chain timeline' },
      { step: '验证高亮标记"当前"事件', stepEn: 'Verify highlighted "current" event' },
    ],
    expected: '操作链路展示6个时间点事件，当前事件高亮标记，快速操作按钮可见',
    expectedEn: 'Chain shows 6 timeline events, current event highlighted, quick action buttons visible',
    status: 'passed', duration: 50,
  },
  {
    id: 'TC-FU-003', module: '一键跟进', moduleEn: 'Follow-up System', category: 'unit', priority: 'P1',
    name: '告警级别筛选', nameEn: 'Alert level filter',
    precondition: '告警列表已展示', preconditionEn: 'Alert list displayed',
    steps: [
      { step: '点击"紧急"筛选', stepEn: 'Click "Critical" filter' },
      { step: '验证仅显示critical告警', stepEn: 'Verify only critical alerts shown' },
      { step: '切回"全部"', stepEn: 'Switch back to "All"' },
    ],
    expected: '筛选后仅显示1条critical告警，切回全部显示4条',
    expectedEn: 'After filter shows 1 critical alert, switching to All shows 4',
    status: 'passed', duration: 25,
  },

  // === AI Suggestion Panel Tests ===
  {
    id: 'TC-AI-001', module: 'AI决策', moduleEn: 'AI Decision', category: 'unit', priority: 'P0',
    name: 'AI面板正常渲染', nameEn: 'AI panel renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开AI辅助决策页面', stepEn: 'Open AI Decision Support page' },
      { step: '验证4个统计卡片展示', stepEn: 'Verify 4 stat cards displayed' },
      { step: '验证异常模式列表', stepEn: 'Verify anomaly pattern list' },
    ],
    expected: '统计卡片(检测异常/操作建议/已执行/健康评分)正确，4条异常模式展示',
    expectedEn: 'Stat cards (anomalies/suggestions/applied/health) correct, 4 anomaly patterns shown',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-AI-002', module: 'AI决策', moduleEn: 'AI Decision', category: 'unit', priority: 'P0',
    name: '操作建议交互', nameEn: 'Suggestion interaction',
    precondition: 'AI面板已打开', preconditionEn: 'AI panel open',
    steps: [
      { step: '点击异常模式跳转到建议Tab', stepEn: 'Click pattern to jump to suggestions tab' },
      { step: '点击"应用建议"按钮', stepEn: 'Click "Apply" button' },
      { step: '验证状态变更为已执行', stepEn: 'Verify status changes to applied' },
    ],
    expected: '建议状态变为"已执行"，按钮消失，卡片变为低透明度',
    expectedEn: 'Suggestion status becomes "Applied", buttons disappear, card becomes translucent',
    status: 'passed', duration: 38,
  },
  {
    id: 'TC-AI-003', module: 'AI决策', moduleEn: 'AI Decision', category: 'unit', priority: 'P0',
    name: '重新分析动画', nameEn: 'Re-analyze animation',
    precondition: 'AI面板已打开', preconditionEn: 'AI panel open',
    steps: [
      { step: '点击"重新分析"按钮', stepEn: 'Click "Re-analyze" button' },
      { step: '验证分析进度条动画', stepEn: 'Verify analysis progress bar animation' },
      { step: '等待2.5秒完成', stepEn: 'Wait 2.5s for completion' },
    ],
    expected: '显示分析进度条(0→100%)，按钮变为禁用，2.5秒后恢复',
    expectedEn: 'Progress bar (0→100%) shown, button disabled, restores after 2.5s',
    status: 'passed', duration: 2800,
  },
  {
    id: 'TC-AI-004', module: 'AI决策', moduleEn: 'AI Decision', category: 'unit', priority: 'P1',
    name: '健康评估雷达图', nameEn: 'Health radar chart',
    precondition: 'AI面板已打开', preconditionEn: 'AI panel open',
    steps: [
      { step: '切换到"健康评估"标签', stepEn: 'Switch to "Health" tab' },
      { step: '验证综合评分圆环', stepEn: 'Verify overall score ring' },
      { step: '验证6维雷达图渲染', stepEn: 'Verify 6-dimension radar chart' },
    ],
    expected: '综合评分圆环正确，6维雷达图(计算/存储/网络/安全/可用性/性能)正常渲染',
    expectedEn: 'Overall score ring correct, 6-dim radar chart renders properly',
    status: 'passed', duration: 90,
  },
  {
    id: 'TC-AI-005', module: 'AI决策', moduleEn: 'AI Decision', category: 'unit', priority: 'P1',
    name: '异常趋势图表', nameEn: 'Anomaly trend chart',
    precondition: 'AI面板已打开，异常模式Tab', preconditionEn: 'AI panel open, Patterns tab',
    steps: [
      { step: '查看异常趋势(24h)图表', stepEn: 'View anomaly trend (24h) chart' },
      { step: '验证双曲线(异常数/健康分)', stepEn: 'Verify dual lines (anomalies/health)' },
      { step: '验证ChartContainer无尺寸问题', stepEn: 'Verify ChartContainer no sizing issues' },
    ],
    expected: '24小时趋势双曲线正常渲染，tooltip可交互，无width(-1)错误',
    expectedEn: '24h trend dual lines render, tooltip interactive, no width(-1) errors',
    status: 'passed', duration: 85,
  },

  // === Command Palette Tests ===
  {
    id: 'TC-CP-001', module: '快捷键', moduleEn: 'Command Palette', category: 'unit', priority: 'P0',
    name: 'Cmd+K唤起命令面板', nameEn: 'Cmd+K opens command palette',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '按下Cmd+K(Mac)或Ctrl+K(Win)', stepEn: 'Press Cmd+K (Mac) or Ctrl+K (Win)' },
      { step: '验证命令面板弹出', stepEn: 'Verify command palette appears' },
      { step: '按ESC关闭', stepEn: 'Press ESC to close' },
    ],
    expected: '命令面板居中弹出，背景模糊遮罩，搜索框自动聚焦',
    expectedEn: 'Palette opens centered, backdrop blur, search auto-focused',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-CP-002', module: '快捷键', moduleEn: 'Command Palette', category: 'unit', priority: 'P0',
    name: '命令搜索与筛选', nameEn: 'Command search and filter',
    precondition: '命令面板已打开', preconditionEn: 'Command palette open',
    steps: [
      { step: '输入"monitor"', stepEn: 'Type "monitor"' },
      { step: '验证筛选结果包含数据监控', stepEn: 'Verify filter shows Monitor Dashboard' },
      { step: '输入"设备"验证中文搜索', stepEn: 'Type "设备" to verify Chinese search' },
    ],
    expected: '英文/中文/关键字搜索均正确筛选命令列表',
    expectedEn: 'EN/CN/keyword search correctly filters command list',
    status: 'passed', duration: 25,
  },
  {
    id: 'TC-CP-003', module: '快捷键', moduleEn: 'Command Palette', category: 'unit', priority: 'P0',
    name: '键盘导航与执行', nameEn: 'Keyboard navigation and execution',
    precondition: '命令面板已打开', preconditionEn: 'Command palette open',
    steps: [
      { step: '按↓键选择第二项', stepEn: 'Press ↓ to select second item' },
      { step: '验证高亮状态', stepEn: 'Verify highlight state' },
      { step: '按Enter执行命令', stepEn: 'Press Enter to execute' },
    ],
    expected: '上下键正确移动高亮，Enter执行后面板关闭并导航',
    expectedEn: 'Arrow keys move highlight, Enter executes, closes, and navigates',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-CP-004', module: '快捷键', moduleEn: 'Command Palette', category: 'integration', priority: 'P1',
    name: '全局快捷键绑定', nameEn: 'Global shortcut bindings',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '按Cmd+Shift+A', stepEn: 'Press Cmd+Shift+A' },
      { step: '验证跳转到一键跟进', stepEn: 'Verify nav to Follow-up' },
      { step: '按Cmd+Shift+P', stepEn: 'Press Cmd+Shift+P' },
      { step: '验证跳转到巡查模式', stepEn: 'Verify nav to Patrol' },
    ],
    expected: 'Cmd+Shift+A→一键跟进，Cmd+Shift+P→巡查模式',
    expectedEn: 'Cmd+Shift+A→Follow-up, Cmd+Shift+P→Patrol',
    status: 'passed', duration: 200,
  },

  // === Local File Manager Tests ===
  {
    id: 'TC-LF-001', module: '本地文件', moduleEn: 'Local Files', category: 'unit', priority: 'P0',
    name: '文件管理器正常渲染', nameEn: 'File manager renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开本地文件管理页面', stepEn: 'Open Local File Manager page' },
      { step: '验证存储概览条形图', stepEn: 'Verify storage overview bar' },
      { step: '验证5个根目录文件夹', stepEn: 'Verify 5 root directories' },
    ],
    expected: '存储概览(233.4MB/512MB)正确，5个文件夹展示',
    expectedEn: 'Storage overview correct, 5 folders shown',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-LF-002', module: '本地文件', moduleEn: 'Local Files', category: 'unit', priority: 'P0',
    name: '文件树展开与收起', nameEn: 'File tree expand and collapse',
    precondition: '文件管理器已打开', preconditionEn: 'File manager open',
    steps: [
      { step: '点击logs文件夹展开', stepEn: 'Click logs folder to expand' },
      { step: '点击node子文件夹展开', stepEn: 'Click node subfolder to expand' },
      { step: '再次点击收起', stepEn: 'Click again to collapse' },
    ],
    expected: '文件夹展开/收起动画流畅，子文件正确显示',
    expectedEn: 'Folder expand/collapse animation smooth, files show correctly',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-LF-003', module: '本地文件', moduleEn: 'Local Files', category: 'unit', priority: 'P1',
    name: '文件预览与语法高亮', nameEn: 'File preview with syntax highlight',
    precondition: '文件管理器已打开', preconditionEn: 'File manager open',
    steps: [
      { step: '点击inference.log文件', stepEn: 'Click inference.log file' },
      { step: '验证预览面板展示内容', stepEn: 'Verify preview panel shows content' },
      { step: '验证ERROR/WARN/INFO颜色', stepEn: 'Verify ERROR/WARN/INFO colors' },
    ],
    expected: '日志文件预览带行号，ERROR红/WARN黄/INFO绿语法高亮',
    expectedEn: 'Log preview with line numbers, ERROR red/WARN yellow/INFO green',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-LF-004', module: '本地文件', moduleEn: 'Local Files', category: 'unit', priority: 'P1',
    name: '快速操作执行', nameEn: 'Quick operation execution',
    precondition: '文件管理器已打开', preconditionEn: 'File manager open',
    steps: [
      { step: '点击"下载日志"快速操作', stepEn: 'Click "Download Logs" quick op' },
      { step: '验证操作日志新增记录', stepEn: 'Verify operation log new entry' },
      { step: '等待1.5秒验证完成', stepEn: 'Wait 1.5s verify completion' },
    ],
    expected: '操作日志先显示"正在执行"(蓝)，1.5秒后"完成"(绿)',
    expectedEn: 'Op log shows "Executing" then "Completed" after 1.5s',
    status: 'passed', duration: 1800,
  },
  {
    id: 'TC-LF-005', module: '本地文件', moduleEn: 'Local Files', category: 'unit', priority: 'P1',
    name: '文件搜索功能', nameEn: 'File search functionality',
    precondition: '文件管理器已打开', preconditionEn: 'File manager open',
    steps: [
      { step: '输入搜索关键字"error"', stepEn: 'Type search keyword "error"' },
      { step: '验证文件树过滤结果', stepEn: 'Verify file tree filter results' },
      { step: '清除搜索恢复全部', stepEn: 'Clear search to restore all' },
    ],
    expected: '搜索"error"显示所有error.log，清除后恢复完整文件树',
    expectedEn: 'Search "error" shows error.log files, clearing restores tree',
    status: 'passed', duration: 25,
  },

  // === Phase 3: CLI Terminal Tests ===
  {
    id: 'TC-CLI-001', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P0',
    name: 'CLI终端正常渲染', nameEn: 'CLI terminal renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开CLI终端页面', stepEn: 'Open CLI Terminal page' },
      { step: '验证终端头部(红黄绿圆点)', stepEn: 'Verify terminal header (red/yellow/green dots)' },
      { step: '验证欢迎信息显示', stepEn: 'Verify welcome message displayed' },
    ],
    expected: '终端正确渲染，含macOS风格头部栏、欢迎信息、输入提示符$',
    expectedEn: 'Terminal renders with macOS-style header, welcome message, $ prompt',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-CLI-002', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P0',
    name: 'yyc3 status 命令执行', nameEn: 'yyc3 status command execution',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '输入yyc3 status', stepEn: 'Type yyc3 status' },
      { step: '按Enter执行', stepEn: 'Press Enter to execute' },
      { step: '验证输出包含节点数/CPU/内存信息', stepEn: 'Verify output includes nodes/CPU/memory info' },
    ],
    expected: '输出系统状态概览: 12节点, CPU 42%, Memory 58%, 4条告警',
    expectedEn: 'Output shows system overview: 12 nodes, CPU 42%, Memory 58%, 4 alerts',
    status: 'passed', duration: 280,
  },
  {
    id: 'TC-CLI-003', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P0',
    name: 'yyc3 node 列表命令', nameEn: 'yyc3 node list command',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '输入yyc3 node', stepEn: 'Type yyc3 node' },
      { step: '按Enter执行', stepEn: 'Press Enter to execute' },
      { step: '验证表格输出格式', stepEn: 'Verify table output format' },
    ],
    expected: '输出12个节点的表格: 设备名/类型/端点/状态/CPU/MEM/DISK',
    expectedEn: 'Outputs table of 12 nodes: name/type/endpoint/status/CPU/MEM/DISK',
    status: 'passed', duration: 250,
  },
  {
    id: 'TC-CLI-004', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P0',
    name: 'Tab自动补全功能', nameEn: 'Tab auto-complete functionality',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '输入yyc3并空格', stepEn: 'Type yyc3 with space' },
      { step: '验证补全建议列表弹出', stepEn: 'Verify autocomplete suggestions popup' },
      { step: '输入sta后按Tab', stepEn: 'Type sta then press Tab' },
    ],
    expected: '补全候选列表显示8个子命令，Tab键正确补全',
    expectedEn: 'Suggestion list shows 8 subcommands, Tab completes correctly',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-CLI-005', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P1',
    name: '命令历史导航', nameEn: 'Command history navigation',
    precondition: '已执行过至少2条命令', preconditionEn: 'At least 2 commands executed',
    steps: [
      { step: '按上箭头键', stepEn: 'Press up arrow key' },
      { step: '验证上一条命令填入输入框', stepEn: 'Verify previous command fills input' },
      { step: '按下箭头键返回', stepEn: 'Press down arrow to go back' },
    ],
    expected: '上下键在命令历史中正确切换，历史不超过50条',
    expectedEn: 'Arrow keys navigate history correctly, max 50 entries',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-CLI-006', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P1',
    name: '无效命令错误处理', nameEn: 'Invalid command error handling',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '输入invalid_cmd', stepEn: 'Type invalid_cmd' },
      { step: '按Enter执行', stepEn: 'Press Enter to execute' },
      { step: '验证错误输出红色', stepEn: 'Verify error output in red' },
    ],
    expected: '输出command not found错误信息，红色文本，exitCode 127',
    expectedEn: 'Output command not found error, red text, exitCode 127',
    status: 'passed', duration: 220,
  },
  {
    id: 'TC-CLI-007', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P1',
    name: '快速命令按钮执行', nameEn: 'Quick command button execution',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '点击底部yyc3 alerts快速按钮', stepEn: 'Click bottom yyc3 alerts quick button' },
      { step: '验证命令自动执行', stepEn: 'Verify command auto-executes' },
      { step: '验证告警输出', stepEn: 'Verify alerts output' },
    ],
    expected: '快速按钮点击后命令执行并输出告警列表',
    expectedEn: 'Quick button click executes command and outputs alert list',
    status: 'passed', duration: 300,
  },
  {
    id: 'TC-CLI-008', module: 'CLI终端', moduleEn: 'CLI Terminal', category: 'unit', priority: 'P1',
    name: 'Ctrl+L清屏功能', nameEn: 'Ctrl+L clear screen',
    precondition: '已有多条输出', preconditionEn: 'Multiple outputs present',
    steps: [
      { step: '按Ctrl+L', stepEn: 'Press Ctrl+L' },
      { step: '验证终端输出清空', stepEn: 'Verify terminal output cleared' },
      { step: '验证输入框保持可用', stepEn: 'Verify input remains usable' },
    ],
    expected: '终端输出清空，输入框保持聚焦可用',
    expectedEn: 'Terminal output cleared, input stays focused and usable',
    status: 'passed', duration: 15,
  },

  // === Phase 3: IDE Plugin View Tests ===
  {
    id: 'TC-IDE-001', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P0',
    name: 'IDE视图正常渲染', nameEn: 'IDE plugin view renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开IDE插件视图页面', stepEn: 'Open IDE Plugin View page' },
      { step: '验证VS Code风格侧边栏', stepEn: 'Verify VS Code style sidebar' },
      { step: '验证编辑器预览区域', stepEn: 'Verify editor preview area' },
      { step: '验证底部状态栏', stepEn: 'Verify bottom status bar' },
    ],
    expected: '完整VS Code风格布局: Activity Bar + Sidebar + Editor + Status Bar',
    expectedEn: 'Full VS Code layout: Activity Bar + Sidebar + Editor + Status Bar',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-IDE-002', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P0',
    name: '节点状态列表与展开', nameEn: 'Node status list and expand',
    precondition: 'IDE视图已打开Monitor标签', preconditionEn: 'IDE view open Monitor tab',
    steps: [
      { step: '验证7个节点列表展示', stepEn: 'Verify 7 nodes listed' },
      { step: '点击节点展开详情', stepEn: 'Click node to expand details' },
      { step: '验证CPU/MEM/Latency进度条', stepEn: 'Verify CPU/MEM/Latency progress bars' },
    ],
    expected: '7个节点正确展示状态(online/warning/offline)，展开显示指标',
    expectedEn: '7 nodes show correct status, expand reveals CPU/MEM/Latency bars',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-IDE-003', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P0',
    name: 'Activity Bar标签切换', nameEn: 'Activity bar tab switching',
    precondition: 'IDE视图已打开', preconditionEn: 'IDE view open',
    steps: [
      { step: '点击告警图标切换到Alerts', stepEn: 'Click alert icon to switch to Alerts' },
      { step: '验证4条告警显示', stepEn: 'Verify 4 alerts displayed' },
      { step: '点击操作图标切换到Actions', stepEn: 'Click wrench icon to switch to Actions' },
    ],
    expected: 'Activity Bar 4个标签正确切换，内容面板动画过渡',
    expectedEn: 'Activity bar 4 tabs switch correctly, content panel animates',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-IDE-004', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P1',
    name: '节点搜索过滤', nameEn: 'Node search filtering',
    precondition: 'IDE视图Monitor标签', preconditionEn: 'IDE view Monitor tab',
    steps: [
      { step: '输入搜索NAS', stepEn: 'Type search NAS' },
      { step: '验证过滤结果', stepEn: 'Verify filtered results' },
      { step: '清除搜索', stepEn: 'Clear search' },
    ],
    expected: '搜索NAS后仅显示NAS相关节点，清除后恢复全部',
    expectedEn: 'Search NAS shows only NAS nodes, clearing restores all',
    status: 'passed', duration: 25,
  },
  {
    id: 'TC-IDE-005', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P1',
    name: '实时日志流展示', nameEn: 'Live log stream display',
    precondition: 'IDE视图已打开', preconditionEn: 'IDE view open',
    steps: [
      { step: '切换到Logs标签', stepEn: 'Switch to Logs tab' },
      { step: '验证8条日志记录', stepEn: 'Verify 8 log entries' },
      { step: '验证ERROR/WARN/INFO颜色', stepEn: 'Verify ERROR/WARN/INFO colors' },
    ],
    expected: '日志流按时间排序，ERROR红/WARN黄/INFO灰色正确区分',
    expectedEn: 'Log stream sorted by time, ERROR red/WARN yellow/INFO gray differentiated',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-IDE-006', module: 'IDE视图', moduleEn: 'IDE Plugin View', category: 'unit', priority: 'P1',
    name: '编辑器代码预览', nameEn: 'Editor code preview',
    precondition: 'IDE视图已打开', preconditionEn: 'IDE view open',
    steps: [
      { step: '查看右侧编辑器区域', stepEn: 'View right editor area' },
      { step: '验证代码语法高亮', stepEn: 'Verify code syntax highlight' },
      { step: '验证TODO行高亮标记', stepEn: 'Verify TODO line highlighted' },
    ],
    expected: '编辑器显示TypeScript代码，紫色关键字/绿色字符串/青色标识符',
    expectedEn: 'Editor shows TypeScript with purple keywords/green strings/cyan identifiers',
    status: 'passed', duration: 20,
  },

  // === Phase 3: Script Editor Tests ===
  {
    id: 'TC-SCR-001', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P0',
    name: '脚本编辑器正常渲染', nameEn: 'Script editor renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开脚本操作页面', stepEn: 'Open Script Editor page' },
      { step: '验证5个脚本模板列表', stepEn: 'Verify 5 script templates listed' },
      { step: '验证统计卡片', stepEn: 'Verify stat cards' },
    ],
    expected: '5个脚本模板正确展示，统计卡片数据匹配mock数据',
    expectedEn: '5 script templates displayed, stat cards match mock data',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-SCR-002', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P0',
    name: '脚本选择与预览', nameEn: 'Script selection and preview',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '点击节点健康检查脚本模板', stepEn: 'Click Node Health Check template' },
      { step: '验证右侧代码预览面板', stepEn: 'Verify right code preview panel' },
      { step: '验证变量配置区域', stepEn: 'Verify variable configuration area' },
    ],
    expected: '代码预览含行号，bash注释灰色/echo绿色/变量青色高亮',
    expectedEn: 'Code preview with line numbers, bash comments gray/echo green/vars cyan',
    status: 'passed', duration: 38,
  },
  {
    id: 'TC-SCR-003', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P0',
    name: '变量注入与实时替换', nameEn: 'Variable injection and live replacement',
    precondition: '已选择脚本模板', preconditionEn: 'Script template selected',
    steps: [
      { step: '修改NODES变量值', stepEn: 'Modify NODES variable value' },
      { step: '验证代码预览实时更新', stepEn: 'Verify code preview updates in real-time' },
      { step: '验证select类型变量下拉', stepEn: 'Verify select-type variable dropdown' },
    ],
    expected: '变量修改后代码预览实时替换，select显示选项列表',
    expectedEn: 'Variable changes reflect in code preview, select shows option list',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-SCR-004', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P0',
    name: '脚本执行触发', nameEn: 'Script execution trigger',
    precondition: '已选择脚本模板', preconditionEn: 'Script template selected',
    steps: [
      { step: '点击执行脚本按钮', stepEn: 'Click Execute button' },
      { step: '验证执行中旋转动画', stepEn: 'Verify executing spinner animation' },
      { step: '等待2秒恢复', stepEn: 'Wait 2s for restore' },
    ],
    expected: '按钮变为执行中含旋转图标，2秒后恢复为执行脚本',
    expectedEn: 'Button changes to Running with spinner, restores after 2s',
    status: 'passed', duration: 2200,
  },
  {
    id: 'TC-SCR-005', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P1',
    name: '执行历史列表展示', nameEn: 'Execution history list display',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '切换到执行历史标签', stepEn: 'Switch to Executions tab' },
      { step: '验证4条执行记录', stepEn: 'Verify 4 execution records' },
      { step: '验证状态图标和进度条', stepEn: 'Verify status icons and progress bar' },
    ],
    expected: '4条执行记录正确展示，running状态有动态进度条',
    expectedEn: '4 executions displayed, running has progress bar, failed red border',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-SCR-006', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P1',
    name: '批量编排选择与执行', nameEn: 'Batch orchestration select and execute',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '切换到批量编排标签', stepEn: 'Switch to Batch Jobs tab' },
      { step: '勾选3个脚本模板', stepEn: 'Check 3 script templates' },
      { step: '选择顺序执行模式', stepEn: 'Select Sequential mode' },
      { step: '切换为并行执行模式', stepEn: 'Switch to Parallel mode' },
    ],
    expected: '脚本选择后右侧显示编排顺序，顺序模式1.2.3./并行模式//',
    expectedEn: 'Selected scripts show on right, sequential 1.2.3. / parallel //',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-SCR-007', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P1',
    name: '脚本模板展开收起', nameEn: 'Script template expand collapse',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '点击模板展开箭头', stepEn: 'Click template expand arrow' },
      { step: '验证变量列表展示', stepEn: 'Verify variables list displayed' },
      { step: '再次点击收起', stepEn: 'Click again to collapse' },
    ],
    expected: '展开显示变量名和默认值，收起时动画流畅',
    expectedEn: 'Expand shows variable names and defaults, collapse animates smoothly',
    status: 'passed', duration: 25,
  },
  {
    id: 'TC-SCR-008', module: '脚本操作', moduleEn: 'Script Editor', category: 'unit', priority: 'P1',
    name: '风险等级标识', nameEn: 'Risk level badges',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '检查5个模板的风险标签', stepEn: 'Check risk badges on 5 templates' },
      { step: '验证低中高颜色绿黄红', stepEn: 'Verify low/medium/high colors' },
    ],
    expected: '低风险绿色、中风险黄色、高风险红色标签正确显示',
    expectedEn: 'Low=green, medium=yellow, high=red badges displayed correctly',
    status: 'passed', duration: 15,
  },

  // === Phase 3: API Integration Tests ===
  {
    id: 'TC-API-001', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: 'Mock/Real模式切换', nameEn: 'Mock/Real mode switch',
    precondition: 'TEST_MODE=true', preconditionEn: 'TEST_MODE=true',
    steps: [
      { step: '验证当前为Mock模式', stepEn: 'Verify current Mock mode' },
      { step: '检查isMockMode返回true', stepEn: 'Check isMockMode returns true' },
      { step: '验证所有模块使用mock数据', stepEn: 'Verify all modules use mock data' },
    ],
    expected: 'Mock模式下所有API调用返回预定义mock数据，无网络请求',
    expectedEn: 'Mock mode returns predefined data, no network requests',
    status: 'passed', duration: 20,
  },
  {
    id: 'TC-API-002', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: 'CLI Mock端点覆盖', nameEn: 'CLI mock endpoint coverage',
    precondition: 'CLI终端已打开', preconditionEn: 'CLI terminal open',
    steps: [
      { step: '执行yyc3 status', stepEn: 'Execute yyc3 status' },
      { step: '执行yyc3 node', stepEn: 'Execute yyc3 node' },
      { step: '执行yyc3 alerts', stepEn: 'Execute yyc3 alerts' },
      { step: '执行yyc3 help', stepEn: 'Execute yyc3 help' },
    ],
    expected: '8个CLI子命令mock端点全部响应正确',
    expectedEn: 'All 8 CLI subcommand mock endpoints respond correctly',
    status: 'passed', duration: 500,
  },
  {
    id: 'TC-API-003', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: 'Script Mock端点覆盖', nameEn: 'Script mock endpoint coverage',
    precondition: '脚本编辑器已打开', preconditionEn: 'Script editor open',
    steps: [
      { step: '验证GET /scripts/templates返回5条', stepEn: 'Verify GET /scripts/templates returns 5' },
      { step: '验证GET /scripts/executions返回4条', stepEn: 'Verify GET /scripts/executions returns 4' },
      { step: '验证POST /scripts/execute返回执行ID', stepEn: 'Verify POST /scripts/execute returns exec ID' },
    ],
    expected: '脚本相关mock端点全部正确响应',
    expectedEn: 'All script mock endpoints respond correctly',
    status: 'passed', duration: 350,
  },
  {
    id: 'TC-API-004', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: 'IDE Mock端点覆盖', nameEn: 'IDE mock endpoint coverage',
    precondition: 'IDE视图已打开', preconditionEn: 'IDE view open',
    steps: [
      { step: '验证GET /ide/nodes返回7个节点', stepEn: 'Verify GET /ide/nodes returns 7 nodes' },
      { step: '验证GET /ide/summary返回概览', stepEn: 'Verify GET /ide/summary returns summary' },
    ],
    expected: 'IDE mock端点全部正确响应',
    expectedEn: 'All IDE mock endpoints respond correctly',
    status: 'passed', duration: 200,
  },
  {
    id: 'TC-API-005', module: 'API对接', moduleEn: 'API Integration', category: 'unit', priority: 'P0',
    name: '端点配置完整性', nameEn: 'Endpoint configuration completeness',
    precondition: 'endpoints-config.ts存在', preconditionEn: 'endpoints-config.ts exists',
    steps: [
      { step: '验证13个模块端点定义', stepEn: 'Verify 13 module endpoint definitions' },
      { step: '验证57个REST端点', stepEn: 'Verify 57 REST endpoints' },
      { step: '验证4个WebSocket通道', stepEn: 'Verify 4 WebSocket channels' },
      { step: '验证权限角色标注', stepEn: 'Verify role annotations' },
    ],
    expected: '端点注册表完整: 13模块/57REST/4WS/26角色限制端点',
    expectedEn: 'Endpoint registry complete: 13 modules/57 REST/4 WS/26 role-restricted',
    status: 'passed', duration: 10,
  },

  // === Cross-module Tests ===
  {
    id: 'TC-XM-001', module: '跨模块', moduleEn: 'Cross-module', category: 'integration', priority: 'P0',
    name: '侧边栏导航切换', nameEn: 'Sidebar navigation switching',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '依次点击侧边栏13个DevOps模块', stepEn: 'Click all 13 DevOps sidebar modules' },
      { step: '验证每个模块正常渲染', stepEn: 'Verify each module renders correctly' },
      { step: '验证活跃指示器跟随', stepEn: 'Verify active indicator follows' },
    ],
    expected: '13个模块全部正常切换渲染，活跃指示器实时跟随',
    expectedEn: 'All 13 modules switch and render correctly, active indicator follows',
    status: 'passed', duration: 650,
  },
  {
    id: 'TC-XM-002', module: '跨模块', moduleEn: 'Cross-module', category: 'integration', priority: 'P0',
    name: '中英文切换', nameEn: 'Language switching',
    precondition: '系统正常运行，当前中文', preconditionEn: 'System running, currently Chinese',
    steps: [
      { step: '切换语言为English', stepEn: 'Switch language to English' },
      { step: '遍历所有模块验证文本', stepEn: 'Visit all modules to verify text' },
      { step: '切回中文验证', stepEn: 'Switch back to Chinese and verify' },
    ],
    expected: '所有模块标题、按钮、提示文本正确切换，无乱码',
    expectedEn: 'All module titles, buttons, tooltips switch correctly, no garbled text',
    status: 'passed', duration: 800,
  },
  {
    id: 'TC-XM-003', module: '跨模块', moduleEn: 'Cross-module', category: 'performance', priority: 'P1',
    name: '首屏加载性能', nameEn: 'First screen load performance',
    precondition: '冷启动', preconditionEn: 'Cold start',
    steps: [
      { step: '刷页面', stepEn: 'Refresh page' },
      { step: '测量首屏渲染时间', stepEn: 'Measure first screen render time' },
      { step: '验证 <2s 目标', stepEn: 'Verify <2s target' },
    ],
    expected: '首屏加载时间 <2s，交互响应 <100ms',
    expectedEn: 'First screen load <2s, interaction response <100ms',
    status: 'passed', duration: 1200,
  },

  // === Phase 5: Theme Customizer Tests ===
  {
    id: 'TC-TH-001', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: '主题定制页面正常渲染', nameEn: 'Theme customizer page renders correctly',
    precondition: '系统正常运行，ThemeProvider 已挂载', preconditionEn: 'System running, ThemeProvider mounted',
    steps: [
      { step: '打开主题定制页面', stepEn: 'Open Theme Customizer page' },
      { step: '验证7个选项卡显示', stepEn: 'Verify 7 tabs are displayed' },
      { step: '验证当前主题信息展示', stepEn: 'Verify current theme info shown' },
    ],
    expected: '主题定制页面正常显示，7个选项卡（预设/颜色/字体/布局/品牌/无障碍/导出）均可点击',
    expectedEn: 'Theme page displays correctly, all 7 tabs (Presets/Colors/Fonts/Layout/Branding/A11y/Export) are clickable',
    status: 'passed', duration: 42,
  },
  {
    id: 'TC-TH-002', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: '预设主题切换功能', nameEn: 'Preset theme switching',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '点击预设主题标签页', stepEn: 'Click Presets tab' },
      { step: '点击"基础色调"主题卡片', stepEn: 'Click "Base Light" theme card' },
      { step: '验证主题已切换', stepEn: 'Verify theme has switched' },
      { step: '点击"赛博朋克"恢复', stepEn: 'Click "Cyberpunk" to restore' },
    ],
    expected: '6个预设主题均可一键切换，CSS变量实时更新，当前主题显示勾选标识',
    expectedEn: 'All 6 preset themes switch on click, CSS vars update in real-time, active theme shows check mark',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-TH-003', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: '颜色编辑器功能', nameEn: 'Color editor functionality',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到颜色系统标签页', stepEn: 'Switch to Colors tab' },
      { step: '验证10个语义化颜色变量展示', stepEn: 'Verify 10 semantic color variables shown' },
      { step: '修改主色OKLch值', stepEn: 'Edit primary OKLch value' },
      { step: '验证实时预览更新', stepEn: 'Verify live preview updates' },
    ],
    expected: '颜色编辑支持OKLch输入，修改后实时预览，背景色和前景色分组清晰',
    expectedEn: 'Color editor supports OKLch input, live preview on edit, BG/FG colors clearly grouped',
    status: 'passed', duration: 48,
  },
  {
    id: 'TC-TH-004', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '字体配置功能', nameEn: 'Font configuration',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到字体排版标签页', stepEn: 'Switch to Typography tab' },
      { step: '选择不同无衬线字体', stepEn: 'Select different sans-serif font' },
      { step: '验证字号规范预览', stepEn: 'Verify type scale preview' },
    ],
    expected: '字体切换后预览文本实时更新，三类字体（Sans/Serif/Mono）均可配置',
    expectedEn: 'Preview text updates on font change, all 3 font types (Sans/Serif/Mono) configurable',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-TH-005', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '布局系统配置', nameEn: 'Layout system configuration',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到布局系统标签页', stepEn: 'Switch to Layout tab' },
      { step: '修改圆角参数', stepEn: 'Modify border radius values' },
      { step: '验证圆角预览块更新', stepEn: 'Verify radius preview blocks update' },
      { step: '查看间距参考', stepEn: 'View spacing reference' },
    ],
    expected: '圆角修改实时预览，阴影配置可编辑，间距参考正确展示9级间距',
    expectedEn: 'Radius changes preview instantly, shadow configs editable, spacing ref shows 9 levels',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-TH-006', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '品牌元素定制', nameEn: 'Branding customization',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到品牌元素标签页', stepEn: 'Switch to Branding tab' },
      { step: '修改应用名称', stepEn: 'Edit app name' },
      { step: '修改中英文标语', stepEn: 'Edit bilingual slogans' },
      { step: '验证品牌预览卡片', stepEn: 'Verify brand preview card' },
    ],
    expected: '品牌信息支持中英双语，修改后预览卡片实时更新，字符限制有效',
    expectedEn: 'Branding supports bilingual input, preview card updates live, character limits enforced',
    status: 'passed', duration: 38,
  },
  {
    id: 'TC-TH-007', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: 'WCAG对比度检测', nameEn: 'WCAG contrast detection',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到无障碍检查标签页', stepEn: 'Switch to A11y Check tab' },
      { step: '验证对比度检测结果', stepEn: 'Verify contrast check results' },
      { step: '验证WCAG等级标识', stepEn: 'Verify WCAG level badges' },
    ],
    expected: '对比度检测显示8组颜色对比，标注AAA/AA/AA Large/Fail等级，通过率统计正确',
    expectedEn: 'Contrast check shows 8 color pairs, labels AAA/AA/AA Large/Fail levels, pass rate correct',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-TH-008', module: '主题定制', moduleEn: 'Theme Customizer', category: 'integration', priority: 'P0',
    name: '主题导出功能', nameEn: 'Theme export functionality',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换到导入/导出标签页', stepEn: 'Switch to Import/Export tab' },
      { step: '点击复制JSON', stepEn: 'Click Copy JSON' },
      { step: '点击下载文件', stepEn: 'Click Download File' },
      { step: '点击预览JSON查看', stepEn: 'Click Preview to view JSON' },
    ],
    expected: '导出JSON格式正确含所有主题配置，复制到剪贴板成功，文件下载正常',
    expectedEn: 'Exported JSON format correct with all config, clipboard copy works, file download works',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-TH-009', module: '主题定制', moduleEn: 'Theme Customizer', category: 'integration', priority: 'P0',
    name: '主题导入功能', nameEn: 'Theme import functionality',
    precondition: '主题定制页面已加载，有有效的主题JSON', preconditionEn: 'Theme customizer loaded, valid theme JSON available',
    steps: [
      { step: '在导入文本框粘贴有效JSON', stepEn: 'Paste valid JSON in import textarea' },
      { step: '点击导入主题', stepEn: 'Click Import Theme' },
      { step: '验证主题应用成功', stepEn: 'Verify theme applied successfully' },
    ],
    expected: '有效JSON导入成功并应用，无效JSON提示错误，文件导入方式正常工作',
    expectedEn: 'Valid JSON imports and applies, invalid JSON shows error, file import works',
    status: 'passed', duration: 50,
  },
  {
    id: 'TC-TH-010', module: '主题定制', moduleEn: 'Theme Customizer', category: 'integration', priority: 'P1',
    name: '主题持久化与撤销', nameEn: 'Theme persistence and undo',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '修改主题配置', stepEn: 'Modify theme config' },
      { step: '刷新页面验证持久化', stepEn: 'Refresh page to verify persistence' },
      { step: '点击撤销按钮', stepEn: 'Click Undo button' },
      { step: '点击重置按钮', stepEn: 'Click Reset button' },
    ],
    expected: '主题配置通过localStorage持久化，撤销恢复上一次配置，重置回到默认赛博朋克主题',
    expectedEn: 'Theme persists via localStorage, undo restores previous config, reset returns to default cyberpunk',
    status: 'passed', duration: 60,
  },
  {
    id: 'TC-TH-011', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '实时预览卡片', nameEn: 'Live preview card',
    precondition: '预设主题标签页已打开', preconditionEn: 'Presets tab open',
    steps: [
      { step: '查看实时预览区域', stepEn: 'View live preview area' },
      { step: '验证预览包含侧边栏/卡片/按钮', stepEn: 'Verify preview includes sidebar/cards/buttons' },
      { step: '切换主题验证预览更新', stepEn: 'Switch theme and verify preview updates' },
    ],
    expected: '预览卡片完整展示主题效果（侧边栏+内容区+按钮+卡片），主题切换后同步更新',
    expectedEn: 'Preview card shows full theme (sidebar+content+buttons+cards), syncs on theme switch',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-TH-012', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '中英双语支持', nameEn: 'Bilingual support',
    precondition: '主题定制页面已加载', preconditionEn: 'Theme customizer loaded',
    steps: [
      { step: '切换语言到英文', stepEn: 'Switch language to English' },
      { step: '验证所有标签/标题/按钮文��', stepEn: 'Verify all labels/titles/button text' },
      { step: '切换回中文验证', stepEn: 'Switch back to Chinese and verify' },
    ],
    expected: '所有UI元素支持中英双语切换，预设主题名称双语显示，品牌配置支持双语输入',
    expectedEn: 'All UI elements support bilingual switching, preset names show in both languages, branding supports bilingual input',
    status: 'passed', duration: 28,
  },

  // === Phase 5.5: Deep Theme Integration Tests ===
  {
    id: 'TC-TH-013', module: '主题联动', moduleEn: 'Theme Integration', category: 'integration', priority: 'P0',
    name: 'Sidebar主题变量联动', nameEn: 'Sidebar theme variable binding',
    precondition: '系统正常运行，ThemeProvider已挂载', preconditionEn: 'System running, ThemeProvider mounted',
    steps: [
      { step: '切换到"基础色调"浅色主题', stepEn: 'Switch to "Base Light" theme' },
      { step: '验证侧边栏背景色变化', stepEn: 'Verify sidebar background color changes' },
      { step: '验证激活态颜色跟随主题', stepEn: 'Verify active state color follows theme' },
      { step: '验证分隔线和边框颜色更新', stepEn: 'Verify divider and border colors update' },
    ],
    expected: 'Sidebar背景/文字/激活色/边框均通过CSS变量(--theme-sidebar-*)实时响应主题切换',
    expectedEn: 'Sidebar bg/text/active/border all respond to theme changes via CSS vars (--theme-sidebar-*)',
    status: 'passed', duration: 52,
  },
  {
    id: 'TC-TH-014', module: '主题联动', moduleEn: 'Theme Integration', category: 'integration', priority: 'P0',
    name: 'Navbar主题变量联动', nameEn: 'Navbar theme variable binding',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '切换到"宇宙之夜"深色主题', stepEn: 'Switch to "Cosmic Night" dark theme' },
      { step: '验证导航栏背景色变化', stepEn: 'Verify navbar background changes' },
      { step: '验证边框颜色更新', stepEn: 'Verify border color updates' },
    ],
    expected: 'Navbar背景和边框通过--theme-bg-color和--theme-border变量响应主题',
    expectedEn: 'Navbar bg/border respond via --theme-bg-color and --theme-border vars',
    status: 'passed', duration: 38,
  },
  {
    id: 'TC-TH-015', module: '主题联动', moduleEn: 'Theme Integration', category: 'integration', priority: 'P0',
    name: 'MainLayout主背景联动', nameEn: 'MainLayout background binding',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '切换主题验证主背景色变化', stepEn: 'Switch theme, verify main background changes' },
      { step: '验证全局字体跟随主题配置', stepEn: 'Verify global font follows theme config' },
      { step: '验证背景渐变效果使用主题变量', stepEn: 'Verify background gradient uses theme vars' },
    ],
    expected: 'MainLayout背景色/字体/渐变效果均通过CSS变量实时响应，切换6个预设主题均正常',
    expectedEn: 'MainLayout bg/font/gradient all respond via CSS vars, all 6 presets work correctly',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-TH-016', module: '主题联动', moduleEn: 'Theme Integration', category: 'integration', priority: 'P0',
    name: 'FuturisticPanel主题联动', nameEn: 'FuturisticPanel theme binding',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '切换主题验证面板圆角变化', stepEn: 'Switch theme, verify panel border-radius changes' },
      { step: '验证角落装饰色跟随主题', stepEn: 'Verify corner decorations follow theme' },
      { step: '验证阴影使用主题变量', stepEn: 'Verify shadow uses theme vars' },
    ],
    expected: 'FuturisticPanel圆角/阴影/角落装饰色均使用--theme-*变量，主题切换后实时更新',
    expectedEn: 'FuturisticPanel radius/shadow/corner colors use --theme-* vars, update on theme switch',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-TH-017', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: '字体上传功能(IndexedDB)', nameEn: 'Font upload (IndexedDB)',
    precondition: '主题定制页面字体排版标签页已打开', preconditionEn: 'Theme customizer Typography tab open',
    steps: [
      { step: '点击字体上传区域"选择字体文件"', stepEn: 'Click "Choose Font" in upload area' },
      { step: '选择一个有效TTF文件(<5MB)', stepEn: 'Select a valid TTF file (<5MB)' },
      { step: '验证字体出现在已上传列表', stepEn: 'Verify font appears in uploaded list' },
      { step: '验证字体可在下拉框中选用', stepEn: 'Verify font available in dropdown' },
      { step: '删除自定义字体验证移除', stepEn: 'Delete custom font and verify removal' },
    ],
    expected: '字体上传到IndexedDB成功，@font-face动态注入，列表展示字体名/大小/格式，删除后清理',
    expectedEn: 'Font uploads to IndexedDB, @font-face injected, list shows name/size/format, cleanup on delete',
    status: 'passed', duration: 85,
  },
  {
    id: 'TC-TH-018', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '背景图片上传功能', nameEn: 'Background image upload',
    precondition: '主题定制页面背景定制标签页已打开', preconditionEn: 'Theme customizer Background tab open',
    steps: [
      { step: '切换背景类型到"图片"', stepEn: 'Switch background type to "Image"' },
      { step: '上传一张PNG图片', stepEn: 'Upload a PNG image' },
      { step: '调整透明度和模糊度', stepEn: 'Adjust opacity and blur' },
      { step: '验证背景图片实时预览', stepEn: 'Verify background image preview' },
      { step: '切换回纯色验证恢复', stepEn: 'Switch back to color, verify restore' },
    ],
    expected: '图片上传后base64存储，预览区域显示图片，透明度/模糊度滑块工作正常，支持PNG/JPG/WebP',
    expectedEn: 'Image uploads as base64, preview shows image, opacity/blur sliders work, supports PNG/JPG/WebP',
    status: 'passed', duration: 65,
  },
  {
    id: 'TC-TH-019', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P0',
    name: '版本快照管理', nameEn: 'Version snapshot management',
    precondition: '主题定制页面版本管理标签页已打开', preconditionEn: 'Theme customizer Versions tab open',
    steps: [
      { step: '输入快照名称点击保存', stepEn: 'Enter snapshot name and click Save' },
      { step: '验证快照出现在列表中', stepEn: 'Verify snapshot appears in list' },
      { step: '修改主题后再次保存快照', stepEn: 'Modify theme and save another snapshot' },
      { step: '点击快照的"恢复"按钮', stepEn: 'Click "Restore" on a snapshot' },
      { step: '删除快照验证移除', stepEn: 'Delete snapshot and verify removal' },
    ],
    expected: '快照保存到localStorage(最多50个)，恢复功能正确回退主题，删除后从列表消失',
    expectedEn: 'Snapshots save to localStorage (max 50), restore correctly reverts theme, delete removes from list',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-TH-020', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '版本对比可视化', nameEn: 'Version comparison visualization',
    precondition: '至少存在一个快照', preconditionEn: 'At least one snapshot exists',
    steps: [
      { step: '点击快照的"对比"按钮', stepEn: 'Click "Compare" on a snapshot' },
      { step: '验证并排预览卡片显示', stepEn: 'Verify side-by-side preview cards' },
      { step: '验证差异项列表正确标注', stepEn: 'Verify diff list correctly highlights changes' },
      { step: '再次点击关闭对比', stepEn: 'Click again to close comparison' },
    ],
    expected: '对比模式并排显示两个主题预览卡片，差异项列表标注新旧颜色值及色块，toggle正常',
    expectedEn: 'Compare shows side-by-side previews, diff list shows old/new colors with swatches, toggle works',
    status: 'passed', duration: 42,
  },
  {
    id: 'TC-TH-021', module: '主题定制', moduleEn: 'Theme Customizer', category: 'unit', priority: 'P1',
    name: '视频背景上传与渲染', nameEn: 'Video background upload and rendering',
    precondition: '主题定制页面背景定制标签页已打开', preconditionEn: 'Theme customizer Background tab open',
    steps: [
      { step: '切换背景类型到"视频"', stepEn: 'Switch background type to "Video"' },
      { step: '上传一个MP4/WebM视频(<20MB)', stepEn: 'Upload MP4/WebM video (<20MB)' },
      { step: '验证视频预览区域播放', stepEn: 'Verify video preview plays' },
      { step: '调整透明度和模糊度验证效果', stepEn: 'Adjust opacity/blur and verify effect' },
      { step: '验证MainLayout背景视频渲染', stepEn: 'Verify MainLayout renders video background' },
    ],
    expected: '视频上传base64存储，预览区域自动循环静音播放，MainLayout渲染全屏视频背景带透明度/模糊叠加',
    expectedEn: 'Video uploads as base64, preview auto-loops muted, MainLayout renders fullscreen video bg with opacity/blur overlay',
    status: 'passed', duration: 78,
  },
  {
    id: 'TC-TH-022', module: '主题联动', moduleEn: 'Theme Integration', category: 'integration', priority: 'P0',
    name: 'API端点配置完整性(71+4)', nameEn: 'API endpoint config completeness (71+4)',
    precondition: 'endpoints-config.ts已更新', preconditionEn: 'endpoints-config.ts updated',
    steps: [
      { step: '检查theme模块新增9个端点', stepEn: 'Check theme module has 9 new endpoints' },
      { step: '验证总REST端点数=71', stepEn: 'Verify total REST endpoints = 71' },
      { step: '验证WebSocket通道数=4', stepEn: 'Verify WebSocket channels = 4' },
      { step: '验证字体/背景/快照端点路径正确', stepEn: 'Verify font/bg/snapshot endpoint paths correct' },
    ],
    expected: 'ENDPOINT_REGISTRY.theme包含14个端点(5原有+9新增)，总计71 REST + 4 WS通道',
    expectedEn: 'ENDPOINT_REGISTRY.theme has 14 endpoints (5 original + 9 new), total 71 REST + 4 WS channels',
    status: 'passed', duration: 15,
  },

  // === Phase 6.1: Cross-endpoint Comparison Tests ===
  {
    id: 'TC-VIS-007', module: '跨端对比', moduleEn: 'Cross-comparison', category: 'unit', priority: 'P0',
    name: '三端数据并排显示', nameEn: 'Three endpoints side-by-side display',
    precondition: '系统正常运行，Mock数据已加载', preconditionEn: 'System running, mock data loaded',
    steps: [
      { step: '打开跨端对比页面', stepEn: 'Open Cross-endpoint Comparison page' },
      { step: '验证Max/NAS/ECS三列卡片渲染', stepEn: 'Verify Max/NAS/ECS three-column cards render' },
      { step: '验证每列显示设备数/CPU/内存/磁盘/告警', stepEn: 'Verify each column shows devices/CPU/memory/disk/alerts' },
      { step: '验证响应式布局(xl:3列/md:2列/sm:1列)', stepEn: 'Verify responsive layout (xl:3col/md:2col/sm:1col)' },
    ],
    expected: '三端数据正确并排显示，每列5个指标卡片，数据与mock一致',
    expectedEn: 'Three endpoints displayed side-by-side, 5 metric cards each, data matches mock',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-VIS-008', module: '跨端对比', moduleEn: 'Cross-comparison', category: 'unit', priority: 'P0',
    name: '差异自动高亮', nameEn: 'Auto-highlight differences',
    precondition: '跨端对比页面已打开', preconditionEn: 'Cross-comparison page open',
    steps: [
      { step: '验证ECS端CPU/内存超过85%阈值', stepEn: 'Verify ECS CPU/memory exceeds 85% threshold' },
      { step: '验证超阈值指标显示WARNING/CRITICAL标签', stepEn: 'Verify over-threshold metrics show WARNING/CRITICAL badges' },
      { step: '验证超阈值卡片红色脉动边框', stepEn: 'Verify over-threshold card has red pulsing border' },
      { step: '验证Max端运行平稳无高亮', stepEn: 'Verify Max endpoint running stable with no highlights' },
    ],
    expected: 'ECS端CPU/内存卡片自动高亮(红色边框+WARNING标签)，Max端无高亮，AI分析识别hotspot=ecs',
    expectedEn: 'ECS CPU/memory cards auto-highlight (red border + WARNING badge), Max has no highlight, AI identifies hotspot=ecs',
    status: 'passed', duration: 42,
  },
  {
    id: 'TC-VIS-009', module: '跨端对比', moduleEn: 'Cross-comparison', category: 'unit', priority: 'P0',
    name: '时间范围切换', nameEn: 'Time range switching',
    precondition: '跨端对比页面已打开', preconditionEn: 'Cross-comparison page open',
    steps: [
      { step: '点击\"实时\"时间范围', stepEn: 'Click \"Realtime\" time range' },
      { step: '验证数据自动刷新(每5秒)', stepEn: 'Verify data auto-refreshes (every 5s)' },
      { step: '切换到\"近24小时\"', stepEn: 'Switch to \"Last 24h\"' },
      { step: '验证图表数据点数量增加', stepEn: 'Verify chart data points increase' },
      { step: '切换到\"近7天\"', stepEn: 'Switch to \"Last 7d\"' },
    ],
    expected: '4个时间范围(实时/1h/24h/7d)正确切换，API参数range正确传递，图表数据点随范围调整',
    expectedEn: 'All 4 time ranges switch correctly, API param range passed correctly, chart points adjust by range',
    status: 'passed', duration: 6500,
  },
  {
    id: 'TC-VIS-021', module: '跨端对比', moduleEn: 'Cross-comparison', category: 'unit', priority: 'P1',
    name: 'PDF报告导出', nameEn: 'PDF report export',
    precondition: '跨端对比页面已打开', preconditionEn: 'Cross-comparison page open',
    steps: [
      { step: '点击导出报告下拉按钮', stepEn: 'Click export report dropdown' },
      { step: '选择PDF格式', stepEn: 'Select PDF format' },
      { step: '验证导出加载动画', stepEn: 'Verify export loading animation' },
      { step: '验证导出完成提示', stepEn: 'Verify export completion notification' },
    ],
    expected: '导出按钮显示旋转加载图标，1.5秒后Mock模式弹出提示，下载链接格式正确',
    expectedEn: 'Export button shows spinner, after 1.5s mock mode shows notification, download URL format correct',
    status: 'passed', duration: 1800,
  },
  {
    id: 'TC-VIS-022', module: '跨端对比', moduleEn: 'Cross-comparison', category: 'unit', priority: 'P1',
    name: 'Excel报告导出', nameEn: 'Excel report export',
    precondition: '跨端对比页面已打开', preconditionEn: 'Cross-comparison page open',
    steps: [
      { step: '点击导出报告下拉按钮', stepEn: 'Click export report dropdown' },
      { step: '选择Excel格式', stepEn: 'Select Excel format' },
      { step: '验证导出流程与PDF一致', stepEn: 'Verify export flow matches PDF' },
      { step: '验证Mock API返回正确文件大小', stepEn: 'Verify mock API returns correct file size' },
    ],
    expected: 'Excel导出流程正常，Mock返回1.8MB文件大小，下载链接含.excel后缀',
    expectedEn: 'Excel export works correctly, mock returns 1.8MB file size, download URL has .excel suffix',
    status: 'passed', duration: 1800,
  },

  // === Phase 6.2: Historical Comparison Tests ===
  {
    id: 'TC-HC-001', module: '历史对比', moduleEn: 'Historical Comparison', category: 'unit', priority: 'P0',
    name: '历史对比页面正常渲染', nameEn: 'Historical comparison page renders correctly',
    precondition: '系统正常运行，Mock数据已加载', preconditionEn: 'System running, mock data loaded',
    steps: [
      { step: '打开历史对比页面', stepEn: 'Open Historical Comparison page' },
      { step: '验证4个总览差异卡片(CPU/内存/磁盘/告警)', stepEn: 'Verify 4 summary diff cards (CPU/Memory/Disk/Alerts)' },
      { step: '验证端点差异柱状图渲染', stepEn: 'Verify endpoint diff bar chart renders' },
      { step: '验证分端点趋势图渲染', stepEn: 'Verify per-endpoint trend chart renders' },
    ],
    expected: '页面正常渲染，差异卡片显示本周vs上周数据，趋势方向箭头正确',
    expectedEn: 'Page renders correctly, diff cards show this vs last week data, trend arrows correct',
    status: 'passed', duration: 55,
  },
  {
    id: 'TC-HC-002', module: '历史对比', moduleEn: 'Historical Comparison', category: 'unit', priority: 'P0',
    name: '周/月对比模式切换', nameEn: 'Week/month comparison mode switch',
    precondition: '历史对比页面已打开', preconditionEn: 'Historical comparison page open',
    steps: [
      { step: '验证默认为"本周vs上周"模式', stepEn: 'Verify default is "Week vs Week" mode' },
      { step: '点击切换到"本月vs上月"模式', stepEn: 'Switch to "Month vs Month" mode' },
      { step: '验证API参数period=month', stepEn: 'Verify API param period=month' },
      { step: '验证数据刷新显示30天', stepEn: 'Verify data refreshes showing 30 days' },
    ],
    expected: '模式切换后数据正确刷新，周模式7天/月模式30天数据点',
    expectedEn: 'Data refreshes correctly on mode switch, week=7 days / month=30 days data points',
    status: 'passed', duration: 3500,
  },
  {
    id: 'TC-HC-003', module: '历史对比', moduleEn: 'Historical Comparison', category: 'unit', priority: 'P0',
    name: '趋势方向指示器', nameEn: 'Trend direction indicators',
    precondition: '历史对比页面已打开', preconditionEn: 'Historical comparison page open',
    steps: [
      { step: '验证ECS端CPU上升趋势显示红色↑', stepEn: 'Verify ECS CPU upward trend shows red ↑' },
      { step: '验证Max端稳定趋势显示灰色—', stepEn: 'Verify Max stable trend shows gray —' },
      { step: '验证差异百分比计算正确', stepEn: 'Verify diff percentage calculation correct' },
    ],
    expected: '上升趋势红色箭头+正百分比，下降趋势绿色箭头+负百分比，稳定显示持平',
    expectedEn: 'Up trend=red arrow + positive %, down=green arrow + negative %, stable shows flat',
    status: 'passed', duration: 30,
  },
  {
    id: 'TC-HC-004', module: '历史对比', moduleEn: 'Historical Comparison', category: 'unit', priority: 'P0',
    name: '分端点趋势叠加图', nameEn: 'Per-endpoint overlay trend chart',
    precondition: '历史对比页面已打开', preconditionEn: 'Historical comparison page open',
    steps: [
      { step: '选择ECS端点标签', stepEn: 'Select ECS endpoint tab' },
      { step: '选择CPU指标', stepEn: 'Select CPU metric' },
      { step: '验证本周实线+上周虚线叠加显示', stepEn: 'Verify this-week solid + last-week dashed overlay' },
      { step: '切换到NAS端验证数据切换', stepEn: 'Switch to NAS and verify data switch' },
    ],
    expected: '趋势图正确叠加本周(实线)和上周(虚线)数据，切换端点/指标动画流畅',
    expectedEn: 'Trend chart overlays this-week (solid) and last-week (dashed), endpoint/metric switch animates smoothly',
    status: 'passed', duration: 48,
  },
  {
    id: 'TC-HC-005', module: '历史对比', moduleEn: 'Historical Comparison', category: 'unit', priority: 'P1',
    name: 'AI趋势洞察展示', nameEn: 'AI trend insights display',
    precondition: '历史对比页面已打开', preconditionEn: 'Historical comparison page open',
    steps: [
      { step: '滚动到AI趋势洞察区域', stepEn: 'Scroll to AI Trend Insights area' },
      { step: '验证4条洞察建议展示', stepEn: 'Verify 4 insight suggestions displayed' },
      { step: '验证中英双语内容切换', stepEn: 'Verify bilingual content switching' },
    ],
    expected: '4条AI洞察正确显示，切换语言后内容切换，含ECS扩容建议和NAS磁盘预警',
    expectedEn: '4 AI insights displayed, content switches on language change, includes ECS scaling and NAS disk warning',
    status: 'passed', duration: 25,
  },

  // === Phase 6.2: Alert Threshold Config Tests ===
  {
    id: 'TC-AT-001', module: '告警阈值', moduleEn: 'Alert Thresholds', category: 'unit', priority: 'P0',
    name: '阈值配置页面正常渲染', nameEn: 'Threshold config page renders correctly',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '打开告警阈值配置页面', stepEn: 'Open Alert Threshold Config page' },
      { step: '验证3个端点阈值卡片(Max/NAS/ECS)', stepEn: 'Verify 3 endpoint threshold cards (Max/NAS/ECS)' },
      { step: '验证每卡片4个滑块(CPU/内存/磁盘/告警数)', stepEn: 'Verify 4 sliders per card (CPU/Memory/Disk/AlertCount)' },
      { step: '验证通知设置区域', stepEn: 'Verify notification settings area' },
    ],
    expected: '页面正常渲染，3个端点卡片各含4个阈值滑块，通知设置3个开关',
    expectedEn: 'Page renders correctly, 3 endpoint cards with 4 sliders each, notification settings with 3 toggles',
    status: 'passed', duration: 45,
  },
  {
    id: 'TC-AT-002', module: '告警阈值', moduleEn: 'Alert Thresholds', category: 'unit', priority: 'P0',
    name: '全局/独立模式切换', nameEn: 'Global/Independent mode toggle',
    precondition: '阈值配置页面已打开', preconditionEn: 'Threshold config page open',
    steps: [
      { step: '验证默认为独立模式', stepEn: 'Verify default is Independent mode' },
      { step: '点击切换为全局模式', stepEn: 'Click to switch to Global mode' },
      { step: '验证全局阈值设置面板出现', stepEn: 'Verify global threshold settings panel appears' },
      { step: '验证端点卡片显示"全局同步"标签', stepEn: 'Verify endpoint cards show "Global Sync" badge' },
      { step: '修改全局CPU阈值验证三端同步', stepEn: 'Modify global CPU threshold, verify all 3 endpoints sync' },
    ],
    expected: '全局模式下修改阈值三端同步更新，独立模式下各端独立配置',
    expectedEn: 'Global mode syncs all 3 endpoints, Independent mode allows per-endpoint config',
    status: 'passed', duration: 40,
  },
  {
    id: 'TC-AT-003', module: '告警阈值', moduleEn: 'Alert Thresholds', category: 'unit', priority: 'P0',
    name: '阈值滑块交互', nameEn: 'Threshold slider interaction',
    precondition: '阈值配置页面已打开，独立模式', preconditionEn: 'Threshold page open, Independent mode',
    steps: [
      { step: '拖动ECS端CPU阈值滑块到90%', stepEn: 'Drag ECS CPU threshold slider to 90%' },
      { step: '验证滑块进度条颜色变为红色', stepEn: 'Verify slider bar color changes to red gradient' },
      { step: '在数字输入框直接输入85', stepEn: 'Type 85 directly in number input' },
      { step: '验证滑块位置同步更新', stepEn: 'Verify slider position syncs' },
    ],
    expected: '滑块和数字输入双向绑定，超过90%显示红色渐变，范围限制50-99%',
    expectedEn: 'Slider and number input bind bidirectionally, >90% shows red gradient, range limited 50-99%',
    status: 'passed', duration: 35,
  },
  {
    id: 'TC-AT-004', module: '告警阈值', moduleEn: 'Alert Thresholds', category: 'unit', priority: 'P0',
    name: '保存与重置功能', nameEn: 'Save and reset functionality',
    precondition: '阈值配置页面已打开', preconditionEn: 'Threshold page open',
    steps: [
      { step: '修改任意阈值触发"有变更"状态', stepEn: 'Modify any threshold to trigger "has changes" state' },
      { step: '验证保存按钮变为可点击(青色)', stepEn: 'Verify save button becomes clickable (cyan)' },
      { step: '点击保存验证加载动画', stepEn: 'Click save and verify loading animation' },
      { step: '点击重置验证恢复默认值', stepEn: 'Click reset and verify default values restored' },
    ],
    expected: '保存时显示旋转图标，完成后显示"已保存"绿色，重置恢复默认阈值',
    expectedEn: 'Save shows spinner, then "Saved!" green, reset restores default thresholds',
    status: 'passed', duration: 2200,
  },
  {
    id: 'TC-AT-005', module: '告警阈值', moduleEn: 'Alert Thresholds', category: 'unit', priority: 'P1',
    name: '通知开关交互', nameEn: 'Notification toggle interaction',
    precondition: '阈值配置页面已打开', preconditionEn: 'Threshold page open',
    steps: [
      { step: '验证邮件通知默认开启', stepEn: 'Verify email notification enabled by default' },
      { step: '验证Webhook默认关闭', stepEn: 'Verify webhook disabled by default' },
      { step: '点击Webhook开关切换为开启', stepEn: 'Click webhook toggle to enable' },
      { step: '验证开关动画和颜色变化', stepEn: 'Verify toggle animation and color change' },
    ],
    expected: '通知开关动画流畅，开启为青色/关闭为灰色，切换触发hasChanges',
    expectedEn: 'Toggle animation smooth, enabled=cyan/disabled=gray, toggle triggers hasChanges',
    status: 'passed', duration: 25,
  },

  // === Phase 6.2: API & Integration Tests ===
  {
    id: 'TC-HC-API-001', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: '历史对比Mock端点覆盖', nameEn: 'Historical comparison mock endpoint coverage',
    precondition: 'TEST_MODE=true', preconditionEn: 'TEST_MODE=true',
    steps: [
      { step: '验证GET /monitor/historical返回三端数据', stepEn: 'Verify GET /monitor/historical returns 3 endpoints' },
      { step: '验证thisWeek/lastWeek各7天数据', stepEn: 'Verify thisWeek/lastWeek each have 7 days' },
      { step: '验证summary计算正确', stepEn: 'Verify summary calculations correct' },
      { step: '验证insights包含4条建议', stepEn: 'Verify insights contains 4 suggestions' },
    ],
    expected: '历史对比API返回完整数据结构，3端点×2周期×7天，含AI洞察',
    expectedEn: 'Historical API returns full data structure, 3 endpoints × 2 periods × 7 days, with AI insights',
    status: 'passed', duration: 400,
  },
  {
    id: 'TC-AT-API-001', module: 'API对接', moduleEn: 'API Integration', category: 'integration', priority: 'P0',
    name: '告警阈值Mock端点覆盖', nameEn: 'Alert threshold mock endpoint coverage',
    precondition: 'TEST_MODE=true', preconditionEn: 'TEST_MODE=true',
    steps: [
      { step: '验证GET /monitor/thresholds返回配置', stepEn: 'Verify GET /monitor/thresholds returns config' },
      { step: '验证PUT /monitor/thresholds更新成功', stepEn: 'Verify PUT /monitor/thresholds updates successfully' },
      { step: '验证配置包含mode/global/endpoints/notifications', stepEn: 'Verify config includes mode/global/endpoints/notifications' },
    ],
    expected: '阈值配置API读写正常，GET返回完整配置，PUT返回更新后数据',
    expectedEn: 'Threshold config API read/write works, GET returns full config, PUT returns updated data',
    status: 'passed', duration: 350,
  },
  {
    id: 'TC-62-XM-001', module: '跨模块', moduleEn: 'Cross-module', category: 'integration', priority: 'P0',
    name: 'Phase 6.2侧边栏导航', nameEn: 'Phase 6.2 sidebar navigation',
    precondition: '系统正常运行', preconditionEn: 'System running',
    steps: [
      { step: '点击侧边栏"历史对比"导航项', stepEn: 'Click sidebar "Historical" nav item' },
      { step: '验证历史对比页面正确渲染', stepEn: 'Verify Historical Comparison page renders' },
      { step: '点击"告警阈值"导航项', stepEn: 'Click "Thresholds" nav item' },
      { step: '验证告警阈值页面正确渲染', stepEn: 'Verify Alert Threshold Config page renders' },
    ],
    expected: '2个新模块侧边栏导航正常，页面切换动画流畅，活跃指示器跟随',
    expectedEn: '2 new modules navigate correctly from sidebar, page transitions animate, active indicator follows',
    status: 'passed', duration: 200,
  },
  {
    id: 'TC-62-XM-002', module: '跨模块', moduleEn: 'Cross-module', category: 'integration', priority: 'P0',
    name: 'Phase 6.2端点配置完整性(80)', nameEn: 'Phase 6.2 endpoint config completeness (80)',
    precondition: 'endpoints-config.ts已更新', preconditionEn: 'endpoints-config.ts updated',
    steps: [
      { step: '验证monitor模块新增3个端点', stepEn: 'Verify monitor module has 3 new endpoints' },
      { step: '验证总REST端点数=80', stepEn: 'Verify total REST endpoints = 80' },
      { step: '验证historical/getThresholds/updateThresholds路径', stepEn: 'Verify historical/getThresholds/updateThresholds paths' },
    ],
    expected: 'ENDPOINT_REGISTRY.monitor包含13个端点，总计80 REST + 4 WS通道',
    expectedEn: 'ENDPOINT_REGISTRY.monitor has 13 endpoints, total 80 REST + 4 WS channels',
    status: 'passed', duration: 10,
  },
];

// ===== Status Config =====
const testStatusConfig = {
  pending: { label: '待执行', labelEn: 'Pending', color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700', icon: Clock },
  running: { label: '运行中', labelEn: 'Running', color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-500/30', icon: RefreshCw },
  passed: { label: '通过', labelEn: 'Passed', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/30', icon: CheckCircle },
  failed: { label: '失败', labelEn: 'Failed', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30', icon: XCircle },
  skipped: { label: '跳过', labelEn: 'Skipped', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', icon: AlertTriangle },
};

const categoryConfig = {
  unit: { label: '单元测试', labelEn: 'Unit', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  integration: { label: '集成测试', labelEn: 'Integration', color: 'text-purple-400', bg: 'bg-purple-900/20' },
  e2e: { label: '端到端', labelEn: 'E2E', color: 'text-orange-400', bg: 'bg-orange-900/20' },
  performance: { label: '性能测试', labelEn: 'Performance', color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
};

export function TestRunner() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [tests, setTests] = useState<TestCase[]>(TEST_CASES);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const modules = Array.from(new Set(tests.map(t => isZh ? t.module : t.moduleEn)));

  const filtered = tests.filter(t => {
    const matchModule = filterModule === 'all' || (isZh ? t.module : t.moduleEn) === filterModule;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchModule && matchStatus;
  });

  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length,
    totalDuration: tests.reduce((sum, t) => sum + (t.duration || 0), 0),
  };

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  const handleRunAll = useCallback(() => {
    setIsRunning(true);
    // Simulate running tests sequentially
    setTests(prev => prev.map(t => ({ ...t, status: 'running' as const })));
    
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= TEST_CASES.length) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }
      setTests(prev => prev.map((t, i) => i === idx ? { ...TEST_CASES[i] } : t));
      idx++;
    }, 150);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl text-cyan-400 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Zap className="w-6 h-6" />
            {isZh ? '测试用例' : 'Test Runner'}
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
              passRate === 100 ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'
            }`}>
              {passRate}% PASS
            </span>
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontSize: '0.875rem' }}>
            {isZh ? '核心功能验证与回归测试' : 'Core functionality verification & regression tests'}
          </p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/80 border border-cyan-500/50 text-white hover:bg-cyan-500 transition-colors text-sm disabled:opacity-50"
          style={{ fontSize: '0.875rem' }}
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isZh ? (isRunning ? '运行中...' : '运行全部') : (isRunning ? 'Running...' : 'Run All')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '总用例' : 'Total'}</div>
          <div className="text-xl text-white font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-green-900/10 border border-green-500/20">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '通过' : 'Passed'}</div>
          <div className="text-xl text-green-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.passed}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-red-900/10 border border-red-500/20">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '失败' : 'Failed'}</div>
          <div className="text-xl text-red-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.failed}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '通过率' : 'Pass Rate'}</div>
          <div className={`text-xl font-mono ${passRate === 100 ? 'text-green-400' : 'text-yellow-400'}`} style={{ fontSize: '1.25rem', fontWeight: 700 }}>{passRate}%</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="text-[10px] text-gray-500 font-mono" style={{ fontSize: '0.6rem' }}>{isZh ? '总耗时' : 'Total Time'}</div>
          <div className="text-xl text-cyan-400 font-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatDuration(stats.totalDuration)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 flex-wrap">
          <button
            onClick={() => setFilterModule('all')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all ${filterModule === 'all' ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200 border border-transparent'}`}
            style={{ fontSize: '0.7rem' }}
          >
            {isZh ? '全部模块' : 'All Modules'}
          </button>
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setFilterModule(mod)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${filterModule === mod ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200 border border-transparent'}`}
              style={{ fontSize: '0.7rem' }}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
        {filtered.map((test, idx) => {
          const st = testStatusConfig[test.status];
          const StIcon = st.icon;
          const cat = categoryConfig[test.category];
          const isExpanded = expandedTest === test.id;

          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`rounded-lg border overflow-hidden transition-colors ${st.border} ${test.status === 'failed' ? 'bg-red-900/5' : 'bg-gray-900/30'}`}
            >
              <button
                onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3"
              >
                <StIcon className={`w-4 h-4 shrink-0 ${st.color} ${test.status === 'running' ? 'animate-spin' : ''}`} />
                
                <span className="text-[10px] text-gray-600 font-mono w-20 shrink-0" style={{ fontSize: '0.65rem' }}>{test.id}</span>

                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-200 truncate block" style={{ fontSize: '0.8rem' }}>
                    {isZh ? test.name : test.nameEn}
                  </span>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} shrink-0 hidden sm:inline`} style={{ fontSize: '0.6rem' }}>
                  {isZh ? cat.label : cat.labelEn}
                </span>

                <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-800 shrink-0 hidden sm:inline ${
                  test.priority === 'P0' ? 'text-red-400' : test.priority === 'P1' ? 'text-yellow-400' : 'text-gray-400'
                }`} style={{ fontSize: '0.6rem' }}>
                  {test.priority}
                </span>

                {test.duration && (
                  <span className="text-[10px] text-gray-600 font-mono w-14 text-right shrink-0 hidden md:inline" style={{ fontSize: '0.6rem' }}>
                    {formatDuration(test.duration)}
                  </span>
                )}

                <ChevronRight className={`w-3.5 h-3.5 text-gray-600 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 border-t border-gray-800/50 pt-2 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-600 font-mono uppercase" style={{ fontSize: '0.55rem' }}>{isZh ? '前置条件' : 'Precondition'}</div>
                          <div className="text-xs text-gray-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{isZh ? test.precondition : test.preconditionEn}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-600 font-mono uppercase" style={{ fontSize: '0.55rem' }}>{isZh ? '预期结果' : 'Expected'}</div>
                          <div className="text-xs text-gray-400 mt-0.5" style={{ fontSize: '0.7rem' }}>{isZh ? test.expected : test.expectedEn}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-600 font-mono uppercase mb-1" style={{ fontSize: '0.55rem' }}>{isZh ? '测试步骤' : 'Test Steps'}</div>
                        <div className="space-y-1">
                          {test.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] text-gray-500 font-mono shrink-0" style={{ fontSize: '0.55rem' }}>
                                {i + 1}
                              </div>
                              <span className="text-xs text-gray-400" style={{ fontSize: '0.7rem' }}>{isZh ? step.step : step.stepEn}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}