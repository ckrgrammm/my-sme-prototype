// 客服端 WhatsApp 报名对话的状态机（OPERATIONS_ASSISTANT.md 第 4/6 节）。
// 纯规则算法，不接任何大模型：每一步只问一件事，用当前问的是哪一题来缩小
// 文字提取的范围。家长一旦回复 CONFIRM，报名记录立刻自动写入自动化控制台的
// 工单看板，无需职员手动操作——职员只在「无法识别 / 需要人工」时才会被叫入。
import { bi } from '../industries/shared.js';
import { getWorkflowStore } from '../workflow.js';
import { logAudit } from './store.js';
import { FIELD_ORDER, fieldByKey, isConfirmation, isHumanRequest, isNegative, matchBilling, matchLevel, matchSubject } from './tuitionIntake.js';
import { createTuitionPaymentRequest, reserveTuitionOffer } from './tuitionOperations.js';

function detectLanguage(text) {
  return /[一-鿿]/.test(text) ? 'zh' : 'en';
}

function say(lang, zh, en) {
  return lang === 'zh' ? zh : en;
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function prepareConversationItem(item) {
  item.transcript ||= [];
  item.collected ||= {};
  item.missingField ||= null;
  item.retryCount ||= 0;
  item.confidence ??= null;
  return item;
}

function findConversationItem(store, phone) {
  const normalized = normalizePhone(phone);
  const item = store.items.find((entry) => entry.source === 'WhatsApp' && normalizePhone(entry.phone) === normalized);
  return item ? prepareConversationItem(item) : null;
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

function cancelEnrolment(item, lang) {
  item.stage = 'cancelled';
  item.needsAttention = false;
  item.missingField = null;
  item.automation = bi('家长已取消此次报名', 'Parent cancelled this enrolment');
  return say(lang, '好的，这次报名已取消。如需重新报名，请告诉我们。', 'No problem — this enrolment has been cancelled. Message us whenever you would like to start again.');
}

// 有些字段（billingPreference / selectedOffer）在已知信息下其实只剩一个
// 合法答案——见 tuitionIntake.js 里的 autoFill。遇到这种字段就直接填好、
// 继续找下一题，不问只有一个答案的问题；autoFill 拿不出确定答案（比如
// 两种收费方式都真的可选）就还是照常问。
function nextMissingField(collected) {
  let next = FIELD_ORDER.find((f) => collected[f.key] === undefined);
  while (next && next.autoFill) {
    const value = next.autoFill(collected);
    if (value === undefined) break;
    collected[next.key] = value;
    next = FIELD_ORDER.find((f) => collected[f.key] === undefined);
  }
  return next;
}

function prefillFromOpeningMessage(message, collected) {
  const level = matchLevel(message);
  if (level?.label) collected.studentLevel = level;
  const subject = level?.label ? matchSubject(message, level.label) : null;
  if (subject) collected.subject = subject;
  const billing = matchBilling(message);
  if (billing && subject?.offers.some((offer) => offer.billingType === billing)) collected.billingPreference = billing;
}

// field.prompt / field.invalidReply 大多数是固定的 bi(zh,en)，但「科目」这一题
// 要按已收集的年级动态报菜单，所以也允许写成函数 (collected, lang) => string。
// 这里统一解析，调用方不用关心某个字段到底是哪种写法。
function resolveText(value, collected, lang) {
  if (typeof value === 'function') return value(collected, lang);
  return value[lang];
}

function describeSummary(collected, lang) {
  const billingLabel = collected.billingPreference === 'monthly' ? say(lang, '按月付费', 'monthly') : say(lang, '按堂计费', 'pay-per-class');
  const subjectEntry = collected.subject;
  const offer = collected.selectedOffer;
  const slot = offer.schedule;
  const price = offer.billingType === 'monthly' ? `RM${offer.amount}/${say(lang, '月', 'month')}` : `RM${offer.amount}/${say(lang, '堂', 'class')}`;
  return say(lang,
    `请确认以下资料：\n学生：${collected.studentName}\n家长：${collected.guardianName}\n年级：${collected.studentLevel.raw}\n科目：${subjectEntry.subject.zh}\n上课时间：${slot.zh}（线上）\n付费方式：${billingLabel}\n费用：${price}\n\n回复 CONFIRM 确认报名，或回复 CANCEL 取消。`,
    `Please confirm these details:\nStudent: ${collected.studentName}\nGuardian: ${collected.guardianName}\nLevel: ${collected.studentLevel.raw}\nSubject: ${subjectEntry.subject.en}\nSchedule: ${slot.en} (online)\nBilling: ${billingLabel}\nFee: ${price}\n\nReply CONFIRM to enrol, or CANCEL to stop.`);
}

function finalizeEnrolment(item, lang) {
  const { collected } = item;
  const subject = collected.subject.subject;
  const offer = collected.selectedOffer;
  const slot = offer.schedule;
  const billingLabel = collected.billingPreference === 'monthly' ? say(lang, '按月付费', 'monthly') : say(lang, '按堂计费', 'pay-per-class');

  item.customer = `${collected.studentName} · ${collected.studentLevel.raw}`;
  item.route = lang === 'zh' ? slot.zh : slot.en;
  item.cargo = `${subject.zh} · ${billingLabel}`;
  item.amount = offer.amount;
  item.billingType = offer.billingType;
  item.offerId = offer.id;
  item.stage = 'customer_confirmed';
  item.confidence = 0.95;
  item.automation = bi('家长已在 WhatsApp 回复确认，报名记录已自动建立', 'Parent replied CONFIRM on WhatsApp · enrolment auto-created');

  const reservation = reserveTuitionOffer({ enrolmentId: item.id, offer });
  if (!reservation.ok) {
    return escalate(item, lang, '所选时段已满', 'the selected class is full');
  }
  item.reservation = reservation.reservation;
  item.stage = 'slot_reserved';
  item.automation = bi('名额已预留，正在准备付款请求', 'Slot reserved · preparing payment request');

  const payment = createTuitionPaymentRequest({ enrolmentId: item.id, amount: item.amount, billingType: item.billingType });
  if (payment.ok) {
    item.paymentRequest = payment.paymentRequest;
    item.stage = 'payment_pending';
    item.automation = bi('名额已预留，付款链接已生成，等待家长付款', 'Slot reserved · payment link generated · awaiting payment');
  } else {
    item.needsAttention = true;
    item.automation = bi('名额已预留；付款系统未配置，需工作人员发送付款说明', 'Slot reserved; payment provider is not configured, so staff must send payment instructions');
  }

  const ref = item.id;
  const price = item.billingType === 'monthly' ? `RM${item.amount}/${say(lang, '月', 'month')}` : `RM${item.amount}/${say(lang, '堂', 'class')}`;
  if (payment.ok) {
    return say(lang,
      `太好了，${collected.studentName} 的资料已确认！✅\n参考编号：${ref}\n${subject.zh} · ${slot.zh}（线上）· ${price}\n付款链接：${payment.paymentRequest.url}\n\n付款核实后，报名才会正式生效。`,
      `Thanks — ${collected.studentName}'s details are confirmed! ✅\nReference: ${ref}\n${subject.en} · ${slot.en} (online) · ${price}\nPayment link: ${payment.paymentRequest.url}\n\nThe enrolment becomes active only after payment is verified.`);
  }
  return say(lang,
    `谢谢，${collected.studentName} 的资料已确认！✅\n参考编号：${ref}\n${subject.zh} · ${slot.zh}（线上）· ${price}\n\n名额已暂时保留，但付款系统尚未连接。工作人员会尽快发送付款说明；付款核实后报名才会生效。`,
    `Thanks — ${collected.studentName}'s details are confirmed! ✅\nReference: ${ref}\n${subject.en} · ${slot.en} (online) · ${price}\n\nThe slot is temporarily held, but online payment is not configured. Our team will send payment instructions; enrolment activates only after payment is verified.`);
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

  let item = findConversationItem(store, phone);
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
    prefillFromOpeningMessage(message, item.collected);
    item.stage = 'details_collection';
    const firstMissing = nextMissingField(item.collected);
    item.missingField = firstMissing.key;
    const greeting = say(lang, '您好，欢迎联系 ClassOps 补习中心！🎓', 'Hi, thanks for reaching out to ClassOps Tuition Centre! 🎓');
    reply = `${greeting}\n${resolveText(firstMissing.prompt, item.collected, lang)}`;
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
        reply = describeSummary(item.collected, lang);
      }
    }
  } else if (item.stage === 'options_presented') {
    if (isNegative(message)) {
      reply = cancelEnrolment(item, lang);
    } else if (isConfirmation(message)) {
      reply = finalizeEnrolment(item, lang);
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
  logAudit({ industry, actor: 'assistant', tool: 'whatsapp_outbound', input: { phone, text: reply, itemId: item.id, stage: item.stage }, status: 'prepared' });

  return { reply, item, isNewConversation: isNew };
}
