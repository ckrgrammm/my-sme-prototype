import { WORKFLOWS } from './industries/index.js';
import { bi } from './industries/shared.js';

function snapshot(industry) {
  const data = WORKFLOWS[industry];
  if (!data) return null;
  const attention = data.items.filter((item) => item.needsAttention || item.needsApproval).length;
  const automated = data.items.length - attention;
  return {
    stages: data.stages.map(([key, label]) => ({ key, label })),
    items: data.items,
    events: data.events,
    fieldLabels: data.fieldLabels || null,
    metrics: { attention, automated, automationRate: Math.round((automated / data.items.length) * 100), hoursSaved: 6.4 },
  };
}

export function hasWorkflow(industry) {
  return !!WORKFLOWS[industry];
}

// 给 conversationEngine.js 用的可变访问入口——WhatsApp 对话引擎需要直接创建 /
// 修改工单（items 数组），不像其它调用方只需要只读快照。刻意不导出 WORKFLOWS 本身，
// 保持「谁能改数据」这件事只经过这一个函数。
export function getWorkflowStore(industry) {
  return WORKFLOWS[industry] || null;
}

export function getWorkflow(industry) {
  return snapshot(industry);
}

export function createRequest(industry, input = {}) {
  const data = WORKFLOWS[industry];
  if (!data) return { error: 'workflow is not configured for this industry' };
  const required = ['customer', 'phone', 'route', 'cargo'];
  const missing = required.filter((key) => !String(input[key] || '').trim());
  if (missing.length) return { error: `missing ${missing.join(', ')}` };
  data.sequence += 1;
  const item = {
    id: `${data.idPrefix}-${String(data.sequence).padStart(4, '0')}`,
    customer: input.customer.trim(),
    phone: input.phone.trim(),
    route: input.route.trim(),
    cargo: input.cargo.trim(),
    amount: Number(input.amount) || 0,
    stage: 'request',
    source: input.source || 'WhatsApp',
    automation: bi('需求已录入 · 正在核实资料', 'Request captured · validating details'),
    age: 'now',
  };
  data.items.unshift(item);
  data.events.unshift({ id: Date.now(), time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }), text: bi(`已从${item.source}录入 ${item.id}`, `${item.id} captured from ${item.source}`), type: 'request' });
  return { item, workflow: snapshot(industry) };
}

export function advanceWorkflow(industry, id) {
  const data = WORKFLOWS[industry];
  if (!data) return { error: 'workflow is not configured for this industry' };
  const item = data.items.find((entry) => entry.id === id);
  if (!item) return { error: 'workflow item not found' };
  const index = data.stages.findIndex(([key]) => key === item.stage);
  if (index < 0 || index === data.stages.length - 1) return { error: 'item is already complete' };
  item.stage = data.stages[index + 1][0];
  item.needsAttention = false;
  item.needsApproval = false;
  item.age = 'now';
  item.automation = data.messages[item.stage];
  data.events.unshift({ id: Date.now(), time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }), text: bi(`${item.id}：${item.automation.zh}`, `${item.id}: ${item.automation.en}`), type: item.stage });
  return { item, workflow: snapshot(industry) };
}
