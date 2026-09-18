import React from 'react';
import { Clock, Eye, Globe2, ArrowUpRight } from 'lucide-react';
import { Article, LanguageCode } from '../types';
import { TRANSLATIONS } from '../lib/translations';

interface ArticleCardProps {
  article: Article;
  currentLang: LanguageCode;
  onSelect: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  currentLang,
  onSelect
}) => {
  const t = TRANSLATIONS[currentLang];

  const formatPubDate = (timestamp: any) => {
    if (!timestamp) return 'Hoje';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : currentLang, {
      day: '2-digit',
      month: 'short'
    });
  };

  const defaultImage = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80";

  return (
    <article 
      onClick={() => onSelect(article)}
      className="group flex flex-col justify-between overflow-hidden rounded-lg border border-[#e8e4dc] bg-white transition hover:-translate-y-0.5 hover:border-[#1a365d]/50 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Cover Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-[#f1ede6]">
          <img
            src={article.imagemUrl || defaultImage}
            alt={article.titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded bg-[#1a365d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {article.categoria}
            </span>
          </div>

          {article.isMultiLanguage && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              <Globe2 className="h-3 w-3" />
              <span>{article.languages?.length || 1}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#94a3b8]">
            <span>{formatPubDate(article.dataPublicacao)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article._readingTimeMinutes || 3} {t.tempo_leitura}
            </span>
          </div>

          <h3 
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            className="text-lg font-bold leading-snug text-[#0f2238] group-hover:text-[#991b1b] transition"
          >
            {article.titulo}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-[#475569] line-clamp-3 font-serif">
            {article.resumo}
          </p>
        </div>
      </div>

      {/* Footer Byline */}
      <div className="border-t border-[#f1ede6] px-4 py-2.5 text-xs text-[#64748b] flex items-center justify-between bg-[#fdfcfa]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-[#1e293b] truncate">
            {article.autorNome || 'Redação'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
          <Eye className="h-3 w-3" />
          <span>{article.visualizacoes || 0}</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#1a365d] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
        </div>
      </div>
    </article>
  );
};
