import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Share2, 
  Printer, 
  Edit3, 
  Trash2, 
  Clock, 
  Eye, 
  Check, 
  Globe, 
  ArrowLeft,
  Type,
  Maximize2
} from 'lucide-react';
import { Article, LanguageCode, AppUser } from '../types';
import { TRANSLATIONS, AVAILABLE_LANGUAGES, getLocalizedArticle } from '../lib/translations';

interface ArticleReaderModalProps {
  article: Article;
  currentLang: LanguageCode;
  currentUser: AppUser | null;
  onClose: () => void;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onSelectRelated: (article: Article) => void;
  relatedArticles: Article[];
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  currentLang,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onSelectRelated,
  relatedArticles
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(currentLang);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync active language when prop changes
  useEffect(() => {
    setSelectedLang(currentLang);
  }, [currentLang]);

  // Stop audio speech when component unmounts or article changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Localized version of the article
  const currentLocalizedArticle = getLocalizedArticle(article, selectedLang);

  // Check if current user is admin or author
  const canModify = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.uid === article.autorId
  );

  const formatPubDate = (timestamp: any) => {
    if (!timestamp) return 'Hoje';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(selectedLang === 'pt' ? 'pt-BR' : selectedLang, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Text-To-Speech handler
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Seu navegador não suporta leitura de áudio.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Plain text extraction
    const plainContent = currentLocalizedArticle.conteudo.replace(/<[^>]*>/g, ' ');
    const fullTextToRead = `${currentLocalizedArticle.titulo}. ${currentLocalizedArticle.resumo}. ${plainContent}`;

    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.lang = selectedLang === 'pt' ? 'pt-BR' : selectedLang;
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?artigo=' + article.id;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const defaultCoverImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80";

  // Font size classes
  const contentFontSizeClass = {
    sm: 'text-base leading-relaxed',
    base: 'text-lg leading-relaxed',
    lg: 'text-xl leading-loose',
    xl: 'text-2xl leading-loose'
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div 
        className="relative my-4 w-full max-w-4xl overflow-hidden rounded-xl border border-[#d5cfc4] bg-[#faf8f5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Reader Toolbar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between border-b border-[#e2dcd2] bg-[#f5f2ea]/95 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              id="reader-back-btn"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-[#1e293b] hover:bg-[#e8e4da] transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <span className="rounded bg-[#1a365d] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              {currentLocalizedArticle.categoria}
            </span>
          </div>

          {/* Reading Actions: Speech, Font, Print, Share, Modifiers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Reader */}
            <button
              onClick={toggleSpeech}
              id="reader-audio-btn"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                isPlayingAudio 
                  ? 'bg-[#991b1b] text-white animate-pulse' 
                  : 'bg-white border border-[#d5cfc4] text-[#1e293b] hover:bg-[#f1ede6]'
              }`}
              title={isPlayingAudio ? t.pausar_audio : t.ouvir_materia}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ouvindo...</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ouvir</span>
                </>
              )}
            </button>

            {/* Typography Controls */}
            <div className="flex items-center rounded-md border border-[#d5cfc4] bg-white p-0.5 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 font-bold ${fontSize === 'sm' ? 'bg-[#1a365d] text-white rounded-xs' : 'text-[#64748b]'}`}
                title="Fonte Pequena"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 font-bold ${fontSize === 'base' ? 'bg-[#1a365d] text-white rounded-xs' : 'text-[#64748b]'}`}
                title="Fonte Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 font-bold ${fontSize === 'lg' ? 'bg-[#1a365d] text-white rounded-xs' : 'text-[#64748b]'}`}
                title="Fonte Grande"
              >
                A+
              </button>
              <span className="mx-1 text-[#cbd5e1]">|</span>
              <button
                onClick={() => setIsSerif(!isSerif)}
                className="px-1.5 py-0.5 text-[11px] font-semibold text-[#1a365d] hover:underline"
              >
                {isSerif ? 'Serif' : 'Sans'}
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              id="reader-copy-btn"
              className="flex items-center gap-1 rounded-md border border-[#d5cfc4] bg-white px-2.5 py-1 text-xs font-semibold text-[#1e293b] hover:bg-[#f1ede6] transition"
              title="Copiar Link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copiado!' : t.compartilhar}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              id="reader-print-btn"
              className="hidden sm:flex items-center gap-1 rounded-md border border-[#d5cfc4] bg-white px-2 py-1 text-xs text-[#64748b] hover:bg-[#f1ede6]"
              title={t.imprimir}
            >
              <Printer className="h-3.5 w-3.5" />
            </button>

            {/* Edit / Delete actions */}
            {canModify && (
              <>
                <button
                  onClick={() => onEdit(article)}
                  id="reader-edit-btn"
                  className="flex items-center gap-1 rounded-md bg-[#1a365d] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#152c4b]"
                  title="Editar"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente excluir esta matéria permanentemente?")) {
                      onDelete(article.id);
                    }
                  }}
                  id="reader-delete-btn"
                  className="flex items-center rounded-md border border-[#ef4444]/30 bg-[#fee2e2] px-2 py-1 text-xs font-bold text-[#b91c1c] hover:bg-[#fecaca]"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              id="reader-close-modal-btn"
              className="rounded-md p-1 text-[#64748b] hover:bg-[#e2dcd2] hover:text-[#0f172a]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Article Body Container */}
        <div className="px-4 py-8 sm:px-10 sm:py-12">
          {/* Language selector strip for this article */}
          {article.isMultiLanguage && article.languages && article.languages.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-[#e2dcd2] bg-[#f5f2ea] p-2.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#1a365d]">
                <Globe className="h-3.5 w-3.5" />
                {t.artigo_disponivel_em}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {article.languages.map((code) => {
                  const langData = AVAILABLE_LANGUAGES.find(l => l.code === code);
                  const isSelected = selectedLang === code;
                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedLang(code)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium transition ${
                        isSelected
                          ? 'bg-[#1a365d] text-white shadow-xs'
                          : 'bg-white text-[#334155] hover:bg-[#eae5db]'
                      }`}
                    >
                      <span>{langData?.flag || '🌐'}</span>
                      <span>{langData?.name || code.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback notice if translated version is unavailable */}
          {currentLocalizedArticle._isFallback && selectedLang !== 'pt' && (
            <div className="mb-6 rounded-md bg-[#fef3c7] border border-[#fde68a] p-3 text-xs text-[#92400e]">
              ℹ️ {t.idioma_artigo_aviso}
            </div>
          )}

          {/* Masthead Article Category & Date */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-serif text-[#64748b]">
            <span className="font-bold text-[#991b1b] uppercase tracking-wider">
              {currentLocalizedArticle.categoria}
            </span>
            <span>•</span>
            <span>{formatPubDate(article.dataPublicacao)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article._readingTimeMinutes || 3} {t.tempo_leitura}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.visualizacoes || 0} {t.visualizacoes}
            </span>
          </div>

          {/* Main Title Headline */}
          <h1 
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            className="mb-4 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#0f2238]"
          >
            {currentLocalizedArticle.titulo}
          </h1>

          {/* Lead Deck / Resumo */}
          {currentLocalizedArticle.resumo && (
            <div className="mb-8 border-l-3 border-[#991b1b] pl-4">
              <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed text-[#334155]">
                {currentLocalizedArticle.resumo}
              </p>
            </div>
          )}

          {/* Author Byline */}
          <div className="mb-8 flex items-center justify-between border-y border-[#e2dcd2] py-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d] font-bold text-white text-sm shadow-xs">
                {article.autorNome ? article.autorNome.charAt(0).toUpperCase() : 'W'}
              </div>
              <div>
                <div className="font-bold text-[#0f2238] text-sm">
                  {article.autorNome || 'Redação WazzimaGiygg'}
                </div>
                <div className="text-[#64748b]">
                  {article.autorEmail || 'Correspondente Especial'} • Reportagem Investigativa
                </div>
              </div>
            </div>
          </div>

          {/* Lead Picture with caption */}
          {article.imagemUrl && (
            <figure className="mb-8 overflow-hidden rounded-lg border border-[#e8e4dc] bg-[#f1ede6]">
              <img
                src={article.imagemUrl || defaultCoverImage}
                alt={currentLocalizedArticle.titulo}
                className="max-h-[500px] w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultCoverImage;
                }}
              />
              <figcaption className="p-2 text-center text-xs text-[#64748b] italic bg-[#fcfbf9]">
                Foto/Reprodução: Arquivo Editorial • Jornal WazzimaGiygg
              </figcaption>
            </figure>
          )}

          {/* Full Article Content */}
          <div 
            className={`prose max-w-none text-[#1e293b] ${contentFontSizeClass} ${
              isSerif ? 'font-serif' : 'font-sans'
            }`}
          >
            {/* If content has HTML tags, render dangerously, otherwise render spaced paragraphs */}
            {currentLocalizedArticle.conteudo && currentLocalizedArticle.conteudo.includes('<') ? (
              <div 
                dangerouslySetInnerHTML={{ __html: currentLocalizedArticle.conteudo }} 
                className="space-y-4"
              />
            ) : (
              <div className="space-y-4">
                {currentLocalizedArticle.conteudo.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[#e2dcd2] pt-4">
              <span className="text-xs font-bold text-[#64748b]">TAGS:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-[#d5cfc4] bg-[#f5f2ea] px-3 py-0.5 text-xs text-[#334155]"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 border-t-2 border-[#1a365d]/20 pt-8">
              <h3 
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                className="mb-4 text-xl font-bold text-[#0f2238]"
              >
                {t.materias_relacionadas}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectRelated(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group cursor-pointer rounded-lg border border-[#e8e4dc] bg-white p-3 hover:shadow-md transition"
                  >
                    <div className="aspect-16/9 w-full overflow-hidden rounded bg-[#f1ede6] mb-2">
                      <img
                        src={rel.imagemUrl || defaultCoverImage}
                        alt={rel.titulo}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultCoverImage;
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[#991b1b]">
                      {rel.categoria}
                    </span>
                    <h4 
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      className="text-xs font-bold text-[#0f2238] line-clamp-2 mt-1 group-hover:text-[#991b1b]"
                    >
                      {rel.titulo}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
