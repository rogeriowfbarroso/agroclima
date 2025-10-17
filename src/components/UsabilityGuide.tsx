import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  CheckSquare, 
  Users, 
  Coffee, 
  Map,
  Download,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Lightbulb
} from "lucide-react";
import { useState } from "react";

export const UsabilityGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const usabilityTests = [
    {
      icon: Map,
      title: "Teste do Mapa Climático",
      description: "Avalie a utilidade do mapa interativo",
      tasks: [
        "Inserir token do Mapbox e carregar o mapa",
        "Verificar se as informações no popup são claras",
        "Avaliar a representação visual da temperatura",
        "Testar navegação e zoom do mapa"
      ],
      feedback: "O mapa ajuda a visualizar os dados geograficamente?"
    },
    {
      icon: BarChart3,
      title: "Teste de Exportação de Gráficos",
      description: "Verifique a funcionalidade de exportação",
      tasks: [
        "Exportar gráfico de temperatura como PNG",
        "Exportar gráfico de precipitação como SVG",
        "Verificar qualidade das imagens exportadas",
        "Testar uso das imagens em apresentações"
      ],
      feedback: "As imagens exportadas são úteis para seus relatórios?"
    },
    {
      icon: AlertTriangle,
      title: "Teste de Alertas Climáticos",
      description: "Avalie a relevância dos alertas automáticos",
      tasks: [
        "Revisar alertas de eventos extremos detectados",
        "Verificar se os limiares fazem sentido para sua região",
        "Avaliar a clareza das recomendações",
        "Considerar como os alertas afetariam suas decisões"
      ],
      feedback: "Os alertas são úteis para o manejo do cafezal?"
    },
    {
      icon: Coffee,
      title: "Teste de Interface para Cafeicultura",
      description: "Adaptar a interface para uso no campo",
      tasks: [
        "Testar em diferentes tamanhos de tela",
        "Verificar legibilidade sob luz solar",
        "Avaliar facilidade de navegação com luvas",
        "Testar velocidade de carregamento em conexões lentas"
      ],
      feedback: "A interface é prática para uso no campo?"
    }
  ];

  const fieldConditions = [
    {
      condition: "Conectividade Limitada",
      test: "Teste com conexão 3G/4G instável",
      expected: "Interface deve funcionar adequadamente mesmo com latência"
    },
    {
      condition: "Luz Solar Direta",
      test: "Verificar legibilidade em tablet/celular ao ar livre",
      expected: "Contraste adequado para leitura externa"
    },
    {
      condition: "Uso com Equipamento",
      test: "Navegação com luvas de trabalho",
      expected: "Botões e toques devem ser responsivos"
    },
    {
      condition: "Tomada de Decisão Rápida",
      test: "Encontrar informação crítica em < 30 segundos",
      expected: "Dados principais visíveis sem navegação complexa"
    }
  ];

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between p-0 h-auto">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Clima Produtivo
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Introdução */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Introdução
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Este sistema foi projetado para auxiliar na tomada de decisões no manejo do café. 
                    Testes com usuários reais em condições de campo são essenciais para validar se 
                    as funcionalidades realmente atendem às necessidades práticas da cafeicultura.
                  </p>
                </div>
              </div>
            </div>

            {/* Contexto de Uso */}
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Cenários de uso na cafeicultura:
              </h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p>
                  <strong>Planejamento da safra:</strong> Usar dados históricos para planejar práticas de manejo, 
                  épocas de plantio e colheita.
                </p>
                <p>
                  <strong>Manejo preventivo:</strong> Identificar períodos de risco (geadas, secas) para 
                  implementar medidas preventivas.
                </p>
                <p>
                  <strong>Tomada de decisão rápida:</strong> No campo, consultar alertas e mapas para 
                  decisões imediatas sobre irrigação, proteção, etc.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};