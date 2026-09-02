import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { t } from './i18n.js';
import { cn } from './lib/utils.js';
import IndustryPicker from './components/IndustryPicker.jsx';
import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import DetailScreen from './components/DetailScreen.jsx';
import FieldScreen from './components/FieldScreen.jsx';
import MonthlyScreen from './components/MonthlyScreen.jsx';
import MoreScreen from './components/MoreScreen.jsx';
import WorkflowScreen from './components/WorkflowScreen.jsx';
import { DispatchModal, SwitcherModal } from './components/Modals.jsx';

const DEFAULT_INDUSTRY = 'supplier';

export default function App() {
  const [industries, setIndustries] = useState([]);
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRY);
  const [cfg, setCfg] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [view, setView] = useState('home');
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [toast, setToast] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('sme_lang') || 'zh');
  const [role, setRole] = useState(() => localStorage.getItem('sme_role') || 'admin');
  const [navSide, setNavSide] = useState(() => localStorage.getItem('sme_navside') || 'left');

  const toggleNavSide = () => {
    const next = navSide === 'left' ? 'right' : 'left';
    localStorage.setItem('sme_navside', next);
    setNavSide(next);
  };

  const toggleLang = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('sme_lang', next);
    setLang(next);
  };

  const toggleRole = () => {
    const next = role === 'admin' ? 'staff' : 'admin';
    localStorage.setItem('sme_role', next);
    setRole(next);
    // 员工视角只看一线任务，切回时回到今日板
    setView(next === 'staff' ? 'field' : 'home');
    setDetailOrderId(null);
    setDispatchOrderId(null);
  };

  // 启动：拉取行业列表，并读取锁定的行业 / URL 参数
  useEffect(() => {
    api.getIndustries().then(setIndustries).catch((e) => setLoadError(e.message));
    const params = new URLSearchParams(location.search);
    const qIndustry = params.get('industry');
    if (qIndustry) {
      localStorage.setItem('sme_industry', qIndustry);
      setIndustry(qIndustry);
    } else {
      localStorage.setItem('sme_industry', DEFAULT_INDUSTRY);
      setIndustry(DEFAULT_INDUSTRY);
    }
  }, []);

  const refreshCfg = useCallback((key) => {
    return api.getIndustry(key).then(setCfg).catch((e) => {
      if (e.message === 'unknown industry') {
        // 旧的 ?industry= 链接或已下架的行业：清掉锁定，退回选择页而不是报错
        localStorage.removeItem('sme_industry');
        setIndustry(null);
        setCfg(null);
      } else {
        setLoadError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    if (industry) {
      setLoadError(null);
      refreshCfg(industry);
    } else {
      setCfg(null);
    }
  }, [industry, refreshCfg]);

  const chooseIndustry = (key) => {
    localStorage.setItem('sme_industry', key);
    setIndustry(key);
    setView('home');
    setDetailOrderId(null);
    setShowSwitcher(false);
  };

  const resetDemo = () => {
    localStorage.removeItem('sme_industry');
    setIndustry(null);
    setCfg(null);
    setShowSwitcher(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleAssign = async (resourceId) => {
    const resource = cfg.resources.find((r) => r.id === resourceId);
    try {
      await api.dispatch(industry, dispatchOrderId, resourceId);
      setDispatchOrderId(null);
      await refreshCfg(industry);
      showToast(t(lang, 'toastAssigned', resource.code, resource.staff));
    } catch (e) {
      showToast(t(lang, 'toastAssignFail', e.message));
    }
  };

  const handleAdvance = async (taskId) => {
    try {
      await api.advanceTask(industry, taskId);
      await refreshCfg(industry);
    } catch (e) {
      showToast(t(lang, 'toastUpdateFail', e.message));
    }
  };

  if (!industry) {
    if (!industries.length && !loadError) {
      return <div className="p-10 text-center text-sm text-muted-foreground">{t(lang, 'loading')}</div>;
    }
    if (loadError) {
      return <div className="p-10 text-center text-sm text-destructive">{t(lang, 'apiError')}<br />{loadError}</div>;
    }
    return <IndustryPicker industries={industries} onChoose={chooseIndustry} lang={lang} onToggleLang={toggleLang} />;
  }

  if (!cfg) {
    return loadError
      ? <div className="p-10 text-center text-sm text-destructive">{t(lang, 'apiError')}<br />{loadError}</div>
      : <div className="p-10 text-center text-sm text-muted-foreground">{t(lang, 'loading')}</div>;
  }

  const isStaff = role === 'staff';
  const showDetail = !isStaff && !!detailOrderId;
  const navPad = isStaff ? '' : navSide === 'right' ? 'md:pr-[232px]' : 'md:pl-[232px]';

  return (
    <div className={cn('relative flex min-h-screen flex-col bg-background', navPad)}>
      <TopBar
        cfg={cfg}
        showBack={showDetail}
        onBack={() => setDetailOrderId(null)}
        onLongPress={() => setShowSwitcher(true)}
        lang={lang}
        onToggleLang={toggleLang}
        role={role}
        onToggleRole={toggleRole}
        navSide={navSide}
        onToggleNavSide={toggleNavSide}
      />
      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-5 md:px-8 md:py-7 lg:px-10">
        {isStaff && <FieldScreen cfg={cfg} onAdvance={handleAdvance} lang={lang} />}
        {!isStaff && showDetail && <DetailScreen cfg={cfg} orderId={detailOrderId} lang={lang} />}
        {!isStaff && !showDetail && view === 'home' && (
          <HomeScreen cfg={cfg} onOpen={setDetailOrderId} onDispatch={setDispatchOrderId} lang={lang} />
        )}
        {!isStaff && !showDetail && view === 'workflow' && <WorkflowScreen lang={lang} onToast={showToast} />}
        {!isStaff && !showDetail && view === 'field' && <FieldScreen cfg={cfg} onAdvance={handleAdvance} lang={lang} />}
        {!isStaff && !showDetail && view === 'monthly' && <MonthlyScreen cfg={cfg} lang={lang} />}
        {!isStaff && !showDetail && view === 'more' && <MoreScreen cfg={cfg} lang={lang} />}
      </div>
      {!isStaff && !showDetail && (
        <BottomNav
          cfg={cfg}
          view={view}
          onTab={(tab) => { setView(tab); setDetailOrderId(null); }}
          lang={lang}
          side={navSide}
        />
      )}

      {!isStaff && dispatchOrderId && (
        <DispatchModal
          cfg={cfg}
          orderId={dispatchOrderId}
          onAssign={handleAssign}
          onClose={() => setDispatchOrderId(null)}
          lang={lang}
        />
      )}
      {showSwitcher && (
        <SwitcherModal
          industries={industries}
          current={industry}
          onChoose={chooseIndustry}
          onReset={resetDemo}
          onClose={() => setShowSwitcher(false)}
          lang={lang}
        />
      )}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] max-w-[88%] -translate-x-1/2 rounded-lg border border-border bg-secondary px-4.5 py-3 text-center text-sm font-semibold text-secondary-foreground shadow-popover">
          {toast}
        </div>
      )}
    </div>
  );
}
