import { useState, FormEvent } from "react";
import { useGetWeather, getGetWeatherQueryKey, useGetWeatherForecast, getGetWeatherForecastQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wind, Droplets, Sun, Eye, CloudRain } from "lucide-react";

export default function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("Seoul");

  const { data: current, isLoading: isLoadingCurrent, isError: isErrorCurrent } = useGetWeather(
    { city },
    { query: { enabled: !!city, queryKey: getGetWeatherQueryKey({ city }), retry: false } }
  );

  const { data: forecast, isLoading: isLoadingForecast } = useGetWeatherForecast(
    { city },
    { query: { enabled: !!city, queryKey: getGetWeatherForecastQueryKey({ city }), retry: false } }
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput("");
    }
  };

  const getIconUrl = (url: string) => {
    if (url.startsWith("//")) {
      return `https:${url}`;
    }
    return url;
  };

  const bgClass = current?.isDay ? "bg-gradient-to-br from-blue-400 to-blue-200 text-blue-950" : "bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50";
  const cardClass = current?.isDay ? "bg-white/40 backdrop-blur-md border border-white/20 text-blue-950" : "bg-black/40 backdrop-blur-md border border-white/10 text-slate-50";

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${current ? bgClass : 'bg-slate-900 text-slate-50'}`}>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <CloudRain className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-app-title">Atmosphere</h1>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Input 
              type="text" 
              placeholder="Search city..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`pl-10 rounded-full ${current?.isDay ? 'bg-white/50 border-white/30 placeholder:text-blue-900/50' : 'bg-white/10 border-white/10 placeholder:text-slate-300'} focus-visible:ring-primary/50`}
              data-testid="input-city-search"
            />
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${current?.isDay ? 'text-blue-900/50' : 'text-slate-300'}`} />
          </form>
        </header>

        {isErrorCurrent && (
          <div className="p-4 rounded-xl bg-destructive/20 text-destructive border border-destructive/30 backdrop-blur-sm" data-testid="error-message">
            Could not find weather data for "{city}". Please try another city.
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              {isLoadingCurrent ? (
                <Skeleton className="w-full h-[400px] rounded-3xl opacity-20" data-testid="skeleton-current-weather" />
              ) : current ? (
                <div className={`relative rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl ${cardClass}`} data-testid="card-current-weather">
                  <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none transition-opacity duration-1000">
                    <img src={getIconUrl(current.icon)} alt={current.description} className="w-48 h-48 object-cover mix-blend-overlay" data-testid="img-current-icon-bg" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h2 className="text-4xl md:text-6xl font-light tracking-tight" data-testid="text-city-name">{current.city}</h2>
                      <p className="text-lg md:text-xl opacity-80 mt-1" data-testid="text-country-name">{current.country}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-8">
                      <div className="text-7xl md:text-9xl font-bold tracking-tighter" data-testid="text-current-temp">{current.tempC}&deg;</div>
                      <div className="space-y-1 pt-2 sm:pt-0">
                        <div className="flex items-center gap-2">
                          <img src={getIconUrl(current.icon)} alt={current.description} className="w-12 h-12" data-testid="img-current-icon" />
                          <p className="text-xl font-medium capitalize" data-testid="text-current-desc">{current.description}</p>
                        </div>
                        <p className="text-sm opacity-80" data-testid="text-feels-like">Feels like {current.feelsLikeC}&deg;</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoadingCurrent ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl opacity-20" />)
              ) : current ? (
                <>
                  <div className={`p-6 rounded-2xl flex flex-col gap-2 shadow-lg ${cardClass}`} data-testid="card-stat-humidity">
                    <Droplets className="w-6 h-6 opacity-70" />
                    <div className="mt-auto">
                      <p className="text-sm opacity-70">Humidity</p>
                      <p className="text-2xl font-semibold" data-testid="text-humidity-value">{current.humidity}%</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl flex flex-col gap-2 shadow-lg ${cardClass}`} data-testid="card-stat-wind">
                    <Wind className="w-6 h-6 opacity-70" />
                    <div className="mt-auto">
                      <p className="text-sm opacity-70">Wind</p>
                      <p className="text-2xl font-semibold" data-testid="text-wind-value">{current.windKph} <span className="text-sm font-normal">km/h</span></p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl flex flex-col gap-2 shadow-lg ${cardClass}`} data-testid="card-stat-uv">
                    <Sun className="w-6 h-6 opacity-70" />
                    <div className="mt-auto">
                      <p className="text-sm opacity-70">UV Index</p>
                      <p className="text-2xl font-semibold" data-testid="text-uv-value">{current.uvIndex}</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl flex flex-col gap-2 shadow-lg ${cardClass}`} data-testid="card-stat-visibility">
                    <Eye className="w-6 h-6 opacity-70" />
                    <div className="mt-auto">
                      <p className="text-sm opacity-70">Visibility</p>
                      <p className="text-2xl font-semibold" data-testid="text-visibility-value">{current.visibilityKm} <span className="text-sm font-normal">km</span></p>
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className={`rounded-3xl p-6 h-full shadow-xl ${cardClass}`}>
              <h3 className="text-xl font-medium mb-6">3-Day Forecast</h3>
              {isLoadingForecast ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-xl opacity-20" />)}
                </div>
              ) : forecast ? (
                <div className="space-y-3">
                  {forecast.days.map((day, i) => {
                    const dateObj = new Date(day.date);
                    const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    return (
                      <div key={day.date} className="flex items-center justify-between p-4 rounded-xl bg-black/5 hover:bg-black/10 transition-colors" data-testid={`card-forecast-${i}`}>
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-forecast-day-${i}`}>{dayName}</p>
                          <p className="text-xs opacity-70 mt-1 capitalize" data-testid={`text-forecast-desc-${i}`}>{day.description}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center px-2">
                          <img src={getIconUrl(day.icon)} alt={day.description} className="w-10 h-10" data-testid={`img-forecast-icon-${i}`} />
                          {day.chanceOfRain > 0 && (
                            <span className="text-[10px] text-blue-400 font-medium" data-testid={`text-forecast-rain-${i}`}>{day.chanceOfRain}% rain</span>
                          )}
                        </div>
                        <div className="text-right flex flex-col gap-1 w-12">
                          <span className="font-bold" data-testid={`text-forecast-max-${i}`}>{day.maxTempC}&deg;</span>
                          <span className="text-sm opacity-60" data-testid={`text-forecast-min-${i}`}>{day.minTempC}&deg;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}