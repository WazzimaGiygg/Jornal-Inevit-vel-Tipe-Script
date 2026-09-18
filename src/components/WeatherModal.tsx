import React from 'react';
import { X, Wind, Droplets, CloudSun, MapPin, RefreshCw } from 'lucide-react';
import { WeatherData, LanguageCode } from '../types';
import { TRANSLATIONS } from '../lib/translations';

interface WeatherModalProps {
  weather: WeatherData | null;
  currentLang: LanguageCode;
  onClose: () => void;
  onRefresh: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  weather,
  currentLang,
  onClose,
  onRefresh
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!weather) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div 
        className="w-full max-w-md overflow-hidden rounded-xl border border-[#d5cfc4] bg-[#faf8f5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e2dcd2] bg-[#f5f2ea] px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a365d]">
            <CloudSun className="h-4 w-4" />
            <span>Boletim Meteorológico Regional</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#64748b] hover:bg-[#e2dcd2] hover:text-[#0f172a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-[#64748b] mb-2">
            <MapPin className="h-3.5 w-3.5 text-[#991b1b]" />
            <span className="font-semibold text-[#0f2238]">{weather.city}</span>
          </div>

          <div className="my-3 flex items-center justify-center gap-3">
            <span className="text-5xl">{weather.emoji}</span>
            <span className="text-6xl font-black tracking-tight text-[#0f2238]">
              {weather.temperature}°C
            </span>
          </div>

          <p className="text-sm font-semibold text-[#334155]">{weather.description}</p>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            {t.tempo_agora}: {weather.updatedAt}
          </p>

          {/* Grid of indicators */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#e2dcd2] pt-4">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#e8e4dc] bg-white p-3">
              <Droplets className="h-4 w-4 text-sky-600" />
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wider text-[#64748b]">{t.umidade}</span>
                <span className="text-sm font-bold text-[#0f2238]">{weather.humidity}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#e8e4dc] bg-white p-3">
              <Wind className="h-4 w-4 text-teal-600" />
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wider text-[#64748b]">{t.vento}</span>
                <span className="text-sm font-bold text-[#0f2238]">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#f1ede6] pt-4 text-xs">
            <span className="text-[11px] text-[#94a3b8]">Fonte: Open-Meteo API</span>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#1a365d] hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Atualizar dados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
