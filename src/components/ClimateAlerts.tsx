import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Thermometer, Droplets, Snowflake, Sun } from "lucide-react";

interface ClimateAlertsProps {
  data: {
    parameters: {
      [key: string]: number[];
    };
    selectedParameters: string[];
    rawData?: any;
  };
}

interface ClimateAlert {
  type: 'extreme_heat' | 'extreme_cold' | 'heavy_rain' | 'drought' | 'frost_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  icon: any;
  color: string;
  dates: string[];
}

export const ClimateAlerts = ({ data }: ClimateAlertsProps) => {
  // Limiares para alertas (podem ser configuráveis no futuro)
  const thresholds = {
    extreme_heat: 35, // °C
    extreme_cold: 5,  // °C
    heavy_rain: 50,   // mm/dia
    drought_days: 30, // dias consecutivos com < 1mm
    frost_risk: 2     // °C
  };

  const analyzeClimateEvents = (): ClimateAlert[] => {
    const alerts: ClimateAlert[] = [];

    if (!data.rawData?.properties?.parameter) {
      return alerts;
    }

    const parameters = data.rawData.properties.parameter;
    
    // Analisar temperatura extrema
    if (parameters['T2M']) {
      const temperatures = parameters['T2M'];
      const dates = Object.keys(temperatures).sort();
      
      // Detectar ondas de calor
      const heatWaveDates: string[] = [];
      const coldWaveDates: string[] = [];
      const frostRiskDates: string[] = [];
      
      dates.forEach(dateStr => {
        const temp = temperatures[dateStr];
        const formattedDate = formatDate(dateStr);
        
        if (temp > thresholds.extreme_heat) {
          heatWaveDates.push(formattedDate);
        }
        
        if (temp < thresholds.extreme_cold) {
          coldWaveDates.push(formattedDate);
        }
        
        if (temp <= thresholds.frost_risk) {
          frostRiskDates.push(formattedDate);
        }
      });
      
      if (heatWaveDates.length > 0) {
        alerts.push({
          type: 'extreme_heat',
          severity: heatWaveDates.length > 10 ? 'critical' : heatWaveDates.length > 5 ? 'high' : 'medium',
          title: 'Ondas de Calor Detectadas',
          description: `Temperaturas acima de ${thresholds.extreme_heat}°C detectadas em ${heatWaveDates.length} dias. Risco de estresse térmico nas culturas.`,
          icon: Thermometer,
          color: 'text-red-600',
          dates: heatWaveDates.slice(0, 5) // Mostrar apenas os primeiros 5
        });
      }
      
      if (coldWaveDates.length > 0) {
        alerts.push({
          type: 'extreme_cold',
          severity: coldWaveDates.length > 5 ? 'high' : 'medium',
          title: 'Temperaturas Extremamente Baixas',
          description: `Temperaturas abaixo de ${thresholds.extreme_cold}°C detectadas em ${coldWaveDates.length} dias.`,
          icon: Snowflake,
          color: 'text-blue-600',
          dates: coldWaveDates.slice(0, 5)
        });
      }
      
      if (frostRiskDates.length > 0) {
        alerts.push({
          type: 'frost_risk',
          severity: frostRiskDates.length > 10 ? 'high' : 'medium',
          title: 'Risco de Geada',
          description: `Temperaturas ≤ ${thresholds.frost_risk}°C detectadas em ${frostRiskDates.length} dias. Alto risco de geada para culturas sensíveis.`,
          icon: Snowflake,
          color: 'text-cyan-600',
          dates: frostRiskDates.slice(0, 5)
        });
      }
    }

    // Analisar precipitação extrema
    if (parameters['PRECTOTCORR']) {
      const precipitation = parameters['PRECTOTCORR'];
      const dates = Object.keys(precipitation).sort();
      
      const heavyRainDates: string[] = [];
      let consecutiveDryDays = 0;
      let maxDryStreak = 0;
      
      dates.forEach(dateStr => {
        const precip = precipitation[dateStr];
        const formattedDate = formatDate(dateStr);
        
        if (precip > thresholds.heavy_rain) {
          heavyRainDates.push(formattedDate);
        }
        
        // Contar dias secos consecutivos
        if (precip < 1) {
          consecutiveDryDays++;
          maxDryStreak = Math.max(maxDryStreak, consecutiveDryDays);
        } else {
          consecutiveDryDays = 0;
        }
      });
      
      if (heavyRainDates.length > 0) {
        alerts.push({
          type: 'heavy_rain',
          severity: heavyRainDates.length > 10 ? 'high' : 'medium',
          title: 'Chuvas Intensas Detectadas',
          description: `Precipitação acima de ${thresholds.heavy_rain}mm/dia detectada em ${heavyRainDates.length} dias. Risco de encharcamento e erosão.`,
          icon: Droplets,
          color: 'text-blue-700',
          dates: heavyRainDates.slice(0, 5)
        });
      }
      
      if (maxDryStreak >= thresholds.drought_days) {
        alerts.push({
          type: 'drought',
          severity: maxDryStreak > 60 ? 'critical' : maxDryStreak > 45 ? 'high' : 'medium',
          title: 'Período de Seca Prolongado',
          description: `Detectado período de até ${maxDryStreak} dias consecutivos com precipitação < 1mm. Risco de estresse hídrico nas culturas.`,
          icon: Sun,
          color: 'text-orange-600',
          dates: []
        });
      }
    }

    return alerts;
  };

  const formatDate = (dateStr: string): string => {
    // Converter YYYYMMDD para DD/MM/YYYY
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 dark:bg-red-950';
      case 'high': return 'bg-orange-100 border-orange-500 dark:bg-orange-950';
      case 'medium': return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-950';
      case 'low': return 'bg-blue-100 border-blue-500 dark:bg-blue-950';
      default: return 'bg-gray-100 border-gray-500 dark:bg-gray-950';
    }
  };

  const getSeverityBadgeColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const alerts = analyzeClimateEvents();

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Sun className="h-5 w-5" />
            Análise de Eventos Climáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sun className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-700 font-medium">Nenhum evento climático extremo detectado</p>
            <p className="text-sm text-muted-foreground mt-1">
              As condições climáticas estão dentro dos parâmetros normais para a agricultura
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertas Climáticos Detectados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Análise automática baseada nos dados climáticos do período selecionado:
        </div>
        
        {alerts.map((alert, index) => {
          const IconComponent = alert.icon;
          
          return (
            <Alert key={index} className={getSeverityColor(alert.severity)}>
              <IconComponent className={`h-4 w-4 ${alert.color}`} />
              <AlertDescription>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`${getSeverityBadgeColor(alert.severity)} text-white text-xs`}
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm mb-3">{alert.description}</p>
                
                {alert.dates.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Primeiras ocorrências:</p>
                    <div className="flex flex-wrap gap-1">
                      {alert.dates.map((date, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {date}
                        </Badge>
                      ))}
                      {alerts.find(a => a.type === alert.type)?.dates.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{alerts.find(a => a.type === alert.type)?.dates.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
        
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
            Recomendações para Cafeicultura:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Monitore sistemas de irrigação durante períodos secos</li>
            <li>• Implemente proteção contra geadas quando necessário</li>
            <li>• Ajuste práticas de manejo conforme condições extremas</li>
            <li>• Considere variedades mais resistentes para áreas de risco</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};