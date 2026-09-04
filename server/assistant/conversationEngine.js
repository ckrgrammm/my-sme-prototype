// 客服端 WhatsApp 报名对话的状态机（OPERATIONS_ASSISTANT.md 第 4/6 节）。
// 纯规则算法，不接任何大模型：每一步只问一件事，用当前问的是哪一题来缩小
// 文字提取的范围。家长一旦回复 CONFIRM，报名记录立刻自动写入自动化控制台的
// 工单看板，无需职员手动操作——职员只在「无法识别 / 需要人工」时才会被叫入。
import { bi } from '../industries/shared.js';
import { getWorkflowStore } from '../workflow.js';
import { logAudit } from './store.js';
import { FIELD_ORDER, fieldByKey, isConfirmation, isHumanRequest, isNegative } from './tuitionIntake.js';

function detectLanguage(text) {
  return /[一-鿿]/.test(text) ? 'zh' : 'en';
}

function say(lang, zh, en) {
  return lang === 'zh' ? zh : en;
}

function findActiveItem(store, phone) {
  const ACTIVE_STAGES = ['inquiry', 'details_collection', 'options_presented'];
  return store.items.find((i) => i.phone === phone && ACTIVE_STAGES.includes(i.stage)) || null;
}

function createInquiryItem(store, phone) {
  store.sequence += 1;
  const item = {
    id: `ENQ-${String(store.sequence).padStart(4, '0')}`,
    customer: phone, // 收集到学生姓名后会立刻覆盖成「学生 · 年级」
    phone,
    route: '', cargo: '', amount: 0,
    stage: 'inquiry',
    source: 'WhatsApp',
    automation: bi('已进线，等待助手询问详情', 'Just came in — assistant will start collecting details'),
    needsAttention: false,
    age: 'now',
    language: null,
    transcript: [],
    collected: {},
    missingField: null,
    retryCount: 0,
    confidence: null,
  };
  store.items.unshift(item);
  return item;
}

function appendTranscript(item, dir, text) {
  item.transcript.push({ dir, text, at: new Date().toISOString() });
  item.age = 'now';
}

function escalate(item, lang, reasonZh, reasonEn) {
  item.needsAttention = true;
  item.automation = bi(`需人工介入：${reasonZh}`, `Needs human: ${reasonEn}`);
  return say(lang,
    '感谢您的消息！这个问题我需要请我们的工作人员为您处理，我们会尽快回复您。',
    "Thanks for the message! I'll need one of our team members to help with this — they'll get back to you shortly.");
}

function nextMissingField(collected) {
  return FIELD_ORDER.find((f) => collected[f.key] === undefined);
}

// field.prompt / field.invalidReply 大多数是固定的 bi(zh,en)，但「科目」这一题
// 要按已收集的年级动态报菜单，所以也允许写成函数 (collected, lang) => string。
// 这里统一解析，调用方不用关心某个字段到底是哪种写法。
function resolveText(value, collected, lang) {
  if (typeof value === 'function') return value(collected, lang);
  return value[lang];
}

function describeSummary(collected, lang) {
  const billingLabel = collected.billingPreference === 'package' ? say(lang, '月费套餐', 'monthly package') : say(lang, '按堂计费', 'pay-per-class');
  const subjectEntry = collected.subject;
  const slot = subjectEntry.slots[0];
  return say(lang,
    `请确认以下资料：\n学生：${collected.studentName}\n家长：${collected.guardianName}\n年级：${collected.studentLevel.raw}\n科目：${subjectEntry.subject.zh}\n上课时间：${slot.zh}（线上）\n付费方式：${billingLabel}\n\n回复 CONFIRM 确认报名，或告诉我您想更改的部分。`,
    `Please confirm these details:\nStudent: ${collected.studentName}\nGuardian: ${collected.guardianName}\nLevel: ${collected.studentLevel.raw}\nSubject: ${subjectEntry.subject.en}\nSchedule: ${slot.en} (online)\nBilling: ${billingLabel}\n\nReply CONFIRM to enrol, or tell me what you'd like to change.`);
}

function describeSubjectFee(subjectEntry, lang) {
  const slot = subjectEntry.slots[0];
  return say(lang,
    `${subjectEntry.subject.zh}：${slot.zh}（线上）· RM${subjectEntry.feePerClass}/堂`,
    `${subjectEntry.subject.en}: ${slot.en} (online) · RM${subjectEntry.feePerClass}/class`);
}

function finalizeEnrolment(item, lang) {
  const { collected } = item;
  const subject = collected.subject.subject;
  const slot = collected.subject.slots[0];
  const billingLabel = collected.billingPreference === 'package' ? say(lang, '月费套餐', 'monthly package') : say(lang, '按堂计费', 'pay-per-class');

  item.customer = `${collected.studentName} · ${collected.studentLevel.raw}`;
  item.route = lang === 'zh' ? slot.zh : slot.en;
  item.cargo = `${subject.zh} · ${billingLabel}`;
  item.amount = collected.subject.feePerClass;
  item.stage = 'customer_confirmed';
  item.confidence = 0.95;
  item.automation = bi('家长已在 WhatsApp 回复确认，报名记录已自动建立', 'Parent replied CONFIRM on WhatsApp · enrolment auto-created');

  // Stage 8（自动化）：预留名额与生成付款请求属于「配置后可自动执行」的动作
  // （spec 第 9 节），这里视为已配置，直接自动推进经过 slot_reserved 到 payment_pending；
  // 真正的收款确认目前没有接支付网关，停在这一步，交给职员在自动化面板手动
  // 点「执行下一步」——和其它行业「收款」阶段的处理方式完全一致。
  item.stage = 'payment_pending';
  item.automation = bi('名额已预留，付款请求已生成，等待家长付款', 'Slot reserved · payment request generated · awaiting payment');

  const ref = item.id;
  return say(lang,
    `太好了，${collected.studentName} 的报名已确认！✅\n参考编号：${ref}\n${subject.zh} · ${slot.zh}（线上）· RM${item.amount}/堂\n\n我们马上会发送付款链接给您，收到付款后老师和上课链接会另行通知。`,
    `You're all set — ${collected.studentName}'s enrolment is confirmed! ✅\nReference: ${ref}\n${subject.en} · ${slot.en} (online) · RM${item.amount}/class\n\nWe'll send a payment link shortly. Once payment is received, we'll share the tutor and class link.`);
}

// 目前只有补习中心配好了完整的资料采集流程（科目目录、必填字段、提取规则）。
// 其它行业的 WhatsApp 报名对话是 Phase 2+ 的工作，这里先明确拒绝而不是套用
// 补习中心的字段表跑出错误结果——参见 OPERATIONS_ASSISTANT.md 第 18 节的分阶段计划。
const SUPPORTED_INDUSTRIES = ['tuition'];

export function handleInboundMessage({ industry, phone, text }) {
  if (!SUPPORTED_INDUSTRIES.includes(industry)) {
    return { error: `WhatsApp intake is not yet configured for "${industry}" — only tuition is wired up in this phase` };
  }
  const store = getWorkflowStore(industry);
  if (!store) return { error: 'this industry has no intake workflow configured' };
  const message = String(text || '').trim();
  if (!message) return { error: 'message is required' };

  let item = findActiveItem(store, phone);
  const isNew = !item;
  if (isNew) item = createInquiryItem(store, phone);
  if (!item.language) item.language = detectLanguage(message);
  const lang = item.language;

  appendTranscript(item, 'in', message);
  logAudit({ industry, actor: 'customer', tool: 'whatsapp_inbound', input: { phone, text: message }, status: 'received' });

  let reply;

  if (item.needsAttention) {
    // 已经转人工的对话：只记录消息，不再自动推进，避免和职员的处理动作打架
    reply = say(lang, '感谢您的消息，我们的工作人员会尽快回复您。', 'Thanks for your message — our team will get back to you shortly.');
  } else if (isHumanRequest(message)) {
    reply = escalate(item, lang, '客户要求转人工', 'customer asked to speak with a person');
  } else if (item.stage === 'inquiry') {
    item.stage = 'details_collection';
    item.missingField = FIELD_ORDER[0].key;
    const greeting = say(lang, '您好，欢迎联系 ClassOps 补习中心！🎓', 'Hi, thanks for reaching out to ClassOps Tuition Centre! 🎓');
    reply = `${greeting}\n${resolveText(FIELD_ORDER[0].prompt, item.collected, lang)}`;
    item.automation = bi('助手正在 WhatsApp 上收集报名资料', 'Assistant collecting enrolment details on WhatsApp');
  } else if (item.stage === 'details_collection') {
    const field = fieldByKey(item.missingField) || nextMissingField(item.collected);
    const value = field.extract(message, item.collected);
    if (value === null || value === undefined) {
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount >= 3) {
        reply = escalate(item, lang, `助手无法识别「${field.key}」`, `assistant couldn't understand the reply for "${field.key}"`);
      } else {
        reply = field.invalidReply ? resolveText(field.invalidReply, item.collected, lang) : say(lang, '不好意思，我没太明白，可以再说一次吗？', "Sorry, I didn't quite catch that — could you rephrase?");
        reply += `\n${resolveText(field.prompt, item.collected, lang)}`;
      }
    } else {
      item.collected[field.key] = value;
      item.retryCount = 0;
      // 学生姓名一旦知道就立刻更新卡片上的 customer 显示，不用等到最终确认——
      // 职员在自动化面板扫一眼卡片，或对话中途转人工时，看到的应该是姓名而不是一串电话号码。
      if (item.collected.studentName) {
        item.customer = item.collected.studentLevel ? `${item.collected.studentName} · ${item.collected.studentLevel.raw}` : item.collected.studentName;
      }
      const next = nextMissingField(item.collected);
      if (next) {
        item.missingField = next.key;
        reply = resolveText(next.prompt, item.collected, lang);
      } else {
        item.missingField = null;
        item.stage = 'options_presented';
        item.automation = bi('已提供课程选项，等待家长选择', "Class options presented · awaiting parent's choice");
        reply = `${describeSubjectFee(item.collected.subject, lang)}\n\n${describeSummary(item.collected, lang)}`;
      }
    }
  } else if (item.stage === 'options_presented') {
    if (isConfirmation(message)) {
      reply = finalizeEnrolment(item, lang);
    } else if (isNegative(message)) {
      reply = escalate(item, lang, '家长想修改报名详情', 'parent wants to change the enrolment details');
    } else {
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount >= 3) {
        reply = escalate(item, lang, '家长未明确确认报名', "parent hasn't given a clear confirmation");
      } else {
        reply = say(lang, '不好意思，我没有理解您的意思。若同意以上安排，请回复 CONFIRM 确认报名。', "Sorry, I didn't catch that. If the details above look right, please reply CONFIRM to enrol.");
      }
    }
  } else {
    // 报名已确认/进入后续阶段的客户再次发消息：只做只读的状态说明，不再改动工单
    const stageLabel = store.stages.find(([key]) => key === item.stage)?.[1];
    reply = say(lang,
      `您的报名 ${item.id} 目前状态：${stageLabel?.zh || item.stage}。如需协助，请告诉我们。`,
      `Your enrolment ${item.id} is currently: ${stageLabel?.en || item.stage}. Let us know if you need anything.`);
  }

  appendTranscript(item, 'out', reply);
  logAudit({ industry, actor: 'assistant', tool: 'whatsapp_outbound', input: { phone, text: reply, itemId: item.id, stage: item.stage }, status: 'sent' });

  return { reply, item, isNewConversation: isNew };
}
