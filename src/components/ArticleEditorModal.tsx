import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  Globe2, 
  Image as ImageIcon, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Article, LanguageCode, AppUser, CategoryId } from '../types';
import { CATEGORIES, TRANSLATIONS, AVAILABLE_LANGUAGES } from '../lib/translations';
import { saveArticleToFirestore } from '../lib/firebase';

interface ArticleEditorModalProps {
  initialArticle?: Article | null;
  currentLang: LanguageCode;
  currentUser: AppUser | null;
  onClose: () => void;
  onSaved: (articleId: string) => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  initialArticle,
  currentLang,
  currentUser,
  onClose,
  onSaved
}) => {
  const t = TRANSLATIONS[currentLang];
  const isEditing = !!initialArticle;

  // Form states
  const [titulo, setTitulo] = useState(initialArticle?.titulo || '');
  const [categoria, setCategoria] = useState<string>(initialArticle?.categoria || 'politica');
  const [resumo, setResumo] = useState(initialArticle?.resumo || '');
  const [conteudo, setConteudo] = useState(initialArticle?.conteudo || '');
  const [imagemUrl, setImagemUrl] = useState(initialArticle?.imagemUrl || '');
  const [tagsInput, setTagsInput] = useState(initialArticle?.tags?.join(', ') || '');
  const [destaque, setDestaque] = useState(initialArticle?.destaque || false);

  // Multi-language translations state
  const [activeLangTab, setActiveLangTab] = useState<LanguageCode>('pt');
  const [translations, setTranslations] = useState<Record<string, { titulo: string; resumo: string; conteudo: string }>>(
    initialArticle?.translations ? (initialArticle.translations as any) : {}
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper for quick formatting in content textarea
  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('editor-content-input') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeLangTab === 'pt' ? conteudo : (translations[activeLangTab]?.conteudo || '');
    const selected = text.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    if (activeLangTab === 'pt') {
      setConteudo(newText);
    } else {
      setTranslations(prev => ({
        ...prev,
        [activeLangTab]: {
          ...prev[activeLangTab],
          conteudo: newText
        }
      }));
    }
  };

  // Load sample investigative story
  const loadSamplePost = () => {
    setTitulo("Nova Fronteira Geopolítica: A Corrida Tecnológica dos Semicondutores no Hemisfério Sul");
    setCategoria("tecnologia");
    setResumo("Relatório detalhado revela investimentos multibilionários em fábricas de microprocessadores e novos acordos de segurança digital entre nações emergentes.");
    setConteudo(
      `<h3>A Disputa Global por Silício e Soberania</h3>
<p>Na virada da última década, o controle da cadeia de suprimentos de semicondutores transcendeu o âmbito puramente industrial para se tornar o vetor primário de segurança nacional. Documentos recentes obtidos com exclusividade pela nossa equipe de reportagem detalham as iniciativas estratégicas para descentralização das fundições.</p>

<blockquote>"Quem detém a soberania sobre o ciclo completo de nanofabricação define os padrões operacionais das próximas três décadas", pontua especialista em política industrial de telecomunicações.</blockquote>

<h3>Impactos Econômicos e Novas Alianças</h3>
<p>Com incentivos fiscais recordes e parcerias com centros universitários pioneiros, a infraestrutura já começa a atrair os primeiros clusters de pesquisa de semicondutores de banda larga proibitiva, prometendo remodelar o equilíbrio tecnológico global.</p>

<p>A redação do Jornal WazzimaGiygg continuará acompanhando os desdobramentos desta matéria ao longo dos próximos meses.</p>`
    );
    setImagemUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80");
    setTagsInput("Tecnologia, Geopolítica, Semicondutores, Indústria, Futuro");
    setDestaque(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg("O título da matéria é obrigatório.");
      return;
    }
    if (!conteudo.trim()) {
      setErrorMsg("O conteúdo da matéria não pode estar vazio.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      // Collect tags
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Determine active languages
      const languages: LanguageCode[] = ['pt'];
      Object.keys(translations).forEach(key => {
        if (translations[key]?.titulo?.trim() || translations[key]?.conteudo?.trim()) {
          if (!languages.includes(key as LanguageCode)) {
            languages.push(key as LanguageCode);
          }
        }
      });

      const isMulti = languages.length > 1;

      const autorNome = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Redação WazzimaGiygg';
      const autorId = currentUser?.uid || 'anonymous_editor';
      const autorEmail = currentUser?.email || 'redacao@wazzimagiygg.com';

      const payload = {
        titulo: titulo.trim(),
        categoria: categoria.toLowerCase(),
        resumo: resumo.trim(),
        conteudo: conteudo.trim(),
        imagemUrl: imagemUrl.trim() || undefined,
        autorId,
        autorNome,
        autorEmail,
        isMultiLanguage: isMulti,
        languages,
        defaultLanguage: 'pt',
        translations: isMulti ? (translations as any) : {},
        tags,
        destaque: !!destaque
      };

      const docId = await saveArticleToFirestore(payload, initialArticle?.id);
      onSaved(docId);
    } catch (err: any) {
      console.error("Erro ao salvar artigo no Firebase:", err);
      setErrorMsg(err.message || "Erro ao salvar no banco de dados.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-xs">
      <div className="relative my-6 max-h-[92vh] w-full max-w-4xl flex flex-col overflow-hidden rounded-xl border border-[#d5cfc4] bg-[#faf8f5] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e2dcd2] bg-[#f5f2ea] px-6 py-4">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#991b1b]">
              MESA DE REDAÇÃO & PUBLICAÇÃO
            </span>
            <h2 
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              className="text-xl sm:text-2xl font-bold text-[#0f2238]"
            >
              {isEditing ? t.editar_materia : t.nova_materia}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={loadSamplePost}
                className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a365d] hover:bg-[#f1ede6] transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>{t.carregar_exemplo}</span>
              </button>
            )}
            <button
              onClick={onClose}
              id="editor-close-btn"
              className="rounded-md p-1.5 text-[#64748b] hover:bg-[#e2dcd2] hover:text-[#0f172a]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-[#fee2e2] border border-[#fca5a5] p-3 text-xs text-[#991b1b]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Language Tabs bar */}
          <div className="rounded-lg border border-[#e2dcd2] bg-[#f0ece3] p-2">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase text-[#475569] flex items-center gap-1">
                <Globe2 className="h-3.5 w-3.5 text-[#1a365d]" />
                Idiomas da Matéria (Original & Traduções)
              </span>
              <span className="text-[10px] text-[#64748b]">
                Preencha as outras abas para publicar em múltiplos idiomas
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = activeLangTab === lang.code;
                const hasTranslation = lang.code === 'pt' 
                  ? true 
                  : (translations[lang.code]?.titulo?.trim() || translations[lang.code]?.conteudo?.trim());

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLangTab(lang.code)}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#1a365d] text-white shadow-xs'
                        : 'bg-white text-[#334155] hover:bg-[#eae5db]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {hasTranslation && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field: Category & Featured Toggle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                {t.categoria_label} *
              </label>
              <select
                id="editor-category-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-xs font-semibold text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
              >
                {CATEGORIES.filter(c => c.id !== 'todos' && c.id !== 'arquivo').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {t[cat.key] || cat.id.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5 flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="editor-featured-checkbox"
                  type="checkbox"
                  checked={destaque}
                  onChange={(e) => setDestaque(e.target.checked)}
                  className="h-4 w-4 rounded border-[#cbd5e1] text-[#991b1b] focus:ring-[#991b1b]"
                />
                <span className="text-xs font-bold text-[#0f2238]">
                  {t.destaque_label}
                </span>
              </label>
            </div>
          </div>

          {/* If editing Portuguese or primary language */}
          {activeLangTab === 'pt' ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                  {t.titulo_label} (Português) *
                </label>
                <input
                  id="editor-title-input"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Novo Acordo Internacional para Transparência de Dados..."
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-sm font-bold text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a365d] focus:outline-hidden"
                  required
                />
              </div>

              {/* Subtitle / Deck */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                  {t.resumo_label}
                </label>
                <textarea
                  id="editor-resumo-input"
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  placeholder="Linha fina sintetizando o fato em 1 ou 2 frases impactantes..."
                  rows={2}
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a365d] focus:outline-hidden"
                />
              </div>

              {/* Content with formatting buttons */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                    {t.conteudo_label} *
                  </label>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => insertTag('<p>', '</p>')}
                      className="rounded border border-[#d5cfc4] bg-white px-2 py-0.5 font-mono text-[11px] hover:bg-[#f1ede6]"
                    >
                      &lt;p&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<h3>', '</h3>')}
                      className="rounded border border-[#d5cfc4] bg-white px-2 py-0.5 font-mono text-[11px] hover:bg-[#f1ede6]"
                    >
                      &lt;h3&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<strong>', '</strong>')}
                      className="rounded border border-[#d5cfc4] bg-white px-2 py-0.5 font-mono text-[11px] font-bold hover:bg-[#f1ede6]"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<blockquote>', '</blockquote>')}
                      className="rounded border border-[#d5cfc4] bg-white px-2 py-0.5 font-mono text-[11px] hover:bg-[#f1ede6]"
                    >
                      &ldquo;Quote&rdquo;
                    </button>
                  </div>
                </div>

                <textarea
                  id="editor-content-input"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva aqui a reportagem completa. Você pode usar formatação HTML ou parágrafos normais..."
                  rows={10}
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-3 font-serif text-sm leading-relaxed text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a365d] focus:outline-hidden"
                  required
                />
              </div>
            </>
          ) : (
            /* Sub-translation tab (EN, ES, FR, DE, IT, JA, ZH) */
            <div className="space-y-4 rounded-lg border border-[#e2dcd2] bg-white p-4">
              <div className="text-xs text-[#64748b]">
                Tradução para <strong className="text-[#0f2238]">{AVAILABLE_LANGUAGES.find(l => l.code === activeLangTab)?.nativeName}</strong>:
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                  Título Traduzido ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={translations[activeLangTab]?.titulo || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslations(prev => ({
                      ...prev,
                      [activeLangTab]: {
                        ...prev[activeLangTab],
                        titulo: val
                      }
                    }));
                  }}
                  placeholder="Título traduzido..."
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-sm font-bold text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                  Resumo Traduzido ({activeLangTab.toUpperCase()})
                </label>
                <textarea
                  value={translations[activeLangTab]?.resumo || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslations(prev => ({
                      ...prev,
                      [activeLangTab]: {
                        ...prev[activeLangTab],
                        resumo: val
                      }
                    }));
                  }}
                  placeholder="Resumo traduzido..."
                  rows={2}
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
                  Conteúdo Traduzido ({activeLangTab.toUpperCase()})
                </label>
                <textarea
                  id="editor-content-input"
                  value={translations[activeLangTab]?.conteudo || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslations(prev => ({
                      ...prev,
                      [activeLangTab]: {
                        ...prev[activeLangTab],
                        conteudo: val
                      }
                    }));
                  }}
                  placeholder="Conteúdo traduzido..."
                  rows={8}
                  className="w-full rounded-md border border-[#d5cfc4] bg-white p-3 font-serif text-sm text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Image URL & Thumbnail preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
              {t.imagem_label}
            </label>
            <div className="flex gap-2">
              <input
                id="editor-image-input"
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="https://exemplo.com/foto-noticia.jpg"
                className="flex-1 rounded-md border border-[#d5cfc4] bg-white p-2.5 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setImagemUrl("https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80")}
                className="rounded-md border border-[#d5cfc4] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#f1ede6]"
              >
                Exemplo
              </button>
            </div>

            {imagemUrl && (
              <div className="mt-2 flex items-center gap-3 rounded-md border border-[#e2dcd2] bg-[#fdfcfa] p-2">
                <img
                  src={imagemUrl}
                  alt="Prévia"
                  className="h-14 w-24 rounded object-cover border border-[#cbd5e1]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="text-xs text-[#64748b]">
                  <p className="font-semibold text-[#0f2238]">Pré-visualização da imagem de capa</p>
                  <p className="text-[11px] truncate max-w-md">{imagemUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1">
              {t.tags_label}
            </label>
            <input
              id="editor-tags-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Política, Brasil, Investigação, Economia"
              className="w-full rounded-md border border-[#d5cfc4] bg-white p-2.5 text-xs text-[#0f172a] focus:border-[#1a365d] focus:outline-hidden"
            />
          </div>

          {/* Author info preview */}
          <div className="rounded-lg border border-[#e2dcd2] bg-[#f8f6f0] p-3 text-xs text-[#64748b]">
            <span className="font-bold text-[#0f2238]">Autor Responsável: </span>
            <span>{currentUser?.displayName || currentUser?.email || 'Redação Jornal WazzimaGiygg'} </span>
            <span className="text-[#94a3b8]">({currentUser?.role === 'admin' ? 'Administrador' : 'Jornalista Colaborador'})</span>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e2dcd2] bg-[#f5f2ea] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            id="editor-cancel-btn"
            disabled={saving}
            className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1ede6] transition"
          >
            {t.cancelar}
          </button>
          <button
            onClick={handleSave}
            id="editor-submit-btn"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-[#991b1b] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#7f1d1d] transition disabled:opacity-50 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Publicando...' : (isEditing ? t.atualizar : t.salvar)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
