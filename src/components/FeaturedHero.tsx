import React from 'react';
import { Clock, Eye, Sparkles, BookOpen, Globe2, Share2, Flame } from 'lucide-react';
import { Article, LanguageCode } from '../types';
import { TRANSLATIONS } from '../lib/translations';

interface FeaturedHeroProps {
  primaryArticle: Article | null;
  subArticles: Article[];
  currentLang: LanguageCode;
  onSelectArticle: (article: Article) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  primaryArticle,
  subArticles,
  currentLang,
  onSelectArticle
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!primaryArticle) return null;

  // Format date
  const formatPubDate = (timestamp: any) => {
    if (!timestamp) return 'Recente';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : currentLang, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const defaultHeroImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80";

  return (
    <section className="mb-8 border-b-2 border-[#1a365d]/20 pb-8">
      {/* Breaking / Top Headline Label */}
      <div className="mb-4 flex items-center justify-between border-b border-[#e2dcd2] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-[#991b1b] px-2 py-0.5 text-[11px] font-black uppercase tracking-widest text-white">
            <Flame className="h-3 w-3 animate-pulse" />
            {t.destaque_principal}
          </span>
          <span className="text-xs font-serif italic text-[#64748b]">
            Reportagem Principal • Atualização Contínua
          </span>
        </div>
        <div className="text-xs font-mono text-[#94a3b8]">
          {primaryArticle.categoria.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Primary Headline (Lead Story) */}
        <div 
          onClick={() => onSelectArticle(primaryArticle)}
          className="group cursor-pointer lg:col-span-8 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition border border-[#e8e4dc]"
        >
          {/* Main Hero Image */}
          <div className="relative mb-4 aspect-16/9 w-full overflow-hidden rounded bg-[#1e293b]">
            <img
              src={primaryArticle.imagemUrl || defaultHeroImage}
              alt={primaryArticle.titulo}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultHeroImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

            {/* Badges on image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="rounded bg-[#991b1b] px-2.5 py-1 font-bold uppercase tracking-wider text-[10px]">
                {primaryArticle.categoria}
              </span>
              <div className="flex items-center gap-3 text-white/90 text-[11px] backdrop-blur-xs bg-black/40 px-2 py-0.5 rounded">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {primaryArticle._readingTimeMinutes || 3} {t.tempo_leitura}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {primaryArticle.visualizacoes || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Headline and Lead */}
          <div className="space-y-3">
            <h2 
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#0f2238] group-hover:text-[#991b1b] transition"
            >
              {primaryArticle.titulo}
            </h2>

            <p className="font-serif text-base sm:text-lg leading-relaxed text-[#334155] line-clamp-3">
              {primaryArticle.resumo}
            </p>

            {/* Author Byline & Multi-language tag */}
            <div className="flex flex-wrap items-center justify-between border-t border-[#f1ede6] pt-3 text-xs text-[#64748b]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a365d] font-bold text-white text-xs">
                  {primaryArticle.autorNome ? primaryArticle.autorNome.charAt(0).toUpperCase() : 'W'}
                </div>
                <div>
                  <span className="font-semibold text-[#1e293b]">
                    {t.por} {primaryArticle.autorNome || 'Redação WazzimaGiygg'}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span>{formatPubDate(primaryArticle.dataPublicacao)}</span>
                </div>
              </div>

              {primaryArticle.isMultiLanguage && (
                <div className="flex items-center gap-1 rounded bg-[#f1ede6] px-2 py-1 text-[11px] font-medium text-[#1a365d]">
                  <Globe2 className="h-3 w-3" />
                  <span>{primaryArticle.languages?.length || 1} idiomas</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Secondary Stories (Submanchetes) */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="border-b border-[#e2dcd2] pb-1.5 text-xs font-bold uppercase tracking-wider text-[#1a365d]">
            {t.destaques_urgentes}
          </div>

          <div className="flex flex-col gap-3.5 flex-1">
            {subArticles.slice(0, 3).map((sub, idx) => (
              <div
                key={sub.id}
                onClick={() => onSelectArticle(sub)}
                className="group cursor-pointer rounded-md border border-[#e8e4dc] bg-white p-3 shadow-xs hover:border-[#1a365d]/40 hover:shadow-sm transition"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded bg-[#e2e8f0]">
                    <img
                      src={sub.imagemUrl || defaultHeroImage}
                      alt={sub.titulo}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultHeroImage;
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#991b1b]">
                        {sub.categoria}
                      </span>
                      <h3 
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                        className="text-sm font-bold text-[#0f2238] line-clamp-2 leading-snug group-hover:text-[#991b1b] transition"
                      >
                        {sub.titulo}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#94a3b8]">
                      <span>{formatPubDate(sub.dataPublicacao)}</span>
                      <span>•</span>
                      <span>{sub.visualizacoes || 0} {t.visualizacoes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
