import { createHmac, timingSafeEqual } from 'node:crypto';

// Meta WhatsApp Business Platform 的实际发送逻辑，被两处共用：
// 1) /api/integrations/whatsapp/send（人手在 UI 直接发送）
// 2) AI 助手的 send_whatsapp_message 工具（经用户确认后执行）
// 未配置凭证时明确返回 simulated:true，调用方（尤其是助手）必须把这个状态如实告知用户，
// 不能假装消息已经送达真实客户。
export async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION;

  if (!token || !phoneNumberId || !apiVersion) {
    return { ok: false, simulated: true, error: 'WhatsApp Business API is not configured' };
  }
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text } }),
    });
    const body = await response.json();
    if (!response.ok) return { ok: false, simulated: false, error: body.error?.message || 'WhatsApp send failed' };
    return { ok: true, simulated: false, body };
  } catch (error) {
    return { ok: false, simulated: false, error: error.message };
  }
}

export function verifyWhatsAppSignature(rawBody, signature) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !rawBody || !signature?.startsWith('sha256=')) return false;
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`);
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
