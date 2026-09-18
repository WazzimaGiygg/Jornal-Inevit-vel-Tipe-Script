import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  BookOpen, 
  Clock, 
  Eye, 
  Globe2, 
  X,
  FileText
} from 'lucide-react';
import { Article, LanguageCode, CategoryId } from '../types';
import { CATEGORIES, TRANSLATIONS, getLocalizedArticle } from '../lib/translations';

interface ArchiveViewProps {
  articles: Article[];
  currentLang: LanguageCode;
  onSelectArticle: (article: Article) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  articles,
  currentLang,
  onSelectArticle
}) => {
  const t = TRANSLATIONS[currentLang];

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'recentes' | 'antigos' | 'lidos'>('recentes');

  // Filtered & sorted list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Localized representation
      const loc = getLocalizedArticle(art, currentLang);

      // Search keyword
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchTitle = (loc.titulo || '').toLowerCase().includes(q);
        const matchSummary = (loc.resumo || '').toLowerCase().includes(q);
        const matchAuthor = (loc.autorNome || '').toLowerCase().includes(q);
        const matchTags = (loc.tags || []).some((tag: string) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchAuthor && !matchTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'todos' && art.categoria !== selectedCategory) {
        return false;
      }

      // Dates
      if (startDate || endDate) {
        const articleDate = art.dataPublicacao 
          ? (art.dataPublicacao.toDate ? art.dataPublicacao.toDate() : new Date(art.dataPublicacao))
          : null;

        if (articleDate) {
          if (startDate) {
            const start = new Date(startDate);
            if (articleDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            if (articleDate > end) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'lidos') {
        return (b.visualizacoes || 0) - (a.visualizacoes || 0);
      }
      const dateA = a.dataPublicacao ? (a.dataPublicacao.toDate ? a.dataPublicacao.toDate().getTime() : new Date(a.dataPublicacao).getTime()) : 0;
      const dateB = b.dataPublicacao ? (b.dataPublicacao.toDate ? b.dataPublicacao.toDate().getTime() : new Date(b.dataPublicacao).getTime()) : 0;
      if (sortBy === 'antigos') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });
  }, [articles, keyword, selectedCategory, startDate, endDate, sortBy, currentLang]);

  const formatPubDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : currentLang, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const defaultImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-6">
      {/* Archive Header Banner */}
      <div className="rounded-xl border border-[#d5cfc4] bg-[#f5f2ea] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#991b1b]">
              <BookOpen className="h-4 w-4" />
              <span>HEMEROTECA & ARQUIVO DIGITAL</span>
            </div>
            <h2 
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              className="text-2xl sm:text-3xl font-bold text-[#0f2238] mt-1"
            >
              {t.arquivo_titulo}
            </h2>
            <p className="mt-1 text-xs text-[#64748b]">
              Consulte todas as edições, reportagens históricas e investigações publicadas no Jornal WazzimaGiygg.
            </p>
          </div>

          <div className="rounded-lg border border-[#e2dcd2] bg-white px-4 py-2.5 text-center shadow-xs">
            <span className="text-2xl font-black text-[#1a365d]">{filteredArticles.length}</span>
            <p className="text-[10px] uppercase tracking-wider text-[#64748b]">{t.total_materias}</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 border-t border-[#e2dcd2] pt-4">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <input
              id="archive-keyword-input"
              type="text"
              placeholder={t.busca_placeholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-md border border-[#d5cfc4] bg-white py-2 pl-8 pr-7 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94a3b8]" />
            {keyword && (
              <button 
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <select
              id="archive-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border border-[#d5cfc4] bg-white p-2 text-xs font-medium text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            >
              <option value="todos">📰 {t.todas_categorias}</option>
              {CATEGORIES.filter(c => c.id !== 'todos' && c.id !== 'arquivo').map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {t[c.key] || c.id.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="lg:col-span-3 flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Data inicial"
              className="w-full rounded-md border border-[#d5cfc4] bg-white p-1.5 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            />
            <span className="text-xs text-[#94a3b8]">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Data final"
              className="w-full rounded-md border border-[#d5cfc4] bg-white p-1.5 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            />
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              id="archive-sort-select"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-[#d5cfc4] bg-white p-2 text-xs font-medium text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            >
              <option value="recentes">⏱️ {t.mais_recentes}</option>
              <option value="antigos">📜 {t.mais_antigos}</option>
              <option value="lidos">🔥 {t.mais_lidos}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Archive List */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d5cfc4] bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#94a3b8] mb-3" />
          <h3 className="text-base font-bold text-[#0f2238]">{t.sem_resultados}</h3>
          <p className="mt-1 text-xs text-[#64748b]">Tente limpar os filtros de pesquisa ou alterar o período.</p>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedCategory('todos');
              setStartDate('');
              setEndDate('');
            }}
            className="mt-4 rounded-md bg-[#1a365d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#152c4b]"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#e8e4dc] rounded-xl border border-[#e8e4dc] bg-white shadow-xs">
          {filteredArticles.map((art) => {
            const loc = getLocalizedArticle(art, currentLang);
            return (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-[#fcfbf8] transition cursor-pointer"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-[#f1ede6]">
                    <img
                      src={art.imagemUrl || defaultImage}
                      alt={loc.titulo}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImage;
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-[#991b1b]">
                        {art.categoria}
                      </span>
                      <span className="text-[#cbd5e1]">•</span>
                      <span className="text-[#64748b]">{formatPubDate(art.dataPublicacao)}</span>
                      {art.isMultiLanguage && (
                        <>
                          <span className="text-[#cbd5e1]">•</span>
                          <span className="flex items-center gap-0.5 text-[#1a365d] font-semibold">
                            <Globe2 className="h-3 w-3" />
                            <span>{art.languages?.length || 1} idiomas</span>
                          </span>
                        </>
                      )}
                    </div>

                    <h3 
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      className="text-base font-bold text-[#0f2238] group-hover:text-[#991b1b] transition"
                    >
                      {loc.titulo}
                    </h3>

                    {loc.resumo && (
                      <p className="text-xs text-[#475569] line-clamp-1 font-serif">
                        {loc.resumo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-xs text-[#94a3b8] shrink-0">
                  <span className="font-semibold text-[#1e293b]">{art.autorNome || 'Redação'}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {art._readingTimeMinutes || 3} min
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {art.visualizacoes || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
