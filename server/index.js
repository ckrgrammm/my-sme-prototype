import express from 'express';
import cors from 'cors';
import { CONFIG, INDUSTRY_ORDER, genTimeline } from './data.js';
import { advanceWorkflow, createRequest, getWorkflow, hasWorkflow } from './workflow.js';
import { sendWhatsAppMessage } from './whatsapp.js';
import { handleInboundMessage } from './assistant/conversationEngine.js';
import { getAuditLog } from './assistant/store.js';

try { process.loadEnvFile(); } catch { /* no .env file present — fall back to the process environment */ }

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/integrations/whatsapp/status', (req, res) => {
  res.json({
    configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'configured' : null,
  });
});

app.get('/api/integrations/whatsapp/webhook', (req, res) => {
  const valid = req.query['hub.mode'] === 'subscribe'
    && req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN;
  if (!valid) return res.sendStatus(403);
  res.status(200).send(req.query['hub.challenge']);
});

// 目前只有补习中心接了完整的报名对话流程（server/assistant/conversationEngine.js），
// 所以这条真实 webhook 先固定路由到 tuition。真正多租户时应该从
// value.metadata.phone_number_id 反查是哪个卖家/哪个行业，而不是写死。
const WEBHOOK_INDUSTRY = 'tuition';

function extractInboundTextMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type === 'text' && msg.text?.body) messages.push({ from: msg.from, text: msg.text.body });
      }
    }
  }
  return messages;
}

app.post('/api/integrations/whatsapp/webhook', async (req, res) => {
  // Meta 要求 webhook 立刻确认收到；真正生产环境应该把 payload 放进持久队列
  // 异步处理，而不是在这个请求里直接跑对话逻辑。原型阶段先同步处理，图简单。
  res.sendStatus(200);
  const inbound = extractInboundTextMessages(req.body || {});
  for (const { from, text } of inbound) {
    const result = handleInboundMessage({ industry: WEBHOOK_INDUSTRY, phone: from, text });
    if (result.error) continue;
    await sendWhatsAppMessage(from, result.reply);
  }
});

app.post('/api/integrations/whatsapp/send', async (req, res) => {
  const { to, text } = req.body || {};
  if (!to || !text) return res.status(400).json({ error: 'to and text are required' });
  const result = await sendWhatsAppMessage(to, text);
  if (!result.ok) return res.status(result.simulated ? 503 : 502).json({ error: result.error });
  res.json(result.body);
});

app.get('/api/industries', (req, res) => {
  res.json(INDUSTRY_ORDER.map(k => ({
    key: k, name: CONFIG[k].name, emoji: CONFIG[k].emoji, tagline: CONFIG[k].tagline,
  })));
});

app.get('/api/:industry', (req, res) => {
  const cfg = CONFIG[req.params.industry];
  if (!cfg) return res.status(404).json({ error: 'unknown industry' });
  res.json(cfg);
});

app.get('/api/:industry/workflow', (req, res) => {
  if (!hasWorkflow(req.params.industry)) return res.status(404).json({ error: 'workflow is not configured for this industry' });
  res.json(getWorkflow(req.params.industry));
});

app.post('/api/:industry/workflow/requests', (req, res) => {
  if (!hasWorkflow(req.params.industry)) return res.status(404).json({ error: 'workflow is not configured for this industry' });
  const result = createRequest(req.params.industry, req.body);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result);
});

app.post('/api/:industry/workflow/:itemId/advance', (req, res) => {
  if (!hasWorkflow(req.params.industry)) return res.status(404).json({ error: 'workflow is not configured for this industry' });
  const result = advanceWorkflow(req.params.industry, req.params.itemId);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// 「扮演客户」测试入口：走的是和真实 webhook 完全相同的 conversationEngine，
// 差别只在于消息来源不是 Meta 而是职员自己在平台里打字模拟——因为本地开发
// 环境没有公网地址，Meta 打不到这台机器，这是唯一能端到端验证对话逻辑的办法。
app.post('/api/:industry/whatsapp/simulate', (req, res) => {
  if (!CONFIG[req.params.industry]) return res.status(404).json({ error: 'unknown industry' });
  const { phone, text } = req.body || {};
  if (!phone || !text) return res.status(400).json({ error: 'phone and text are required' });
  const result = handleInboundMessage({ industry: req.params.industry, phone, text });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.get('/api/:industry/assistant/audit', (req, res) => {
  if (!CONFIG[req.params.industry]) return res.status(404).json({ error: 'unknown industry' });
  res.json({ entries: getAuditLog(req.params.industry, Number(req.query.limit) || 30) });
});

app.post('/api/:industry/dispatch', (req, res) => {
  const cfg = CONFIG[req.params.industry];
  if (!cfg) return res.status(404).json({ error: 'unknown industry' });
  const { orderId, resourceId } = req.body || {};
  const order = cfg.orders.find(o => o.id === orderId);
  const resource = cfg.resources.find(r => r.id === resourceId);
  if (!order || !resource) return res.status(400).json({ error: 'invalid orderId/resourceId' });
  if (resource.status !== 'idle') return res.status(409).json({ error: 'resource not idle' });

  order.status = 'active';
  order.resourceId = resource.id;
  const now = new Date();
  order.timeline = genTimeline('active', now.getHours(), now.getMinutes());
  resource.status = 'active';

  res.json({ order, resource });
});

app.post('/api/:industry/tasks/:taskId/advance', (req, res) => {
  const cfg = CONFIG[req.params.industry];
  if (!cfg) return res.status(404).json({ error: 'unknown industry' });
  const task = cfg.fieldTasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'unknown task' });
  if (task.step < 3) task.step += 1;
  res.json({ task });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SME prototype API running at http://localhost:${PORT}`);
});
