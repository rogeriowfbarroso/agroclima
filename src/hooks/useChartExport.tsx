import { useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

export const useChartExport = () => {
  const { toast } = useToast();

  const exportChartAsPNG = useCallback(async (elementId: string, filename: string = 'grafico-climatico') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      // Configurações para melhor qualidade
      const options = {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${element.offsetWidth}px`,
          height: `${element.offsetHeight}px`,
        }
      };

      const dataUrl = await htmlToImage.toPng(element, options);
      
      // Criar link de download
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Imagem exportada!",
        description: `Gráfico salvo como ${filename}.png`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar gráfico como PNG",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const exportChartAsSVG = useCallback(async (elementId: string, filename: string = 'grafico-climatico') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      const dataUrl = await htmlToImage.toSvg(element, {
        backgroundColor: '#ffffff',
        quality: 1.0,
      });
      
      // Criar link de download
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Imagem exportada!",
        description: `Gráfico salvo como ${filename}.svg`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao exportar SVG:', error);
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar gráfico como SVG",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const exportChartAsJPEG = useCallback(async (elementId: string, filename: string = 'grafico-climatico') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      };

      const dataUrl = await htmlToImage.toJpeg(element, options);
      
      // Criar link de download
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Imagem exportada!",
        description: `Gráfico salvo como ${filename}.jpg`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao exportar JPEG:', error);
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar gráfico como JPEG",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    exportChartAsPNG,
    exportChartAsSVG,
    exportChartAsJPEG
  };
};