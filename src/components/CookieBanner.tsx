import React, { useState, useEffect } from 'react';
import { Cookie, Check, ShieldCheck, X } from 'lucide-react';
import { CookiePreferences } from '../types';

export const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: false,
    timestamp: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('wzzm_cookie_consent');
    if (!saved) {
      // Delay display slightly for smooth page entry
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (updated: CookiePreferences) => {
    const full = { ...updated, timestamp: new Date().toISOString() };
    localStorage.setItem('wzzm_cookie_consent', JSON.stringify(full));
    setShow(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, advertising: true, timestamp: '' });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ essential: true, analytics: false, advertising: false, timestamp: '' });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl rounded-xl border border-[#d5cfc4] bg-[#faf8f5] p-5 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[#1a365d] p-2 text-white shrink-0">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0f2238]">Transparência e Privacidade</h4>
            <p className="mt-0.5 text-xs text-[#475569] leading-relaxed">
              O Jornal WazzimaGiygg utiliza cookies para garantir a navegação, memorizar seu idioma preferido e aprimorar a experiência de leitura independente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f1ede6]"
          >
            {showCustomize ? 'Fechar' : 'Opções'}
          </button>
          <button
            onClick={handleRejectNonEssential}
            className="rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f1ede6]"
          >
            Apenas Essenciais
          </button>
          <button
            onClick={handleAcceptAll}
            className="rounded-md bg-[#1a365d] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#152c4b] shadow-xs"
          >
            Aceitar Todos
          </button>
        </div>
      </div>

      {showCustomize && (
        <div className="mt-4 border-t border-[#e2dcd2] pt-4 space-y-2 text-xs">
          <label className="flex items-center justify-between rounded bg-white p-2 border border-[#e8e4dc]">
            <div>
              <span className="font-bold text-[#0f2238]">Cookies Essenciais</span>
              <p className="text-[11px] text-[#64748b]">Necessários para autenticação e idioma.</p>
            </div>
            <input type="checkbox" checked disabled className="h-4 w-4 text-[#1a365d]" />
          </label>

          <label className="flex items-center justify-between rounded bg-white p-2 border border-[#e8e4dc] cursor-pointer">
            <div>
              <span className="font-bold text-[#0f2238]">Cookies de Estatísticas & Métricas</span>
              <p className="text-[11px] text-[#64748b]">Contabilização de visualizações das matérias.</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs(prev => ({ ...prev, analytics: e.target.checked }))}
              className="h-4 w-4 text-[#1a365d]"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => savePreferences(prefs)}
              className="rounded-md bg-[#991b1b] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#7f1d1d]"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
