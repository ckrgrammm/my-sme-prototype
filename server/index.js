import express from 'express';
import cors from 'cors';
import { CONFIG, INDUSTRY_ORDER, genTimeline } from './data.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

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
