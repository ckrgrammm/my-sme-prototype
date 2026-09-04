// 补习中心 WhatsApp 报名对话的「业务知识」层：科目目录、每题的采集顺序与文字提取规则。
// 科目、时段、价格全部从 server/industries/tuition.js 的真实 packages 数据推导，
// 不允许凭空编造——这是 OPERATIONS_ASSISTANT.md 反复强调的红线
// （"The model must never invent availability, prices, policies, or commitments"）。
import { CONFIG } from '../data.js';
import { bi } from '../industries/shared.js';

// 从科目名称本身推断适用学制——packages 数据里的 subject 一律带 UPSR/PT3/SPM/IGCSE
// 前缀，这个前缀就是「这门课其实是哪个学制的」的唯一真实来源。绝不能只靠关键字
// 撞上什么科目就报什么科目，否则会出现「表单四学生被塞进 UPSR 温习班」这种
// 现实里压根不存在的报名组合——等于凭空编造了一个该学制不存在的产品。
function inferLevel(subject) {
  const text = `${subject.zh} ${subject.en}`;
  if (/upsr/i.test(text)) return 'UPSR / Primary';
  if (/pt3/i.test(text)) return 'PT3';
  if (/spm/i.test(text)) return 'SPM';
  if (/igcse/i.test(text)) return 'IGCSE';
  return null;
}

// 同一门课在数据里可能同时以「冲刺班／预购套餐」和「常规月费班」两种商业
// 形式出现（比如 SPM 附加数学：P01 是按堂冲刺班，P03/P10 是常规月费班）——
// 这在后台原本没问题，两条记录各自算各自的账；但现在要把科目直接报给
// 客户看，「冲刺班」只是收费方式的差异，不该在科目清单里被当成两门不同的课
// 重复列出。按中文名去掉「冲刺班/加强班」后台缀分组（中文命名比英文缩写一致），
// 有常规班版本的话优先用那个当显示名。
function canonicalSubjectKey(subject) {
  return subject.zh.replace(/冲刺班|加强班|考前冲刺班/g, '').trim();
}

function isCrashVariant(subject) {
  return /冲刺班|加强班|crash course|intensive/i.test(`${subject.zh} ${subject.en}`);
}

function buildSubjectCatalog() {
  const packages = CONFIG.tuition.packages;
  const bySubject = new Map();
  for (const pkg of packages) {
    const key = canonicalSubjectKey(pkg.subject);
    if (!bySubject.has(key)) {
      bySubject.set(key, { subject: pkg.subject, offers: [] });
    } else if (isCrashVariant(bySubject.get(key).subject) && !isCrashVariant(pkg.subject)) {
      bySubject.get(key).subject = pkg.subject; // 换成不带「冲刺班」字样的常规班名称当显示名
    }
    const entry = bySubject.get(key);
    const billingType = pkg.billingType === 'monthly' ? 'monthly' : 'per-class';
    const amount = billingType === 'monthly' ? pkg.monthlyFee : Math.round(pkg.fee / pkg.totalSessions);
    entry.offers.push({
      id: pkg.id,
      billingType,
      schedule: pkg.schedule,
      amount,
      sessionsPerMonth: pkg.expectedSessionsPerMonth || null,
    });
  }
  return [...bySubject.values()].map((entry) => ({
    subject: entry.subject,
    level: inferLevel(entry.subject),
    keywords: subjectKeywords(entry.subject),
    offers: entry.offers,
  }));
}

// 关键字表手动维护而不是自动切词——中英文科目名混杂缩写太多（Add Math / 附加数学 / A Math），
// 规则算法能覆盖的就是这一层，覆盖不到的会自然落入「无法识别，转人工」分支，这是设计上刻意的取舍。
function subjectKeywords(subject) {
  const text = `${subject.zh} ${subject.en}`.toLowerCase();
  const map = [
    { test: /add(itional)? math|附加数学/, words: ['add math', 'additional math', 'a math', 'amath', '附加数学'] },
    { test: /chemistry|化学/, words: ['chemistry', 'chem', '化学'] },
    { test: /science|科学|理科/, words: ['science', '科学', '理科'] },
    { test: /english|英文|英语/, words: ['english', '英文', '英语'] },
    { test: /bahasa malaysia|国文/, words: ['bahasa malaysia', 'bm', '国文', '马来文'] },
    { test: /mathematic|数学/, words: ['math', 'maths', 'mathematics', '数学'] },
    { test: /all.subjects|全科/, words: ['all subjects', 'all-subjects', '全科'] },
  ];
  const hit = map.find((m) => m.test.test(text));
  return hit ? hit.words : [subject.en.toLowerCase(), subject.zh];
}

export const SUBJECT_CATALOG = buildSubjectCatalog();

// 该学制实际开设的科目——用同一份列表来「报菜单」和「解析家长的回答」，
// 保证家长看到的选项跟系统实际能接受的答案永远是同一份数据，不会对不上。
export function subjectsForLevel(levelLabel) {
  if (!levelLabel) return SUBJECT_CATALOG;
  const atLevel = SUBJECT_CATALOG.filter((entry) => entry.level === levelLabel);
  return atLevel.length ? atLevel : SUBJECT_CATALOG; // 该学制目前一门都没有的话，退回显示全部，好过什么都不给看
}

function feeUnit(lang) {
  return lang === 'zh' ? '堂' : 'class';
}

// 报出编号清单后，家长最自然的回法是直接回数字，所以数字选择要跟关键字
// 匹配同等优先；两种方式解析的都是同一份 subjectsForLevel() 列表。
export function matchSubject(text, levelLabel) {
  const list = subjectsForLevel(levelLabel);
  const trimmed = text.trim();
  if (/^\d+$/.test(trimmed)) {
    const index = Number(trimmed) - 1;
    return list[index] || null;
  }
  const lower = text.toLowerCase();
  return list.find((entry) => entry.keywords.some((k) => lower.includes(k.toLowerCase()))) || null;
}

// 家长一确认年级/学制，就直接列出该学制实际开设的科目与价格——不用再让
// 家长自己猜有什么、猜错了才被打回来。清单本身就是防止「凭空承诺不存在
// 的科目」的第一道关卡：家长看到的从一开始就只会是这个学制真的有开的课。
export function subjectPrompt(collected, lang) {
  const levelLabel = collected?.studentLevel?.label;
  const list = subjectsForLevel(levelLabel);
  const lines = list.map((entry, i) => {
    const prices = [...new Set(entry.offers.map((offer) => offer.billingType === 'monthly'
      ? `RM${offer.amount}/${lang === 'zh' ? '月' : 'month'}`
      : `RM${offer.amount}/${feeUnit(lang)}`))].join(' · ');
    return `${i + 1}. ${lang === 'zh' ? entry.subject.zh : entry.subject.en} — ${prices}`;
  }).join('\n');
  return lang === 'zh'
    ? `我们目前开设的科目：\n${lines}\n\n想报读哪一个呢？（输入编号或科目名称都可以）`
    : `Here are the subjects we offer:\n${lines}\n\nWhich one would you like? (reply with the number or the subject name)`;
}

// 顺序刻意从最具体的马来西亚本地说法排到最笼统的国际说法——单独的
// "Year 6" 在本地语境其实有歧义（可能是 UPSR 的 Std 6，也可能是 IGCSE
// 学制），只有明确出现 "igcse" / "a level" 才标成 IGCSE，避免把常见的
// 本地口语误判成国际学制。
const LEVEL_PATTERNS = [
  { re: /std\s*\d|standard\s*\d|upsr|小\s*[1-6一二三四五六]/i, label: 'UPSR / Primary' },
  { re: /form\s*[1-3]|pt3|中\s*[1-3一二三]/i, label: 'PT3' },
  { re: /form\s*[4-5]|spm|中\s*[4-5四五]/i, label: 'SPM' },
  { re: /igcse|a.?level/i, label: 'IGCSE' },
  { re: /year\s*\d/i, label: null },
];

export function matchLevel(text) {
  const hit = LEVEL_PATTERNS.find((p) => p.re.test(text));
  if (hit) return hit.label ? { raw: text.trim(), label: hit.label } : null;
  return null;
}

export function matchBilling(text) {
  // 问题本身就是「按堂计费，还是月费套餐」，家长很自然地只回「monthly」/「月费」
  // 两个字，不会重复「套餐」这个词——原本只认「package/套餐」导致这类正常回答
  // 被打回重问，是提取规则没覆盖到自己问题里的用词，必须补上。
  if (/monthly|month|月费|按月/i.test(text)) return 'monthly';
  if (/per.?class|per.?session|按堂|一堂一堂|pay.?as.?you.?go/i.test(text)) return 'per-class';
  return null;
}

export function offersForSelection(collected) {
  if (!collected?.subject) return [];
  return collected.subject.offers.filter((offer) => offer.billingType === collected.billingPreference);
}

export function schedulePrompt(collected, lang) {
  const offers = offersForSelection(collected);
  const lines = offers.map((offer, index) => {
    const schedule = lang === 'zh' ? offer.schedule.zh : offer.schedule.en;
    const price = offer.billingType === 'monthly'
      ? `RM${offer.amount}/${lang === 'zh' ? '月' : 'month'}`
      : `RM${offer.amount}/${feeUnit(lang)}`;
    return `${index + 1}. ${schedule} — ${price}`;
  }).join('\n');
  if (!offers.length) {
    return lang === 'zh'
      ? '这个科目暂时没有您选择的收费方式。请输入「按堂」或「月费」重新选择。'
      : 'That billing option is not available for this subject. Please choose “per class” or “monthly”.';
  }
  return lang === 'zh'
    ? `请选择上课时段：\n${lines}\n\n请输入编号。`
    : `Please choose a class schedule:\n${lines}\n\nReply with the number.`;
}

export function matchSchedule(text, collected) {
  const offers = offersForSelection(collected);
  const trimmed = text.trim();
  if (/^\d+$/.test(trimmed)) return offers[Number(trimmed) - 1] || null;
  const lower = trimmed.toLowerCase();
  return offers.find((offer) => `${offer.schedule.zh} ${offer.schedule.en}`.toLowerCase().includes(lower)) || null;
}

// 家长很少只回一个名字，常见的是「我是 XXX」「my name is XXX」这类完整句子——
// 原本整句照单全收会把「My name is Yeoh Nicole」整段存成 guardianName。
// 先剥掉常见的自我介绍开头，剩下的当作名字本体。
const NAME_PREAMBLE = /^(my name is|i am|i'm|this is|我是|我叫|本人是)\s*[:：]?\s*/i;

export function matchName(text) {
  const trimmed = text.trim().replace(NAME_PREAMBLE, '').trim();
  if (!trimmed || /\d{5,}/.test(trimmed)) return null; // 一长串数字大概率不是名字（比如误输入电话）
  // 单字母与常见占位词只是测试/无效输入，不能让报名流程继续。
  // 两个字符仍可覆盖常见的简短中文姓名与英文昵称。
  if (trimmed.length < 2 || trimmed.length > 60) return null;
  const letters = trimmed.match(/\p{L}/gu) || [];
  if (letters.length < 2) return null; // 拒绝 "11"、"--" 等没有真实姓名文字的输入
  if (/^(?:test(?:ing)?|n\/?a|none|null|unknown|yes|no)$/i.test(trimmed)) return null;
  return trimmed;
}

export function isConfirmation(text) {
  if (isNegative(text) || /\b(?:do not|don't|dont|not|cannot|can't|cancel)\b.*\bconfirm\b/i.test(text) || /不.{0,3}确认|不要确认|取消确认/.test(text)) return false;
  return /^\s*(confirm|confirmed|yes|yep|ok(ay)?|sure|可以|确认|好的?|好|同意)\s*[.!。！]?\s*$/i.test(text);
}

export function isHumanRequest(text) {
  return /human|real person|agent|staff|speak to someone|人工|真人|客服|投诉|complain/i.test(text);
}

export function isNegative(text) {
  return /^\s*(no|nope|cancel|不要|不用了|取消)\s*[.!。！]?\s*$/i.test(text)
    || /\b(?:do not|don't|dont|not)\b.*\bconfirm\b/i.test(text)
    || /不.{0,3}确认|不要确认|取消确认/.test(text);
}

// 采集顺序：每题只问一件事，靠「当前问哪一题」缩小提取范围，
// 这是纯规则算法能可靠工作的关键——不用理解整句话，只需要理解「对这一题的回答」。
export const FIELD_ORDER = [
  {
    key: 'guardianName',
    prompt: bi('您好！想请问一下，怎么称呼您呢？（家长/监护人姓名）', "Hi! May I have your name (parent/guardian)?"),
    extract: (text) => matchName(text),
    invalidReply: bi('请输入至少两个字的家长/监护人姓名。', 'Please enter the parent/guardian name using at least two characters.'),
  },
  {
    key: 'studentName',
    prompt: bi('谢谢！请问孩子的姓名是？', "Thanks! And what's your child's name?"),
    extract: (text) => matchName(text),
    invalidReply: bi('请输入至少两个字的孩子姓名。', "Please enter your child's name using at least two characters."),
  },
  {
    key: 'studentLevel',
    prompt: bi('孩子目前是什么学制和年级呢？（例如 Standard 6、Form 3、SPM、IGCSE Year 6）', "What curriculum and year/form is your child in? (e.g. Standard 6, Form 3, SPM, or IGCSE Year 6)"),
    extract: (text) => matchLevel(text),
    invalidReply: bi('无法识别该学制或年级。请同时注明学制和年级，例如 Standard 6、Form 3、SPM 或 IGCSE Year 6。', "I couldn't identify that curriculum or level. Please use a format such as Standard 6, Form 3, SPM, or IGCSE Year 6."),
  },
  {
    key: 'subject',
    // 函数形式的 prompt：科目清单要按已收集到的年级/学制动态生成，
    // 不是固定文案——conversationEngine.js 的 resolvePrompt() 会识别并调用它。
    prompt: (collected, lang) => subjectPrompt(collected, lang),
    extract: (text, collected) => matchSubject(text, collected?.studentLevel?.label),
    invalidReply: (collected, lang) => (lang === 'zh' ? '不好意思，没有找到这个选项，请从下面的清单里选一个：' : "Sorry, I couldn't match that to an option — please pick from the list below:"),
  },
  {
    key: 'billingPreference',
    prompt: bi('付费方式想选按堂计费，还是按月付费呢？', 'Would you prefer to pay per class, or monthly?'),
    extract: (text, collected) => {
      const billing = matchBilling(text);
      if (!billing) return null;
      return collected?.subject?.offers.some((offer) => offer.billingType === billing) ? billing : null;
    },
    invalidReply: bi('这个科目没有该收费方式。请输入「按堂」或「月费」。', 'That billing option is unavailable for this subject. Reply “per class” or “monthly”.'),
  },
  {
    key: 'selectedOffer',
    prompt: (collected, lang) => schedulePrompt(collected, lang),
    extract: (text, collected) => matchSchedule(text, collected),
    invalidReply: (collected, lang) => schedulePrompt(collected, lang),
  },
];

export function fieldByKey(key) {
  return FIELD_ORDER.find((f) => f.key === key);
}
