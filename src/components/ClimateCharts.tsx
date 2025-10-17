import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Image, FileImage } from "lucide-react";
import { useChartExport } from "@/hooks/useChartExport";

interface ClimateChartsProps {
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
  };
  rawData?: any;
}

const getParameterInfo = (param: string) => {
  const info: { [key: string]: { name: string; unit: string; color: string } } = {
    'T2M': { name: 'Temperatura', unit: '°C', color: '#f97316' },
    'T2M_MAX': { name: 'Temp. Máxima', unit: '°C', color: '#dc2626' },
    'T2M_MIN': { name: 'Temp. Mínima', unit: '°C', color: '#2563eb' },
    'RH2M': { name: 'Umidade', unit: '%', color: '#3b82f6' },
    'PRECTOTCORR': { name: 'Precipitação', unit: 'mm/dia', color: '#1d4ed8' },
    'PS': { name: 'Pressão Atmosférica', unit: 'kPa', color: '#7c3aed' },
    'WS10M': { name: 'Velocidade do Vento', unit: 'm/s', color: '#059669' },
    'ALLSKY_SFC_SW_DWN': { name: 'Radiação Solar', unit: 'kWh/m²/dia', color: '#ca8a04' },
  };
  
  return info[param] || { name: param, unit: '', color: '#6b7280' };
};

export const ClimateCharts = ({ data, rawData }: ClimateChartsProps) => {
  const { exportChartAsPNG, exportChartAsSVG, exportChartAsJPEG } = useChartExport();
  // Processar dados para os gráficos
  const processChartData = () => {
    if (!rawData || !rawData.properties || !rawData.properties.parameter) {
      return [];
    }

    const processedData: any[] = [];
    const parameters = rawData.properties.parameter;
    
    // Pegar todas as datas disponíveis do primeiro parâmetro
    const firstParam = Object.keys(parameters)[0];
    if (!firstParam || !parameters[firstParam]) {
      return [];
    }
    
    const dates = Object.keys(parameters[firstParam]).sort();
    
    // Limitar a 30 pontos para melhor visualização
    const step = Math.ceil(dates.length / 30);
    const sampledDates = dates.filter((_, index) => index % step === 0);
    
    sampledDates.forEach(dateStr => {
      const dataPoint: any = {};
      
      try {
        // Converter string de data YYYYMMDD para formato legível
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6));
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month - 1, day);
        
        dataPoint.date = format(date, 'dd/MM', { locale: ptBR });
        dataPoint.fullDate = format(date, 'dd/MM/yyyy', { locale: ptBR });
        
        // Adicionar valores de todos os parâmetros
        data.selectedParameters.forEach(param => {
          if (parameters[param] && parameters[param][dateStr] !== undefined) {
            dataPoint[param] = parameters[param][dateStr];
          }
        });
        
        processedData.push(dataPoint);
      } catch (error) {
        console.warn('Erro ao processar data:', dateStr, error);
      }
    });
    
    return processedData;
  };

  const chartData = processChartData();

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos Climáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dados insuficientes para gerar gráficos
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar parâmetros de temperatura e outros
  const temperatureParams = data.selectedParameters.filter(p => 
    p.includes('T2M') || p.includes('TEMP')
  );
  const otherParams = data.selectedParameters.filter(p => 
    !p.includes('T2M') && !p.includes('TEMP')
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground mb-4">Visualização dos Dados</h3>
      
      {/* Gráfico de Temperatura */}
      {temperatureParams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Variação de Temperatura ao Longo do Tempo</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsPNG('temperature-chart', 'temperatura-climatica')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsSVG('temperature-chart', 'temperatura-climatica')}
                >
                  <FileImage className="h-4 w-4 mr-1" />
                  SVG
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="temperature-chart" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${chartData.find(d => d.date === value)?.fullDate || value}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  {temperatureParams.map(param => {
                    const paramInfo = getParameterInfo(param);
                    return (
                      <Line
                        key={param}
                        type="monotone"
                        dataKey={param}
                        stroke={paramInfo.color}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name={`${paramInfo.name} (${paramInfo.unit})`}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Precipitação */}
      {otherParams.includes('PRECTOTCORR') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Precipitação ao Longo do Tempo</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsPNG('precipitation-chart', 'precipitacao-climatica')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsSVG('precipitation-chart', 'precipitacao-climatica')}
                >
                  <FileImage className="h-4 w-4 mr-1" />
                  SVG
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="precipitation-chart" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${chartData.find(d => d.date === value)?.fullDate || value}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="PRECTOTCORR" 
                    fill={getParameterInfo('PRECTOTCORR').color}
                    name={`${getParameterInfo('PRECTOTCORR').name} (${getParameterInfo('PRECTOTCORR').unit})`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Outros Parâmetros */}
      {otherParams.filter(p => p !== 'PRECTOTCORR').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Outros Parâmetros Climáticos</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsPNG('other-params-chart', 'outros-parametros-climaticos')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportChartAsSVG('other-params-chart', 'outros-parametros-climaticos')}
                >
                  <FileImage className="h-4 w-4 mr-1" />
                  SVG
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="other-params-chart" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${chartData.find(d => d.date === value)?.fullDate || value}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  {otherParams.filter(p => p !== 'PRECTOTCORR').map(param => {
                    const paramInfo = getParameterInfo(param);
                    return (
                      <Line
                        key={param}
                        type="monotone"
                        dataKey={param}
                        stroke={paramInfo.color}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name={`${paramInfo.name} (${paramInfo.unit})`}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};