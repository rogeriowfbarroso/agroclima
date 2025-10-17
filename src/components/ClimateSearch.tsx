import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { nasaPowerService } from "@/services/nasaPowerService";
import { geocodingService } from "@/services/geocodingService";
import { CityCombobox } from "@/components/CityCombobox";
import { City } from "@/data/minasGeraisCities";
import { MapPin, Search, Calendar, Download } from "lucide-react";

interface ClimateSearchProps {
  onDataReceived: (data: any) => void;
  onLoadingChange: (loading: boolean) => void;
}

const climateParameters = [
  { id: 'T2M', name: 'Temperatura a 2 metros (°C)', default: true },
  { id: 'T2M_MAX', name: 'Temperatura Máxima a 2 metros (°C)', default: false },
  { id: 'T2M_MIN', name: 'Temperatura Mínima a 2 metros (°C)', default: false },
  { id: 'RH2M', name: 'Umidade Relativa a 2 metros (%)', default: false },
  { id: 'PRECTOTCORR', name: 'Precipitação pluviométrica (mm/dia)', default: true },
  { id: 'PS', name: 'Pressão atmosférica (kPa)', default: false },
  { id: 'WS10M', name: 'Velocidade do vento a 10 metros (m/s)', default: false },
];

export const ClimateSearch = ({ onDataReceived, onLoadingChange }: ClimateSearchProps) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 4);
    return maxDate.toISOString().split('T')[0];
  });
  const [selectedParameters, setSelectedParameters] = useState<string[]>(
    climateParameters.filter(p => p.default).map(p => p.id)
  );
  const { toast } = useToast();

  const handleParameterChange = (parameterId: string, checked: boolean) => {
    if (checked) {
      setSelectedParameters(prev => [...prev, parameterId]);
    } else {
      setSelectedParameters(prev => prev.filter(id => id !== parameterId));
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city.name);
    if (city.latitude !== null && city.longitude !== null) {
      setLatitude(city.latitude.toFixed(4));
      setLongitude(city.longitude.toFixed(4));
      toast({
        title: "Cidade selecionada!",
        description: `${city.name} - Coordenadas: ${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}`,
      });
    } else {
      setLatitude("");
      setLongitude("");
      toast({
        title: "Cidade selecionada!",
        description: `${city.name} - Coordenadas não disponíveis. Por favor, insira manualmente.`,
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!latitude || !longitude) {
      toast({
        title: "Coordenadas em falta",
        description: "Por favor, insira latitude e longitude ou busque por uma cidade",
        variant: "destructive",
      });
      return;
    }

    if (selectedParameters.length === 0) {
      toast({
        title: "Selecione parâmetros",
        description: "Por favor, selecione pelo menos um parâmetro climático",
        variant: "destructive",
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast({
        title: "Coordenadas inválidas",
        description: "Latitude deve estar entre -90 e 90, longitude entre -180 e 180",
        variant: "destructive",
      });
      return;
    }

    onLoadingChange(true);
    
    try {
      const data = await nasaPowerService.getClimateData(lat, lon, selectedParameters, startDate, endDate);
      onDataReceived(data);
      toast({
        title: "Sucesso!",
        description: "Dados climáticos carregados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao buscar dados climáticos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        toast({
          title: "Location found!",
          description: "Your coordinates have been set",
        });
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Failed to get your location",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-climate border-white/50 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Buscar Dados Climáticos</h2>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-6">
        {/* City Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Selecionar Cidade de Minas Gerais
          </Label>
          <CityCombobox
            value={selectedCity}
            onSelect={handleCitySelect}
            placeholder="Selecione uma cidade de Minas Gerais..."
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" className="text-sm font-medium text-foreground">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="ex: -23.5505"
              className="border-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="text-sm font-medium text-foreground">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="ex: -46.6333"
              className="border-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período dos Dados
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min="2001-01-01"
                max={(() => {
                  const maxDate = new Date();
                  maxDate.setDate(maxDate.getDate() - 4);
                  return maxDate.toISOString().split('T')[0];
                })()}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                Data de Fim
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min="2001-01-01"
                max={(() => {
                  const maxDate = new Date();
                  maxDate.setDate(maxDate.getDate() - 4);
                  return maxDate.toISOString().split('T')[0];
                })()}
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Parameter Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Parâmetros Climáticos
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {climateParameters.map((param) => (
              <div key={param.id} className="flex items-center space-x-2">
                <Checkbox
                  id={param.id}
                  checked={selectedParameters.includes(param.id)}
                  onCheckedChange={(checked) => handleParameterChange(param.id, checked as boolean)}
                />
                <Label
                  htmlFor={param.id}
                  className="text-sm font-normal text-foreground/90 cursor-pointer"
                >
                  {param.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGetCurrentLocation}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Usar Minha Localização
          </Button>
          
          <Button
            type="submit"
            className="flex-1 bg-gradient-ocean hover:opacity-90 shadow-glow"
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar Dados Climáticos
          </Button>
        </div>
      </form>
    </Card>
  );
};