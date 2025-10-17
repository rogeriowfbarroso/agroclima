import * as XLSX from 'xlsx';

interface ClimateData {
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
}

export const exportToExcel = (data: ClimateData) => {
  try {
    console.log('Starting Excel export with data:', data);
    
    // Validate data
    if (!data || !data.selectedParameters || data.selectedParameters.length === 0) {
      console.error('No data or parameters selected for export');
      return false;
    }
    
    // Check if XLSX is available
    if (typeof XLSX === 'undefined') {
      console.error('XLSX library not loaded');
      return false;
    }
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData: any[] = [];
    
    // Get the length of the first parameter to determine number of data points
    const firstParam = data.selectedParameters[0];
    const dataLength = data.parameters[firstParam]?.length || 0;
    
    console.log('Data length:', dataLength, 'First param:', firstParam);
    
    if (dataLength === 0) {
      console.error('No data points available for export');
      return false;
    }
    
    // Generate dates for each data point
    const dates = generateDateRange(data.dateRange.start, data.dateRange.end);
    
    // Create rows for each data point
    for (let i = 0; i < dataLength; i++) {
      const row: any = {
        'Índice': i + 1,
        'Data': dates[i] || 'N/A',
        'Latitude': data.location.latitude,
        'Longitude': data.location.longitude,
      };
      
      // Add each parameter value
      data.selectedParameters.forEach(param => {
        const paramName = getParameterName(param);
        row[paramName] = data.parameters[param]?.[i] || 'N/A';
      });
      
      exportData.push(row);
    }
    
    console.log('Export data prepared:', exportData.length, 'rows');
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');
    
    // Generate filename with current date
    const now = new Date();
    const filename = `dados_climaticos_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}.xlsx`;
    
    console.log('Attempting to save file:', filename);
    
    // Save file
    try {
      XLSX.writeFile(workbook, filename);
    } catch (e) {
      console.warn('writeFile failed, using blob fallback:', e);
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    }
    
    console.log('Excel export completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return false;
  }
};

const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

const getParameterName = (param: string): string => {
  const names: { [key: string]: string } = {
    'T2M': 'Temperatura a 2m (°C)',
    'T2M_MAX': 'Temperatura Máxima a 2m (°C)',
    'T2M_MIN': 'Temperatura Mínima a 2m (°C)',
    'RH2M': 'Umidade Relativa a 2m (%)',
    'PRECTOTCORR': 'Precipitação (mm/dia)',
    'PS': 'Pressão Atmosférica (kPa)',
    'WS10M': 'Velocidade do Vento a 10m (m/s)',
    'ALLSKY_SFC_SW_DWN': 'Radiação Solar (kWh/m²/dia)'
  };
  
  return names[param] || param;
};