import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import Button from './ui/Button.jsx';

const copy = {
  en: {
    title: 'WhatsApp Tester', subtitle: 'Act as a customer texting the tuition centre — this runs the exact same conversation engine as the real WhatsApp webhook.',
    phone: 'Test phone number', newConversation: 'New conversation', placeholder: 'Type as the customer…', send: 'Send',
    empty: 'Send a message to start a conversation, e.g. "Hi, I want to enrol my child in a maths class."',
    state: 'Conversation state', stage: 'Stage', collected: 'Collected', missing: 'Waiting on', none: '—',
    needsAttention: 'Needs human attention', close: 'Close',
  },
  zh: {
    title: 'WhatsApp 模拟测试', subtitle: '扮演给补习中心发消息的家长——这里跑的是和真实 WhatsApp webhook 完全相同的对话引擎。',
    phone: '测试电话号码', newConversation: '开始新对话', placeholder: '以客户身份输入…', send: '发送',
    empty: '发一条消息开始对话，例如「你好，想帮孩子报数学班」。',
    state: '对话状态', stage: '阶段', collected: '已收集', missing: '等待中', none: '—',
    needsAttention: '需要人工处理', close: '关闭',
  },
};

function randomPhone() {
  return '+60 1' + Math.floor(10000000 + Math.random() * 89999999).toString();
}

export default function WhatsAppTester({ lang, industry, initialItem, onClose, onItemChanged }) {
  const c = copy[lang];
  const [phone, setPhone] = useState(() => initialItem?.phone || randomPhone());
  const [messages, setMessages] = useState(() => (initialItem?.transcript || []).map((t) => ({ dir: t.dir, text: t.text })));
  const [input, setInput] = useState('');
  const [item, setItem] = useState(initialItem || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); setError(null);
    setMessages((m) => [...m, { dir: 'in', text }]);
    setLoading(true);
    try {
      const result = await api.simulateWhatsapp(industry, phone, text);
      setMessages((m) => [...m, { dir: 'out', text: result.reply }]);
      setItem(result.item);
      onItemChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setPhone(randomPhone());
    setMessages([]);
    setItem(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between border-b border-border p-4">
            <div>
              <div className="text-sm font-extrabold">🧪 {c.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{c.subtitle}</div>
              <div className="mt-2 flex items-center gap-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border bg-white px-2.5 py-1 text-[11px] font-semibold" />
                <button onClick={startNew} className="text-[11px] font-bold text-primary underline decoration-dotted">{c.newConversation}</button>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg bg-muted px-2.5 py-1.5 text-sm font-bold">×</button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50 p-4">
            {!messages.length && <p className="text-xs text-muted-foreground">{c.empty}</p>}
            {messages.map((m, i) => (
              <div key={i} className={m.dir === 'in' ? 'ml-10 flex justify-end' : 'mr-10'}>
                <div className={m.dir === 'in'
                  ? 'max-w-[85%] rounded-2xl rounded-tr-sm bg-green-600 px-3.5 py-2.5 text-xs font-medium text-white'
                  : 'max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-white px-3.5 py-2.5 text-xs text-foreground shadow-sm'}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">…</div>}
            {error && <div className="mr-10 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive">{error}</div>}
          </div>

          <div className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={c.placeholder}
              className="flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button disabled={loading || !input.trim()} onClick={send}>{c.send}</Button>
          </div>
        </div>

        <div className="w-[240px] flex-none overflow-y-auto border-l border-border bg-slate-50/60 p-4 text-xs">
          <div className="section-eyebrow">{c.state}</div>
          {item ? (
            <div className="mt-2 space-y-3">
              <div>
                <span className="font-bold text-primary">{item.id}</span>
                {item.needsAttention && <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">⚠ {c.needsAttention}</span>}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">{c.stage}</div>
                <div className="font-semibold">{item.stage}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">{c.collected}</div>
                {Object.keys(item.collected || {}).length
                  ? Object.entries(item.collected).map(([k, v]) => (
                      <div key={k} className="mt-1"><span className="text-muted-foreground">{k}:</span> {typeof v === 'object' ? (v.subject?.zh || v.raw || JSON.stringify(v)) : String(v)}</div>
                    ))
                  : <div className="mt-1 text-muted-foreground">{c.none}</div>}
              </div>
              {item.missingField && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{c.missing}</div>
                  <div className="font-semibold">{item.missingField}</div>
                </div>
              )}
            </div>
          ) : <div className="mt-2 text-muted-foreground">{c.none}</div>}
        </div>
      </div>
    </div>
  );
}
