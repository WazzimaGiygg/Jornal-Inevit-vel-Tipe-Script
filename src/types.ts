export type LanguageCode = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh';

export type CategoryId = 
  | 'todos'
  | 'politica'
  | 'internacional'
  | 'economia'
  | 'justica'
  | 'cultura'
  | 'investigacao'
  | 'opiniao'
  | 'esporte'
  | 'tecnologia'
  | 'redes_sociais'
  | 'saude'
  | 'educacao'
  | 'arquivo';

export interface ArticleTranslation {
  titulo?: string;
  resumo?: string;
  conteudo?: string;
}

export interface Article {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  conteudo: string;
  imagemUrl?: string;
  autorId?: string;
  autorNome?: string;
  autorEmail?: string;
  dataPublicacao?: any; // Timestamp or date string
  ultimaEdicao?: any;
  visualizacoes?: number;
  isMultiLanguage?: boolean;
  languages?: LanguageCode[];
  defaultLanguage?: string;
  translations?: Partial<Record<LanguageCode, ArticleTranslation>>;
  tags?: string[];
  destaque?: boolean;
  curtidas?: number;
  // Computed runtime fields
  _currentLanguage?: LanguageCode;
  _isFallback?: boolean;
  _availableLanguages?: LanguageCode[];
  _readingTimeMinutes?: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'editor' | 'autor' | 'leitor';
  isBanned?: boolean;
  banReason?: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  emoji: string;
  updatedAt: string;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
}
