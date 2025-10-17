import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Settings } from 'lucide-react';

interface ClimateMapProps {
  data: {
    location: {
      latitude: number;
      longitude: number;
    };
    parameters: {
      [key: string]: number[];
    };
    selectedParameters: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export const ClimateMap = ({ data }: ClimateMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = 'pk.eyJ1Ijoicm9nZXJpb2JhcnJvc28iLCJhIjoiY21mb3IyMmowMDh0ajJtbXYwbnJudDRyNyJ9.GGrp1UtOhWI06CUvDX9lgA';
  const { toast } = useToast();

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [data.location.longitude, data.location.latitude],
        zoom: 10,
      });

      // Adicionar controles de navegação
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Adicionar marcador da localização
      const marker = new mapboxgl.Marker({
        color: '#ff6b35',
        scale: 1.2
      })
        .setLngLat([data.location.longitude, data.location.latitude])
        .addTo(map.current);

      // Criar popup com informações climáticas
      const popupContent = createPopupContent();
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeOnClick: false
      }).setHTML(popupContent);

      marker.setPopup(popup);
      popup.addTo(map.current);

      // Adicionar camada de calor baseada nos dados de temperatura
      map.current.on('load', () => {
        addTemperatureLayer();
      });

      
      
      toast({
        title: "Mapa carregado!",
        description: "Visualização climática está disponível",
      });

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      toast({
        title: "Erro no mapa",
        description: "Token do Mapbox inválido ou erro de conexão",
        variant: "destructive",
      });
    }
  };

  const createPopupContent = () => {
    const avgTemp = data.parameters['T2M'] 
      ? (data.parameters['T2M'].reduce((a, b) => a + b, 0) / data.parameters['T2M'].length).toFixed(1)
      : 'N/A';
    
    const avgPrecip = data.parameters['PRECTOTCORR']
      ? (data.parameters['PRECTOTCORR'].reduce((a, b) => a + b, 0) / data.parameters['PRECTOTCORR'].length).toFixed(1)
      : 'N/A';

    return `
      <div class="p-3">
        <h3 class="font-bold text-lg mb-2">Dados Climáticos</h3>
        <p class="text-sm mb-1"><strong>Coordenadas:</strong> ${data.location.latitude.toFixed(4)}°, ${data.location.longitude.toFixed(4)}°</p>
        <p class="text-sm mb-1"><strong>Período:</strong> ${data.dateRange.start} - ${data.dateRange.end}</p>
        <p class="text-sm mb-1"><strong>Temp. Média:</strong> ${avgTemp}°C</p>
        <p class="text-sm"><strong>Precip. Média:</strong> ${avgPrecip} mm/dia</p>
      </div>
    `;
  };

  const addTemperatureLayer = () => {
    if (!map.current || !data.parameters['T2M']) return;

    const avgTemp = data.parameters['T2M'].reduce((a, b) => a + b, 0) / data.parameters['T2M'].length;
    
    // Criar gradiente baseado na temperatura
    const radius = avgTemp > 25 ? 50 : avgTemp > 20 ? 40 : 30;
    const color = avgTemp > 30 ? '#ff4444' : avgTemp > 25 ? '#ff8800' : avgTemp > 20 ? '#ffcc00' : '#0088ff';

    // Adicionar círculo representando zona climática
    map.current.addSource('temperature-zone', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude]
        },
        properties: {
          temperature: avgTemp
        }
      }
    });

    map.current.addLayer({
      id: 'temperature-circle',
      type: 'circle',
      source: 'temperature-zone',
      paint: {
        'circle-radius': radius,
        'circle-color': color,
        'circle-opacity': 0.3,
        'circle-stroke-width': 2,
        'circle-stroke-color': color,
        'circle-stroke-opacity': 0.8
      }
    });
  };

  useEffect(() => {
    initializeMap(mapboxToken);
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa Climático
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg shadow-lg" 
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Marcador vermelho: Localização dos dados climáticos</p>
          <p>• Círculo colorido: Zona de temperatura (azul=frio, amarelo=morno, vermelho=quente)</p>
          <p>• Clique no marcador para ver detalhes dos dados</p>
        </div>
      </CardContent>
    </Card>
  );
};