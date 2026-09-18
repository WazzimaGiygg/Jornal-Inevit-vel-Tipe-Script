import React from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Heart, BookOpen, Scale, Globe } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../lib/translations';

interface FooterProps {
  currentLang: LanguageCode;
  onOpenArchive: () => void;
  onOpenNewArticle: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenArchive,
  onOpenNewArticle
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <footer className="mt-16 border-t-4 border-[#1a365d] bg-[#f2eee6] text-[#334155]">
      {/* Upper Colophon section */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          
          {/* Col 1: Masthead Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-black tracking-tight text-[#0f2238] uppercase">
                Jornal WazzimaGiygg
              </span>
            </div>
            <p className="font-serif italic text-sm text-[#991b1b]">
              "{t.slogan}"
            </p>
            <p className="text-xs leading-relaxed text-[#64748b]">
              Veículo de comunicação independente dedicado ao aprofundamento das questões geopolíticas, tecnológicas, jurídicas e culturais contemporâneas.
            </p>
            <div className="pt-2 text-xs text-[#94a3b8]">
              <p>Redação: Santa Fé do Sul - SP • Brasil</p>
              <p>Edição Digital Contínua • ISSN Digital</p>
            </div>
          </div>

          {/* Col 2: Editorias Rápidas */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#0f2238]">
              Cadernos & Navegação
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onOpenArchive} className="hover:text-[#991b1b] transition">
                  🏛️ {t.arquivo_titulo}
                </button>
              </li>
              <li>
                <button onClick={onOpenNewArticle} className="hover:text-[#991b1b] transition">
                  ✍️ {t.nova_materia}
                </button>
              </li>
              <li>
                <span className="text-[#64748b]">🌍 Cobertura Internacional & Diplomacia</span>
              </li>
              <li>
                <span className="text-[#64748b]">⚖️ Observatório de Justiça & Direitos</span>
              </li>
              <li>
                <span className="text-[#64748b]">💻 Tecnologia, IA & Semicondutores</span>
              </li>
            </ul>
          </div>

          {/* Col 3: WazzimaGiygg Ecosystem */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#0f2238]">
              Ecossistema WazzimaGiygg
            </h4>
            <ul className="space-y-1.5 text-xs text-[#475569]">
              <li className="flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3 text-[#94a3b8]" />
                <a 
                  href="https://github.com/WazzimaGiygg/Jornal-WazzimaGiygg" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-[#991b1b] hover:underline"
                >
                  Repositório Oficial (GitHub)
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-[#94a3b8]" />
                <span>Portal Maspia Fórum</span>
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 text-[#94a3b8]" />
                <span>Bemtevi & WikiZero</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Scale className="h-3 w-3 text-[#94a3b8]" />
                <span>Maspia Acadêmico</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Transparência & Licença */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#0f2238]">
              Legal & Licença
            </h4>
            <div className="rounded-md border border-[#d5cfc4] bg-white p-2.5 text-[11px] text-[#64748b] leading-tight space-y-1">
              <p className="font-semibold text-[#0f2238]">Apache License 2.0</p>
              <p>Código aberto e documentação livre.</p>
              <p className="pt-1 text-[#94a3b8]">Firebase Firestore Integrado.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#e2dcd2] bg-[#ebe6dc] px-4 py-4 text-center text-xs text-[#64748b]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Jornal WazzimaGiygg. Todos os direitos reservados para a imprensa livre.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Santa Fé do Sul - SP</span>
            <span>•</span>
            <span>Edição nº 1.482</span>
            <span>•</span>
            <span className="font-serif italic text-[#991b1b]">O Jornal Inevitável</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
