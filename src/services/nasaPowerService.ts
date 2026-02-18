interface NASAPowerResponse {
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    parameter: {
      [key: string]: { [key: string]: number };
    };
  };
}

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

class NASAPowerService {
  private readonly BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  
  async getClimateData(
    latitude: number, 
    longitude: number, 
    parameters: string[] = ['T2M', 'PRECTOTCORR'],
    startDate: string = '2010-01-01',
    endDate: string = '2025-12-15 (máximo)'
  ): Promise<ClimateData> {
    // Join parameters
    const parametersString = parameters.join(',');
    
    // Build the API URL
    const url = new URL(this.BASE_URL);
    url.searchParams.set('start', startDate.replace(/-/g, ''));
    url.searchParams.set('end', endDate.replace(/-/g, ''));
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('community', 'RE');
    url.searchParams.set('parameters', parametersString);
    url.searchParams.set('format', 'JSON');
    url.searchParams.set('user', 'climagro');

    try {
      console.log('Fetching NASA POWER data from:', url.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
      }

      const data: NASAPowerResponse = await response.json();
      
      console.log('NASA POWER API response:', data);

      // Transform the data into our format
      const transformedParameters: { [key: string]: number[] } = {};
      
      for (const param of parameters) {
        transformedParameters[param] = data.properties.parameter[param] 
          ? Object.values(data.properties.parameter[param]) 
          : [];
      }

      const transformedData: ClimateData = {
        location: {
          latitude,
          longitude,
        },
        geometry: data.geometry,
        parameters: transformedParameters,
        selectedParameters: parameters,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        rawData: data, // Adicionar dados raw para os gráficos
      };

      return transformedData;
    } catch (error) {
      console.error('Erro ao buscar dados do NASA POWER:', error);
      throw new Error('Falha ao buscar dados climáticos da API NASA POWER');
    }
  }
}

export const nasaPowerService = new NASAPowerService();