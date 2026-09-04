// 助手动作的审计记录，纯内存存储（原型阶段，重启即清空）。
// 对应 OPERATIONS_ASSISTANT.md 第 15 节的要求：记录输入、提取结果、
// 工具调用与最终结果——每一条进出 WhatsApp 的消息都要留痕。
let seq = 1;
const auditLog = [];

export function logAudit(entry) {
  const record = { id: seq++, timestamp: new Date().toISOString(), ...entry };
  auditLog.unshift(record);
  return record;
}

export function getAuditLog(industry, limit = 30) {
  return auditLog.filter((e) => e.industry === industry).slice(0, limit);
}
