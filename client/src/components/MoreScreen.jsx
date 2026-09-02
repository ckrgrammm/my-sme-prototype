import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api.js';
import { pick, t } from '../i18n.js';
import Card from './ui/Card.jsx';
import Switch from './ui/Switch.jsx';
import Button from './ui/Button.jsx';
import Badge from './ui/Badge.jsx';

function AutoCard({ a, lang }) {
  const [on, setOn] = useState(false);
  let preview;
  if (a.preview === 'doc') {
    preview = (
      <div className="rounded-lg border border-border bg-card p-2.5">
        <div className="mb-1.5 text-[12.5px] font-extrabold text-foreground">{pick(lang, a.previewData.title)}</div>
        {a.previewData.lines.map((l, i) => (
          <div key={i} className="mt-0.5 text-xs text-muted-foreground">{pick(lang, l)}</div>
        ))}
      </div>
    );
  } else if (a.preview === 'wa') {
    preview = (
      <>
        <div className="wa-bubble">{pick(lang, a.previewData.text).split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>
        <div className="mt-2 text-[10px] text-muted-foreground">WhatsApp · {lang === 'zh' ? '自动发送' : 'Auto-sent'}</div>
      </>
    );
  } else {
    preview = <div className="font-bold text-destructive">{pick(lang, a.previewData)}</div>;
  }

  return (
    <Card className="mb-3 p-5 md:p-6">
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <div className="text-sm font-extrabold text-foreground">{pick(lang, a.title)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{pick(lang, a.pain)}</div>
        </div>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
      {on && <div className="mt-3 rounded-lg bg-muted p-2.5 text-[12.5px] text-foreground">{preview}</div>}
    </Card>
  );
}

function BrandingCard({ cfg, lang, branding, onChange }) {
  const [draft, setDraft] = useState(branding);
  const [saved, setSaved] = useState(false);
  const [whatsappReady, setWhatsappReady] = useState(false);
  useEffect(() => { api.getWhatsappStatus().then((result) => setWhatsappReady(result.configured)).catch(() => {}); }, []);
  const update = (key) => (event) => setDraft((value) => ({ ...value, [key]: event.target.value }));
  const uploadLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file || file.size > 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((value) => ({ ...value, logo: reader.result }));
    reader.readAsDataURL(file);
  };
  const save = () => { onChange(draft); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return <section className="mb-8">
    <div className="mb-3"><div className="section-eyebrow">{lang === 'zh' ? '公司设置' : 'COMPANY SETTINGS'}</div><h2 className="mt-1 text-lg font-extrabold">{lang === 'zh' ? '品牌与 WhatsApp' : 'Branding & WhatsApp'}</h2></div>
    <Card className="p-5 md:p-6"><div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-muted-foreground">{lang === 'zh' ? '公司名称' : 'Company name'}<input value={draft.name || ''} onChange={update('name')} placeholder={cfg.productName} className="mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="text-xs font-bold text-muted-foreground">{lang === 'zh' ? '公司简介／地点' : 'Subtitle / location'}<input value={draft.subtitle || ''} onChange={update('subtitle')} placeholder={`${pick(lang,cfg.name)} · Johor Bahru`} className="mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="text-xs font-bold text-muted-foreground sm:col-span-2">{lang === 'zh' ? '公司 WhatsApp 电话（含国家码）' : 'Company WhatsApp number (with country code)'}<input value={draft.whatsapp || ''} onChange={update('whatsapp')} placeholder="60123456789" className="mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" /></label></div>
      <div className="flex items-center gap-3 lg:flex-col"><div className="brand-mark !h-14 !w-14">{draft.logo ? <img src={draft.logo} alt="Logo preview" className="h-full w-full rounded-xl object-cover" /> : cfg.emoji}</div><label className="cursor-pointer text-xs font-extrabold text-primary">{lang === 'zh' ? '上传标志' : 'Upload logo'}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadLogo} /></label></div>
    </div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className="text-xs text-muted-foreground"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${whatsappReady ? 'bg-success' : 'bg-amber-500'}`} />{whatsappReady ? (lang === 'zh' ? 'WhatsApp Business API 已连接' : 'WhatsApp Business API connected') : (lang === 'zh' ? 'WhatsApp 电话链接可用；Business API 等待服务器凭证' : 'WhatsApp link ready; Business API awaits server credentials')}</div><Button size="sm" onClick={save}>{saved ? '✓' : (lang === 'zh' ? '保存设置' : 'Save settings')}</Button></div></Card>
  </section>;
}

/* =====================================================================
   真实的导入算法：解析我们自己模板的固定栏位（不做任意格式智能识别），
   逐行做必填/格式校验，并与系统现有客户 + 文件内本身做去重。
   ===================================================================== */
const EXPECTED_COLS = 5; // 客户名称, 联系电话, 资源, 负责人, 备注
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

function normalizeKey(name, phone) {
  const n = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const p = (phone || '').replace(/[^0-9]/g, '');
  return p ? `${n}|${p}` : n;
}

function parseRows(workbook) {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
  // 第一行是表头，跳过
  return rows.slice(1).map((r) => r.map((c) => String(c ?? '').trim()));
}

function validateAndDedupe(rows, cfg, lang) {
  const existingKeys = new Set(cfg.orders.map((o) => normalizeKey(o.customer, '')));
  // 现有客户也用「仅名字」维度比对一次，因为系统里没有存电话
  const seenInFile = new Map(); // key -> row number (1-based, 数据行)

  return rows.map((cols, i) => {
    const rowNum = i + 1;
    const [customer, phone, resource, staff] = cols;
    const errors = [];

    if (cols.length && cols.length !== EXPECTED_COLS) {
      errors.push(t(lang, 'importErrColumnCount', EXPECTED_COLS, cols.length));
    }
    if (!customer) errors.push(t(lang, 'importErrRequired', t(lang, 'importFieldCustomer')));
    if (!resource) errors.push(t(lang, 'importErrRequired', t(lang, 'importFieldResource')));
    if (!staff) errors.push(t(lang, 'importErrRequired', t(lang, 'importFieldStaff')));
    if (phone && !PHONE_RE.test(phone)) errors.push(t(lang, 'importErrPhone'));

    if (errors.length) {
      return { rowNum, cols, status: 'error', reasons: errors };
    }

    const nameKey = normalizeKey(customer, '');
    const fullKey = normalizeKey(customer, phone);

    if (existingKeys.has(nameKey)) {
      return { rowNum, cols, status: 'duplicate', reasons: [t(lang, 'importDupExisting', customer)] };
    }
    if (seenInFile.has(fullKey)) {
      return { rowNum, cols, status: 'duplicate', reasons: [t(lang, 'importDupInFile', seenInFile.get(fullKey))] };
    }
    seenInFile.set(fullKey, rowNum);

    return { rowNum, cols, status: 'valid', reasons: [] };
  });
}

export default function MoreScreen({ cfg, lang, branding = {}, onBrandingChange = () => {} }) {
  const fileInputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [results, setResults] = useState(null); // array from validateAndDedupe
  const [importedCount, setImportedCount] = useState(null);
  const resourceLabel = pick(lang, cfg.resourceLabel);
  const staffLabel = pick(lang, cfg.staffLabel);

  const downloadTemplate = () => {
    const csv = `﻿${t(lang, 'importFieldCustomer')},${t(lang, 'importFieldPhone')},${resourceLabel},${staffLabel},${lang === 'zh' ? '备注' : 'Notes'}\n${lang === 'zh' ? '示例 Sdn Bhd' : 'Sample Sdn Bhd'},012-3456789,${cfg.resources[0].code},${cfg.resources[0].staff},\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pick(lang, cfg.name)}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setResults(null);
    setParseError(null);
    setImportedCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setResults(null);
    setImportedCount(null);
    try {
      const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';
      // CSV 当纯文本读取并显式以 UTF-8 解码，避免中文栏位在没有 BOM 时被误判成其他编码变乱码；
      // .xlsx/.xls 是二进制压缩格式，仍需用 ArrayBuffer 读取
      const wb = isCsv
        ? XLSX.read(await file.text(), { type: 'string' })
        : XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = parseRows(wb);
      if (!rows.length) {
        setParseError(t(lang, 'importEmptyFile'));
      } else {
        setResults(validateAndDedupe(rows, cfg, lang));
      }
    } catch (e) {
      setParseError(t(lang, 'importEmptyFile'));
    } finally {
      setParsing(false);
    }
  };

  const validRows = results ? results.filter((r) => r.status === 'valid') : [];
  const dupRows = results ? results.filter((r) => r.status === 'duplicate') : [];
  const errRows = results ? results.filter((r) => r.status === 'error') : [];

  const confirmImport = () => {
    // 演示原型没有后端持久化，这里只反映真实解析/校验/去重跑出来的结果数量
    setImportedCount(validRows.length);
  };

  const statusBadge = (status) => {
    if (status === 'valid') return <Badge variant="success">✓</Badge>;
    if (status === 'duplicate') return <Badge variant="warning">⧉</Badge>;
    return <Badge variant="destructive">✕</Badge>;
  };

  return (
    <div className="space-y-8">
      <BrandingCard cfg={cfg} lang={lang} branding={branding} onChange={onBrandingChange} />
      <section>
      <h2 className="mb-3 text-base font-extrabold text-foreground">{t(lang, 'autoTitle')}</h2>
      {cfg.automations.map((a, i) => <AutoCard key={i} a={a} lang={lang} />)}
      </section>

      <section>
      <h2 className="mb-3 text-base font-extrabold text-foreground">{t(lang, 'importTitle')}</h2>
      <Card className="mb-4 p-5 md:p-6">
        <h4 className="mb-1.5 text-[15px] font-extrabold text-foreground">{t(lang, 'importCardTitle')}</h4>
        <p className="mb-3.5 text-[12.5px] text-muted-foreground">{t(lang, 'importCardDesc', resourceLabel)}</p>
        <Button variant="outline" className="w-full" onClick={downloadTemplate}>{t(lang, 'downloadTemplate')}</Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {!results && !parsing && (
          <div
            className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted p-6 text-center text-[13px] text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="mb-2 block text-3xl">📤</span>
            {t(lang, 'dropzoneText')}
            <div className="mt-2 text-xs font-bold text-primary">{t(lang, 'importChoose')}</div>
          </div>
        )}

        {parsing && (
          <div className="mt-3 rounded-xl border border-border bg-muted p-6 text-center text-[13px] text-muted-foreground">
            {t(lang, 'importParsing')}
          </div>
        )}

        {parseError && (
          <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-[12.5px] font-semibold text-destructive">
            ⚠ {parseError}
          </div>
        )}
        {parseError && (
          <Button variant="outline" size="sm" className="mt-2.5" onClick={resetImport}>{t(lang, 'importReset')}</Button>
        )}

        {results && (
          <div className="mt-3.5">
            <div className="mb-2 text-xs font-bold text-muted-foreground">{t(lang, 'importParsed', results.length)}</div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="success">{t(lang, 'importValidCount', validRows.length)}</Badge>
              <Badge variant="warning">{t(lang, 'importDupCount', dupRows.length)}</Badge>
              <Badge variant="destructive">{t(lang, 'importErrCount', errRows.length)}</Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[420px] border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border-b border-border bg-muted px-2 py-1.5 text-left font-bold text-muted-foreground"></th>
                    <th className="border-b border-border bg-muted px-2 py-1.5 text-left font-bold text-muted-foreground">{t(lang, 'importFieldCustomer')}</th>
                    <th className="border-b border-border bg-muted px-2 py-1.5 text-left font-bold text-muted-foreground">{resourceLabel}</th>
                    <th className="border-b border-border bg-muted px-2 py-1.5 text-left font-bold text-muted-foreground">{staffLabel}</th>
                    <th className="border-b border-border bg-muted px-2 py-1.5 text-left font-bold text-muted-foreground">{lang === 'zh' ? '备注' : 'Note'}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.rowNum} className={r.status !== 'valid' ? 'bg-muted/40' : undefined}>
                      <td className="border-b border-border px-2 py-1.5">{statusBadge(r.status)}</td>
                      <td className="border-b border-border px-2 py-1.5 text-foreground">{r.cols[0] || '—'}</td>
                      <td className="border-b border-border px-2 py-1.5 text-foreground">{r.cols[2] || '—'}</td>
                      <td className="border-b border-border px-2 py-1.5 text-foreground">{r.cols[3] || '—'}</td>
                      <td className="border-b border-border px-2 py-1.5 text-muted-foreground">
                        {r.reasons.length ? r.reasons.join('; ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importedCount === null ? (
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button disabled={!validRows.length} onClick={confirmImport}>
                  {validRows.length ? t(lang, 'importConfirmBtn', validRows.length) : t(lang, 'importNothingValid')}
                </Button>
                <Button variant="outline" onClick={resetImport}>{t(lang, 'importReset')}</Button>
              </div>
            ) : (
              <div className="mt-3.5">
                <div className="rounded-lg bg-success/15 px-2.5 py-2 text-[12.5px] font-bold text-success">
                  {t(lang, 'importConfirmedMsg', importedCount)}
                </div>
                <Button variant="outline" size="sm" className="mt-2.5" onClick={resetImport}>{t(lang, 'importReset')}</Button>
              </div>
            )}
          </div>
        )}
      </Card>
      </section>
    </div>
  );
}
