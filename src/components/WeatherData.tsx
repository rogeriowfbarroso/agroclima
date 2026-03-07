import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplets, Sun, Download, MapPin } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { ClimateCharts } from "@/components/ClimateCharts";
import { ClimateMap } from "@/components/ClimateMap";
import { ClimateAlerts } from "@/components/ClimateAlerts";
import { UsabilityGuide } from "@/components/UsabilityGuide";

interface WeatherDataProps {
  data: {
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
  };
  loading: boolean;
}

const getParameterInfo = (param: string) => {
  const info: { [key: string]: { name: string; unit: string; icon: any; color: string } } = {
    'T2M': { name: 'Temperatura', unit: '°C', icon: Thermometer, color: 'text-orange-600' },
    'T2M_MAX': { name: 'Temp. Máxima', unit: '°C', icon: Thermometer, color: 'text-red-600' },
    'T2M_MIN': { name: 'Temp. Mínima', unit: '°C', icon: Thermometer, color: 'text-blue-600' },
    'RH2M': { name: 'Umidade', unit: '%', icon: Droplets, color: 'text-blue-500' },
    'PRECTOTCORR': { name: 'Precipitação', unit: 'mm/dia', icon: Droplets, color: 'text-blue-700' },
    'PS': { name: 'Pressão Atmosférica', unit: 'kPa', icon: Sun, color: 'text-purple-600' },
    'WS10M': { name: 'Velocidade do Vento', unit: 'm/s', icon: Sun, color: 'text-green-600' },
    'ALLSKY_SFC_SW_DWN': { name: 'Radiação Solar', unit: 'kWh/m²/dia', icon: Sun, color: 'text-yellow-600' },
  };
  
  return info[param] || { name: param, unit: '', icon: Sun, color: 'text-gray-600' };
};

export const WeatherData = ({ data, loading }: WeatherDataProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    const success = exportToExcel(data);
    if (success) {
      toast({
        title: "Exportado com sucesso!",
        description: "Os dados foram exportados para Excel",
      });
    } else {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar dados para Excel",
        variant: "destructive",
      });
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-primary/20">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Resultados dos Dados Climáticos
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Localização: {data.location.latitude.toFixed(4)}°, {data.location.longitude.toFixed(4)}°
            </span>
          </div>
          <Badge variant="outline">
            {data.dateRange.start} até {data.dateRange.end}
          </Badge>
        </div>
        <Button
          onClick={handleExport}
          className="bg-gradient-ocean hover:opacity-90 shadow-glow"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar para Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.selectedParameters.map((param) => {
          const paramInfo = getParameterInfo(param);
          const paramData = data.parameters[param] || [];
          const average = paramData.length > 0 
            ? (paramData.reduce((a, b) => a + b, 0) / paramData.length)
            : 0;
          const max = paramData.length > 0 ? Math.max(...paramData) : 0;
          const min = paramData.length > 0 ? Math.min(...paramData) : 0;
          
          const IconComponent = paramInfo.icon;
          
          return (
            <Card key={param} className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{paramInfo.name}</CardTitle>
                <IconComponent className={`h-4 w-4 ${paramInfo.color}`} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {average > 0 ? average.toFixed(2) : 'N/A'} {paramInfo.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Média do período
                  </p>
                </div>
                
                {paramData.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Máx: </span>
                      <span className="font-semibold">{max.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mín: </span>
                      <span className="font-semibold">{min.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                <Badge variant="secondary" className="w-fit">
                  {paramData.length} dias apurados
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos dos dados climáticos */}
      <ClimateCharts data={data} rawData={data.rawData} />
      
      {/* Alertas climáticos */}
      <ClimateAlerts data={data} />
      
      {/* Mapa climático */}
      <ClimateMap data={data} />
      
      {/* Guia de testes de usabilidade */}
      <UsabilityGuide />
    </div>
  );
};