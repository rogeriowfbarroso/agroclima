import { useState } from "react";
import { ClimateSearch } from "@/components/ClimateSearch";
import { WeatherData } from "@/components/WeatherData";
import heroImage from "@/assets/climate-hero.jpg";
import { Cloud, Sun, Droplets } from "lucide-react";

interface ClimateData {
  location: {
    latitude: number;
    longitude: number;
  };
  parameters: {
    [key: string]: number[];
  };
  geometry: {
    coordinates: number[];
  };
  selectedParameters: string[];
  dateRange: {
    start: string;
    end: string;
  };
  rawData?: any;
}

const Index = () => {
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-weather opacity-80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Sun className="h-12 w-12 text-primary animate-pulse" />
              <Cloud className="h-16 w-16 text-accent" />
              <Droplets className="h-10 w-10 text-secondary animate-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Clima Produtivo
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 drop-shadow-sm">
              Explore informações climáticas mundiais usando a NASA POWER API
            </p>

            <ClimateSearch 
              onDataReceived={setClimateData} 
              onLoadingChange={setLoading}
            />
          </div>
        </div>
      </section>

      {/* Data Display Section */}
      {climateData && (
        <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <WeatherData data={climateData} loading={loading} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-ocean text-white py-8 text-center">
        <p className="text-lg">
          Powered by NASA POWER API • Dados climáticos para todos
        </p>
      </footer>
    </div>
  );
};

export default Index;