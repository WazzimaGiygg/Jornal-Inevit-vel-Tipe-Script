import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  CloudSun, 
  User as UserIcon, 
  ShieldCheck, 
  PenTool, 
  X,
  Sparkles
} from 'lucide-react';
import { LanguageCode, AppUser, WeatherData } from '../types';
import { AVAILABLE_LANGUAGES, TRANSLATIONS } from '../lib/translations';

interface MastheadProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser: AppUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenNewArticle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  weather: WeatherData | null;
  onOpenWeatherModal: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  currentLang,
  onLanguageChange,
  currentUser,
  onLogin,
  onLogout,
  onOpenNewArticle,
  searchQuery,
  onSearchChange,
  weather,
  onOpenWeatherModal
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const activeLang = AVAILABLE_LANGUAGES.find(l => l.code === currentLang) || AVAILABLE_LANGUAGES[0];

  // Formatted date string in the active language
  const formattedDate = new Intl.DateTimeFormat(
    currentLang === 'pt' ? 'pt-BR' : currentLang,
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  ).format(new Date());

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="border-b-4 border-[#1a365d] bg-[#faf8f5] text-[#1a202c]">
      {/* Top Utility Bar */}
      <div className="border-b border-[#e2dcd2] px-4 py-1.5 text-xs text-[#64748b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Weather & Location */}
          <div className="flex items-center gap-3">
            {weather ? (
              <button 
                onClick={onOpenWeatherModal}
                id="masthead-weather-btn"
                className="group flex items-center gap-1.5 rounded px-2 py-0.5 font-medium text-[#1e293b] transition hover:bg-[#eae5dc]"
                title="Clique para ver detalhes do tempo"
              >
                <span className="text-sm">{weather.emoji}</span>
                <span className="font-semibold text-[#0f2238]">{weather.temperature}°C</span>
                <span className="hidden sm:inline text-[#64748b]">• {weather.description}</span>
                <span className="hidden md:inline text-[#94a3b8]">({weather.city})</span>
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <CloudSun className="h-3.5 w-3.5 text-[#94a3b8]" />
                <span>Carregando previsão...</span>
              </span>
            )}
          </div>

          {/* Center Date & Edition Notice */}
          <div className="hidden lg:block font-medium tracking-wide text-[#475569]">
            <span>{capitalizedDate}</span>
            <span className="mx-2 text-[#cbd5e1]">|</span>
            <span className="font-serif italic text-[#991b1b]">{t.slogan}</span>
            <span className="mx-2 text-[#cbd5e1]">|</span>
            <span>{t.edicao_numero}</span>
          </div>

          {/* Right Tools: Language Selector & Auth */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 rounded border border-[#d5cfc4] bg-[#f5f2eb] px-2.5 py-1 text-xs font-medium text-[#1e293b] shadow-xs hover:bg-[#ebe6dc] transition"
              >
                <Globe className="h-3.5 w-3.5 text-[#1a365d]" />
                <span className="text-sm">{activeLang.flag}</span>
                <span className="font-semibold">{activeLang.code.toUpperCase()}</span>
              </button>

              {langDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-lg border border-[#d5cfc4] bg-white p-1.5 shadow-xl">
                    <div className="px-2 py-1 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                      Idiomas / Languages
                    </div>
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition ${
                          currentLang === lang.code
                            ? 'bg-[#1a365d] text-white font-medium'
                            : 'text-[#1e293b] hover:bg-[#f5f2eb]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        <span className="text-[10px] opacity-75">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white py-0.5 pl-1 pr-2.5 hover:shadow-xs transition"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      className="h-6 w-6 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[10px] font-bold text-white">
                      {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'AU'}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate text-xs font-semibold text-[#1e293b]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  {currentUser.role === 'admin' && (
                    <span className="rounded bg-[#991b1b] px-1 py-0.2 text-[9px] font-bold text-white uppercase">
                      Admin
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-lg border border-[#e2e8f0] bg-white p-2 shadow-xl">
                      <div className="border-b border-[#f1f5f9] px-2 pb-2 mb-1">
                        <p className="text-xs font-semibold text-[#0f172a] truncate">
                          {currentUser.displayName || 'Usuário Wazzima'}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#1a365d] font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Status: {currentUser.role === 'admin' ? t.admin_badge : t.autor_badge}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenNewArticle();
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[#0f172a] hover:bg-[#f8fafc]"
                      >
                        <PenTool className="h-3.5 w-3.5 text-[#1a365d]" />
                        <span>{t.nova_materia}</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[#b91c1c] hover:bg-[#fef2f2]"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t.sair}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                id="login-google-btn"
                onClick={onLogin}
                className="flex items-center gap-1.5 rounded-md bg-[#1a365d] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#152c4b] transition active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t.entrar}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Newspaper Masthead Banner */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left: Ecosystem stamp or small slogan on desktop */}
          <div className="hidden md:block w-48 text-left">
            <div className="border-l-2 border-[#991b1b] pl-2 text-[11px] uppercase tracking-wider text-[#64748b]">
              <span className="font-bold text-[#0f2238]">WazzimaGiygg</span>
              <p className="text-[10px] text-[#475569] leading-tight mt-0.5">
                Ecossistema de Conhecimento Livre & Imprensa Independente
              </p>
            </div>
          </div>

          {/* Center: Monumental Newspaper Name */}
          <div className="text-center flex-1">
            <div className="inline-block">
              <h1 
                style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0f2238] uppercase"
              >
                Jornal WazzimaGiygg
              </h1>
              
              <div className="mt-1 flex items-center justify-center gap-3 text-xs sm:text-sm font-serif italic text-[#991b1b]">
                <span className="h-px w-12 sm:w-20 bg-[#c0392b]/40"></span>
                <span className="font-bold tracking-wider uppercase text-[#b91c1c]">{t.slogan}</span>
                <span className="text-[#64748b]">•</span>
                <span className="tracking-wide text-[#475569]">{t.edicao_digital}</span>
                <span className="h-px w-12 sm:w-20 bg-[#c0392b]/40"></span>
              </div>
            </div>
          </div>

          {/* Right Action: Publish / Search */}
          <div className="flex items-center justify-end gap-2 md:w-48">
            <button
              id="new-article-masthead-btn"
              onClick={onOpenNewArticle}
              className="flex items-center gap-1.5 rounded border border-[#991b1b] bg-[#991b1b] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#7f1d1d] transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t.nova_materia}</span>
              <span className="sm:hidden">Publicar</span>
            </button>
          </div>
        </div>

        {/* Search row (Desktop & Mobile) */}
        <div className="mt-4 flex items-center justify-between border-t border-[#e2dcd2] pt-3 text-xs">
          <div className="flex items-center gap-2 text-[#475569] font-serif">
            <span className="font-bold text-[#0f2238] uppercase text-[11px] tracking-wider">
              {capitalizedDate}
            </span>
            <span className="hidden sm:inline text-[#94a3b8]">—</span>
            <span className="hidden sm:inline text-[#64748b]">Jornalismo Investigativo Sem Filtros</span>
          </div>

          <div className="relative w-full max-w-xs">
            <input
              id="global-search-input"
              type="text"
              placeholder={t.busca_placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-full border border-[#d5cfc4] bg-[#f5f2eb] py-1 pl-8 pr-7 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a365d] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1a365d]"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
