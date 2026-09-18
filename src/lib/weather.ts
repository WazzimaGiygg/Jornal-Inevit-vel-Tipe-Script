import { WeatherData } from '../types';

export async function fetchWeather(lat = -20.2108, lon = -50.9272, cityName = 'Santa Fé do Sul - SP'): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America%2FSao_Paulo`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const curr = data.current;

    const code = curr.weather_code;
    const { desc, emoji } = getWeatherInterpretation(code);

    return {
      city: cityName,
      temperature: Math.round(curr.temperature_2m),
      humidity: curr.relative_humidity_2m,
      windSpeed: Math.round(curr.wind_speed_10m),
      weatherCode: code,
      description: desc,
      emoji,
      updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.warn("Weather fetch failed:", err);
    return null;
  }
}

function getWeatherInterpretation(code: number): { desc: string; emoji: string } {
  if (code === 0) return { desc: 'Céu Limpo', emoji: '☀️' };
  if (code === 1 || code === 2) return { desc: 'Parcialmente Nublado', emoji: '🌤️' };
  if (code === 3) return { desc: 'Nublado', emoji: '☁️' };
  if (code === 45 || code === 48) return { desc: 'Neblina', emoji: '🌫️' };
  if (code >= 51 && code <= 55) return { desc: 'Garoa Leve', emoji: '🌦️' };
  if (code >= 61 && code <= 65) return { desc: 'Chuva', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { desc: 'Neve', emoji: '❄️' };
  if (code >= 80 && code <= 82) return { desc: 'Pancadas de Chuva', emoji: '🌧️' };
  if (code >= 95 && code <= 99) return { desc: 'Tempestade', emoji: '⛈️' };
  return { desc: 'Tempo Firme', emoji: '🌤️' };
}
