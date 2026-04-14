import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, MapPin, Loader2 } from 'lucide-react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    // Weather for Choya, Santiago del Estero
    // Using a public API (Open-Meteo) which doesn't require an API key for basic usage
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Lat/Lon for Choya, Santiago del Estero: -28.48, -64.68 (Approx)
                const lat = -28.48;
                const lon = -64.68;
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Argentina/Buenos_Aires`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.current_weather) {
                    setWeather(data.current_weather);
                }
            } catch (error) {
                console.error("Error fetching weather:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 1000 * 60 * 30);
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes
        if (code === 0) return <Sun className="text-yellow-400" size={24} />;
        if (code <= 3) return <Cloud className="text-slate-400" size={24} />;
        if (code >= 51) return <CloudRain className="text-blue-400" size={24} />;
        return <Sun className="text-yellow-400" size={24} />;
    };

    if (loading) return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl animate-pulse">
            <Loader2 size={16} className="animate-spin text-gold" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cargando Clima...</span>
        </div>
    );

    if (!weather) return null;

    return (
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl group hover:border-gold/30 transition-all">
            <div className="flex items-center gap-2">
                <MapPin size={12} className="text-gold" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter text-white">Choya</span>
            </div>

            <div className="h-4 w-px bg-white/10"></div>

            <div className="flex items-center gap-3">
                {getWeatherIcon(weather.weathercode)}
                <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-black italic tracking-tighter text-white">{Math.round(weather.temperature)}°</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">C</span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-2">
                <Thermometer size={12} className="text-gold/60" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Viento: {weather.windspeed}km/h</span>
            </div>
        </div>
    );
}
