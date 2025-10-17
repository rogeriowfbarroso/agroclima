interface GeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

class GeocodingService {
  async getCityCoordinates(cityName: string): Promise<{latitude: number, longitude: number, address: string} | null> {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NASA Climate Data App'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();