import express from 'express';
import cors from 'cors';
import { CONFIG, INDUSTRY_ORDER, genTimeline } from './data.js';
import { advanceWorkflow, createRequest, getWorkflow, hasWorkflow } from './workflow.js';

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

app.post('/api/integrations/whatsapp/webhook', (req, res) => {
  // Meta requires a fast acknowledgement. Production should enqueue the payload
  // for durable processing instead of doing workflow work in this request.
  res.sendStatus(200);
});

app.post('/api/integrations/whatsapp/send', async (req, res) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION;
  const { to, text } = req.body || {};
  if (!token || !phoneNumberId || !apiVersion) {
    return res.status(503).json({ error: 'WhatsApp Business API is not configured' });
  }
  if (!to || !text) return res.status(400).json({ error: 'to and text are required' });
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text } }),
    });
    const body = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: body.error?.message || 'WhatsApp send failed' });
    res.json(body);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
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
