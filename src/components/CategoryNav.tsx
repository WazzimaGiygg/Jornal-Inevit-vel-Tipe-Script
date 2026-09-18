import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  X, 
  Search, 
  BookOpen, 
  Flame,
  ArrowRight,
  Layers
} from 'lucide-react';
import { CategoryId, LanguageCode } from '../types';
import { CATEGORIES, TRANSLATIONS } from '../lib/translations';

interface CategoryNavProps {
  currentCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  currentLang: LanguageCode;
  categoryCounts?: Record<string, number>;
}

// Category grouping for the expanded index
const CATEGORY_GROUPS = [
  {
    title: 'Geral & Institucional',
    titleKey: 'group_geral',
    items: ['todos', 'politica', 'justica', 'internacional']
  },
  {
    title: 'Economia & Inovação',
    titleKey: 'group_economia',
    items: ['economia', 'tecnologia', 'redes_sociais']
  },
  {
    title: 'Investigação & Opinião',
    titleKey: 'group_investigacao',
    items: ['investigacao', 'opiniao', 'cultura', 'esporte']
  },
  {
    title: 'Cidadania & Acervo',
    titleKey: 'group_cidadania',
    items: ['saude', 'educacao', 'arquivo']
  }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentCategory,
  onSelectCategory,
  currentLang,
  categoryCounts = {}
}) => {
  const t = TRANSLATIONS[currentLang];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [indexSearch, setIndexSearch] = useState('');

  // Check scroll capability
  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [categoryCounts]);

  // Scroll active item into view
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const activeBtn = document.getElementById(`cat-nav-${currentCategory}`);
      if (activeBtn) {
        const elRect = el.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        if (btnRect.left < elRect.left || btnRect.right > elRect.right) {
          activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }
    updateScrollButtons();
  }, [currentCategory]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const handleSelectAndClose = (catId: CategoryId) => {
    onSelectCategory(catId);
    setIsIndexOpen(false);
    setIndexSearch('');
  };

  // Filtered categories for the index modal
  const filteredIndexCategories = CATEGORIES.filter(cat => {
    if (!indexSearch.trim()) return true;
    const q = indexSearch.toLowerCase();
    const label = (t[cat.key] || cat.id).toLowerCase();
    return label.includes(q) || cat.id.toLowerCase().includes(q);
  });

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-[#dcd6ca] bg-[#f4f1ea]/95 backdrop-blur-md shadow-xs transition-colors">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="relative flex items-center py-1.5">
            
            {/* "Todas as Seções" trigger button */}
            <button
              id="all-categories-index-btn"
              onClick={() => setIsIndexOpen(true)}
              className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition mr-2 ${
                isIndexOpen
                  ? 'border-[#1a365d] bg-[#1a365d] text-white shadow-xs'
                  : 'border-[#d5cfc4] bg-[#ebe6dc] text-[#1e293b] hover:border-[#1a365d]/50 hover:bg-[#dfd9ce]'
              }`}
              title="Abrir índice completo de editorias e cadernos"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#991b1b]" />
              <span className="hidden sm:inline">Editorias</span>
              <span className="sm:hidden">Menu</span>
              <span className="rounded-full bg-[#1a365d]/10 px-1 py-0.2 text-[10px] font-mono text-[#0f2238]">
                {CATEGORIES.length}
              </span>
            </button>

            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button
                id="cat-nav-scroll-left"
                onClick={() => handleScroll('left')}
                className="absolute left-24 sm:left-32 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#d5cfc4] bg-white/90 text-[#334155] shadow-md hover:bg-white hover:text-[#0f2238] transition"
                aria-label="Rolar para a esquerda"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Horizontal Scrollable Categories Stream */}
            <div
              ref={scrollContainerRef}
              onScroll={updateScrollButtons}
              className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 scroll-smooth flex-1"
            >
              {CATEGORIES.map((cat) => {
                const label = t[cat.key] || cat.id.toUpperCase();
                const isActive = currentCategory === cat.id;
                const count = categoryCounts[cat.id];

                return (
                  <button
                    key={cat.id}
                    id={`cat-nav-${cat.id}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`group flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      isActive
                        ? 'bg-[#1a365d] text-white shadow-xs font-bold'
                        : 'text-[#334155] hover:bg-[#eae5db] hover:text-[#0f172a]'
                    }`}
                  >
                    <span className="text-xs group-hover:scale-115 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="whitespace-nowrap">{label}</span>
                    {typeof count === 'number' && count > 0 && (
                      <span
                        className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-[#e2dcd0] text-[#475569] group-hover:bg-[#d5cfc0]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
              <button
                id="cat-nav-scroll-right"
                onClick={() => handleScroll('right')}
                className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#d5cfc4] bg-white/90 text-[#334155] shadow-md hover:bg-white hover:text-[#0f2238] transition"
                aria-label="Rolar para a direita"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Expanded Newspaper Index Modal / Drawer */}
      {isIndexOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsIndexOpen(false)}
        >
          <div 
            className="relative my-6 w-full max-w-4xl overflow-hidden rounded-xl border border-[#d5cfc4] bg-[#faf8f5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2dcd2] bg-[#f5f2ea] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#1a365d] p-2 text-white shadow-xs">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#991b1b]">
                    GUIA DE SEÇÕES & CADERNOS
                  </span>
                  <h3 
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    className="text-xl sm:text-2xl font-bold text-[#0f2238]"
                  >
                    Índice Geral do Jornal WazzimaGiygg
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsIndexOpen(false)}
                id="close-category-index-btn"
                className="rounded-md p-1.5 text-[#64748b] hover:bg-[#e2dcd2] hover:text-[#0f172a] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search filter in Index */}
            <div className="border-b border-[#e2dcd2] bg-[#fdfcfa] px-6 py-3">
              <div className="relative max-w-md">
                <input
                  id="category-index-search-input"
                  type="text"
                  value={indexSearch}
                  onChange={(e) => setIndexSearch(e.target.value)}
                  placeholder="Filtrar editorias por nome ou assunto..."
                  className="w-full rounded-md border border-[#d5cfc4] bg-white py-2 pl-9 pr-8 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a365d] focus:outline-hidden"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94a3b8]" />
                {indexSearch && (
                  <button 
                    onClick={() => setIndexSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content: Grouped or Filtered View */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {indexSearch.trim() ? (
                /* Search Results View */
                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                    {filteredIndexCategories.length} editorias encontradas
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredIndexCategories.map((cat) => {
                      const label = t[cat.key] || cat.id.toUpperCase();
                      const isActive = currentCategory === cat.id;
                      const count = categoryCounts[cat.id] || 0;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectAndClose(cat.id)}
                          className={`flex items-center justify-between rounded-lg border p-3.5 text-left transition ${
                            isActive
                              ? 'border-[#1a365d] bg-[#1a365d] text-white shadow-sm'
                              : 'border-[#e8e4dc] bg-white text-[#1e293b] hover:border-[#1a365d]/40 hover:bg-[#fcfbf9]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider">
                                {label}
                              </div>
                              <div className={`text-[11px] ${isActive ? 'text-white/80' : 'text-[#64748b]'}`}>
                                {count} {count === 1 ? 'matéria publicada' : 'matérias publicadas'}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#94a3b8]'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Grouped Editorial Cadernos View */
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {CATEGORY_GROUPS.map((group, groupIdx) => (
                    <div 
                      key={groupIdx} 
                      className="rounded-xl border border-[#e8e4dc] bg-white p-4 shadow-xs"
                    >
                      <h4 className="mb-3 flex items-center justify-between border-b border-[#f1ede6] pb-2 text-xs font-black uppercase tracking-wider text-[#1a365d]">
                        <span>{group.title}</span>
                        <span className="text-[10px] text-[#94a3b8] font-mono">CADERNO {groupIdx + 1}</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2">
                        {group.items.map((itemId) => {
                          const cat = CATEGORIES.find(c => c.id === itemId);
                          if (!cat) return null;
                          const label = t[cat.key] || cat.id.toUpperCase();
                          const isActive = currentCategory === cat.id;
                          const count = categoryCounts[cat.id] || 0;

                          return (
                            <button
                              key={cat.id}
                              onClick={() => handleSelectAndClose(cat.id)}
                              className={`group flex items-center justify-between rounded-md p-2.5 text-left transition ${
                                isActive
                                  ? 'bg-[#1a365d] text-white shadow-xs'
                                  : 'hover:bg-[#f5f2ea] text-[#1e293b]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base group-hover:scale-110 transition-transform">
                                  {cat.icon}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span 
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-[#e2dcd0] text-[#475569]'
                                  }`}
                                >
                                  {count}
                                </span>
                                <ArrowRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-[#1a365d]'}`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="flex items-center justify-between border-t border-[#e2dcd2] bg-[#f5f2ea] px-6 py-3 text-xs text-[#64748b]">
              <span>Selecione uma editoria para visualizar as publicações correspondentes.</span>
              <button
                onClick={() => handleSelectAndClose('todos')}
                className="font-bold text-[#991b1b] hover:underline"
              >
                Ver Todas as Notícias (Capa)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
