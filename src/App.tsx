import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchArticlesFromFirestore, 
  fetchArticleById, 
  incrementArticleViews, 
  deleteArticleFromFirestore,
  loginWithGoogle, 
  logoutUser, 
  auth, 
  getUserProfile, 
  SPECIFIC_ADMIN_UID 
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchWeather } from './lib/weather';
import { Article, LanguageCode, CategoryId, AppUser, WeatherData } from './types';
import { AVAILABLE_LANGUAGES, TRANSLATIONS, getLocalizedArticle } from './lib/translations';

// Components
import { Masthead } from './components/Masthead';
import { CategoryNav } from './components/CategoryNav';
import { FeaturedHero } from './components/FeaturedHero';
import { ArticleCard } from './components/ArticleCard';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { ArticleEditorModal } from './components/ArticleEditorModal';
import { ArchiveView } from './components/ArchiveView';
import { WeatherModal } from './components/WeatherModal';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';

import { 
  Newspaper, 
  RefreshCw, 
  AlertTriangle, 
  PlusCircle, 
  Filter, 
  Flame,
  Search
} from 'lucide-react';

export function App() {
  // Language state (persisted in localStorage like original project)
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('wzzm_language') as LanguageCode;
    if (saved && AVAILABLE_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    const browser = navigator.language.split('-')[0] as LanguageCode;
    return AVAILABLE_LANGUAGES.some(l => l.code === browser) ? browser : 'pt';
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLang(lang);
    localStorage.setItem('wzzm_language', lang);
  };

  const t = TRANSLATIONS[currentLang];

  // Navigation & Category state
  const [currentCategory, setCurrentCategory] = useState<CategoryId>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Articles & Database state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // Fetch articles from Firestore
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticlesFromFirestore(undefined, 80);
      setArticles(data);
    } catch (err: any) {
      console.error("Falha ao carregar artigos:", err);
      setError("Não foi possível carregar as notícias da base do Firebase.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load & deep linking (?artigo=ID)
  useEffect(() => {
    loadArticles();

    // Fetch initial weather
    fetchWeather().then(data => {
      if (data) setWeather(data);
    });

    // Check URL parameters for direct article link
    const params = new URLSearchParams(window.location.search);
    const directArticleId = params.get('artigo');
    if (directArticleId) {
      fetchArticleById(directArticleId).then(art => {
        if (art) {
          handleOpenReader(art);
        }
      });
    }
  }, [loadArticles]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        const isAdmin = fbUser.uid === SPECIFIC_ADMIN_UID || profile?.role === 'admin';
        setCurrentUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Autor',
          photoURL: fbUser.photoURL,
          role: isAdmin ? 'admin' : (profile?.role || 'leitor'),
          isBanned: profile?.isBanned
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth actions
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn("Login canceled or failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err: any) {
      console.warn("Logout error:", err);
    }
  };

  // Article Reader open handler (increments view count in Firestore)
  const handleOpenReader = (article: Article) => {
    setSelectedArticle(article);
    incrementArticleViews(article.id);
    // Update locally too
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, visualizacoes: (a.visualizacoes || 0) + 1 } : a));
  };

  // Article deletion handler
  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticleFromFirestore(id);
      setSelectedArticle(null);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Falha ao excluir matéria.");
    }
  };

  // Article saved handler from editor
  const handleArticleSaved = (id: string) => {
    setIsEditorOpen(false);
    setEditingArticle(null);
    loadArticles();
    fetchArticleById(id).then(art => {
      if (art) handleOpenReader(art);
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: articles.length };
    articles.forEach(a => {
      const cat = a.categoria || 'politica';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Filtered articles based on search & category
  const displayArticles = useMemo(() => {
    return articles.filter(art => {
      const loc = getLocalizedArticle(art, currentLang);
      // Category filter
      if (currentCategory !== 'todos' && currentCategory !== 'arquivo' && art.categoria !== currentCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (loc.titulo || '').toLowerCase().includes(q);
        const matchSummary = (loc.resumo || '').toLowerCase().includes(q);
        const matchAuthor = (loc.autorNome || '').toLowerCase().includes(q);
        const matchTags = (loc.tags || []).some((t: string) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchAuthor && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [articles, currentCategory, searchQuery, currentLang]);

  // Lead / Headline story
  const primaryArticle = useMemo(() => {
    if (displayArticles.length === 0) return null;
    const featured = displayArticles.find(a => a.destaque);
    return featured || displayArticles[0];
  }, [displayArticles]);

  // Sub stories
  const subArticles = useMemo(() => {
    if (!primaryArticle) return [];
    return displayArticles.filter(a => a.id !== primaryArticle.id).slice(0, 3);
  }, [displayArticles, primaryArticle]);

  // Remaining articles
  const remainingArticles = useMemo(() => {
    if (currentCategory !== 'todos' || searchQuery.trim()) {
      return displayArticles;
    }
    const excludedIds = new Set([primaryArticle?.id, ...subArticles.map(s => s.id)].filter(Boolean));
    return displayArticles.filter(a => !excludedIds.has(a.id));
  }, [displayArticles, primaryArticle, subArticles, currentCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1a202c]">
      {/* Newspaper Top Masthead */}
      <Masthead
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenNewArticle={() => {
          setEditingArticle(null);
          setIsEditorOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        weather={weather}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
      />

      {/* Categories Bar */}
      <CategoryNav
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLang={currentLang}
        categoryCounts={categoryCounts}
      />

      {/* Main Page Body Container */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 w-full">
        {/* If loading */}
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-4">
              <RefreshCw className="h-10 w-10 animate-spin text-[#1a365d]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0f2238]">{t.carregando}</h3>
            <p className="mt-1 text-xs text-[#64748b]">Conectando com o banco de dados Firebase Firestore...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center my-8">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-600 mb-2" />
            <h3 className="text-base font-bold text-red-900">{error}</h3>
            <button
              onClick={loadArticles}
              className="mt-4 rounded-md bg-[#1a365d] px-4 py-2 text-xs font-bold text-white hover:bg-[#152c4b]"
            >
              Tentar Novamente
            </button>
          </div>
        ) : currentCategory === 'arquivo' ? (
          /* Archive View */
          <ArchiveView
            articles={articles}
            currentLang={currentLang}
            onSelectArticle={handleOpenReader}
          />
        ) : (
          /* Newspaper Edition View */
          <>
            {/* Search or category indicator title if active */}
            {(searchQuery.trim() || currentCategory !== 'todos') && (
              <div className="mb-6 flex flex-wrap items-center justify-between border-b border-[#e2dcd2] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-[#0f2238]">
                    {searchQuery.trim() ? (
                      <>Resultados para &ldquo;<span className="text-[#991b1b]">{searchQuery}</span>&rdquo;</>
                    ) : (
                      t[`cat_${currentCategory}`] || currentCategory.toUpperCase()
                    )}
                  </span>
                  <span className="rounded-full bg-[#1a365d] px-2.5 py-0.5 text-xs font-bold text-white">
                    {displayArticles.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCurrentCategory('todos');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#991b1b] hover:underline"
                >
                  Ver Edição Completa
                </button>
              </div>
            )}

            {/* Frontpage Hero Headlines (only when viewing front page without search) */}
            {currentCategory === 'todos' && !searchQuery.trim() && primaryArticle && (
              <FeaturedHero
                primaryArticle={primaryArticle}
                subArticles={subArticles}
                currentLang={currentLang}
                onSelectArticle={handleOpenReader}
              />
            )}

            {/* News Section Heading */}
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#1a365d] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-black uppercase tracking-tight text-[#0f2238]">
                  {currentCategory === 'todos' && !searchQuery.trim() ? t.todas_as_materias : 'Artigos'}
                </span>
                <span className="h-2 w-2 rounded-full bg-[#991b1b]"></span>
              </div>
              <div className="text-xs text-[#64748b]">
                {displayArticles.length} {displayArticles.length === 1 ? 'matéria' : 'matérias'}
              </div>
            </div>

            {/* Article Cards Grid */}
            {remainingArticles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d5cfc4] bg-white p-12 text-center my-6">
                <Newspaper className="mx-auto h-12 w-12 text-[#94a3b8] mb-3" />
                <h3 className="text-base font-bold text-[#0f2238]">{t.sem_resultados}</h3>
                <p className="mt-1 text-xs text-[#64748b]">Nenhum artigo encontrado nesta categoria ou busca.</p>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setIsEditorOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#991b1b] px-4 py-2 text-xs font-bold text-white hover:bg-[#7f1d1d]"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Publicar Primeira Matéria</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {remainingArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={getLocalizedArticle(art, currentLang)}
                    currentLang={currentLang}
                    onSelect={() => handleOpenReader(art)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Colophon */}
      <Footer
        currentLang={currentLang}
        onOpenArchive={() => {
          setCurrentCategory('arquivo');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewArticle={() => {
          setEditingArticle(null);
          setIsEditorOpen(true);
        }}
      />

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          currentLang={currentLang}
          currentUser={currentUser}
          onClose={() => setSelectedArticle(null)}
          onEdit={(art) => {
            setSelectedArticle(null);
            setEditingArticle(art);
            setIsEditorOpen(true);
          }}
          onDelete={handleDeleteArticle}
          onSelectRelated={(rel) => handleOpenReader(rel)}
          relatedArticles={articles.filter(a => a.id !== selectedArticle.id && a.categoria === selectedArticle.categoria)}
        />
      )}

      {/* Article Editor / Creator Modal */}
      {isEditorOpen && (
        <ArticleEditorModal
          initialArticle={editingArticle}
          currentLang={currentLang}
          currentUser={currentUser}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingArticle(null);
          }}
          onSaved={handleArticleSaved}
        />
      )}

      {/* Weather Forecast Details Modal */}
      {isWeatherModalOpen && (
        <WeatherModal
          weather={weather}
          currentLang={currentLang}
          onClose={() => setIsWeatherModalOpen(false)}
          onRefresh={() => {
            fetchWeather().then(data => {
              if (data) setWeather(data);
            });
          }}
        />
      )}

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}
export default App;
