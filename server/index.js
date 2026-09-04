import express from 'express';
import cors from 'cors';
import { CONFIG, INDUSTRY_ORDER, genTimeline } from './data.js';
import { advanceWorkflow, createRequest, getWorkflow, hasWorkflow, verifyWorkflowPayment } from './workflow.js';
import { sendWhatsAppMessage, verifyWhatsAppSignature } from './whatsapp.js';
import { handleInboundMessage } from './assistant/conversationEngine.js';
import { claimInboundMessage, getAuditLog, logAudit } from './assistant/store.js';

try { process.loadEnvFile(); } catch { /* no .env file present — fall back to the process environment */ }

const app = express();
app.use(cors());
app.use(express.json({ verify: (req, _res, buffer) => { req.rawBody = buffer; } }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/integrations/whatsapp/status', (req, res) => {
  res.json({
    configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'configured' : null,
  });
});

app.get('/api/integrations/whatsapp/webhook', (req, res) => {
  const valid = Boolean(process.env.WHATSAPP_VERIFY_TOKEN)
    && req.query['hub.mode'] === 'subscribe'
    && req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN;
  if (!valid) return res.sendStatus(403);
  res.status(200).send(req.query['hub.challenge']);
});

// 目前只有补习中心接了完整的报名对话流程（server/assistant/conversationEngine.js），
// 所以这条真实 webhook 先固定路由到 tuition。真正多租户时应该从
// value.metadata.phone_number_id 反查是哪个卖家/哪个行业，而不是写死。
function resolveWebhookIndustry(phoneNumberId) {
  if (phoneNumberId && phoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID) return 'tuition';
  return null;
}

function extractInboundTextMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type === 'text' && msg.text?.body) messages.push({
          id: msg.id,
          from: msg.from,
          text: msg.text.body,
          phoneNumberId: change.value?.metadata?.phone_number_id,
        });
      }
    }
  }
  return messages;
}

app.post('/api/integrations/whatsapp/webhook', (req, res) => {
  if (!verifyWhatsAppSignature(req.rawBody, req.get('x-hub-signature-256'))) return res.sendStatus(401);
  const inbound = extractInboundTextMessages(req.body || {});
  res.sendStatus(200);
  setImmediate(async () => {
    for (const message of inbound) {
      if (!claimInboundMessage(message.id)) continue;
      const industry = resolveWebhookIndustry(message.phoneNumberId);
      if (!industry) {
        logAudit({ industry: 'unknown', actor: 'system', tool: 'whatsapp_inbound', input: { messageId: message.id, phoneNumberId: message.phoneNumberId }, status: 'rejected', output: { error: 'unmapped WhatsApp number' } });
        continue;
      }
      try {
        const result = handleInboundMessage({ industry, phone: message.from, text: message.text });
        if (result.error) throw new Error(result.error);
        const delivery = await sendWhatsAppMessage(message.from, result.reply);
        logAudit({ industry, actor: 'system', tool: 'whatsapp_delivery', input: { messageId: message.id, itemId: result.item.id }, status: delivery.ok ? 'sent' : 'failed', output: delivery.ok ? { response: delivery.body } : { error: delivery.error } });
      } catch (error) {
        logAudit({ industry, actor: 'system', tool: 'whatsapp_processing', input: { messageId: message.id }, status: 'failed', output: { error: error.message } });
      }
    }
  });
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

app.post('/api/:industry/workflow/:itemId/payment/verify', (req, res) => {
  const verificationSecret = process.env.PAYMENT_VERIFICATION_SECRET;
  if (!verificationSecret) return res.status(503).json({ error: 'payment verification is not configured' });
  if (req.get('x-payment-verification-secret') !== verificationSecret) return res.status(403).json({ error: 'invalid payment verification signature' });
  const result = verifyWorkflowPayment(req.params.industry, req.params.itemId, req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// 「扮演客户」测试入口：走的是和真实 webhook 完全相同的 conversationEngine，
// 差别只在于消息来源不是 Meta 而是职员自己在平台里打字模拟——因为本地开发
// 环境没有公网地址，Meta 打不到这台机器，这是唯一能端到端验证对话逻辑的办法。
app.post('/api/:industry/whatsapp/simulate', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'not found' });
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
