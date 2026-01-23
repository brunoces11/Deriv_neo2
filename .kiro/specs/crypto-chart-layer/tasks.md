# Implementation Plan: Crypto Chart Layer

## Overview

Plano de implementação para adicionar uma camada de gráficos de criptomoedas usando TradingView Lightweight Charts. O chart será uma camada visual de fundo controlada por um toggle button.

---

## Tasks

### FASE 1: Análise e Preparação de Z-Index

- [x] 1. Verificar e documentar z-index atual dos componentes
  - Confirmar z-index do AccountHeader (z-30)
  - Confirmar z-index do Content Area (z-10)
  - Confirmar z-index do ChatInput container (z-20)
  - Verificar que Sidebar e ExecutionsSidebar não têm z-index explícito
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Ajustar z-index do Sidebar esquerdo
  - Adicionar `relative z-40` ao elemento `<aside>` em Sidebar.tsx
  - Testar que sidebar continua funcionando normalmente
  - _Requirements: 2.1_

- [x] 3. Ajustar z-index do ExecutionsSidebar direito
  - Adicionar `relative z-40` ao elemento `<aside>` em ExecutionsSidebar.tsx
  - Testar que sidebar continua funcionando normalmente
  - _Requirements: 2.2_

- [x] 4. Checkpoint - Verificar que UI está intacta
  - Executar `npm run dev` e verificar visualmente
  - Confirmar que nenhum elemento visual foi afetado
  - Testar interações básicas (chat, sidebars)

---

### FASE 2: Verificação de Compatibilidade

- [x] 5. Verificar compatibilidade do Lightweight Charts
  - Confirmar suporte a React 18.3.1
  - Confirmar suporte a Vite 5.4.2 (ESM)
  - Confirmar suporte a TypeScript 5.5.3
  - Verificar que types estão incluídos (não precisa @types)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Verificar ausência de conflitos com dependências
  - Analisar package.json atual
  - Confirmar que não há bibliotecas conflitantes
  - _Requirements: 3.6_

---

### FASE 3: Instalação da Biblioteca

- [x] 7. Instalar TradingView Lightweight Charts
  - Executar: `npm install lightweight-charts`
  - Verificar que instalação completou sem erros
  - _Requirements: 4.1, 4.2_

- [x] 8. Verificar integridade do projeto após instalação
  - Executar: `npm run build`
  - Executar: `npm run typecheck`
  - Confirmar que não há erros de compilação
  - _Requirements: 4.3, 4.4_

- [x] 9. Checkpoint - Projeto compila corretamente
  - Executar `npm run dev` e verificar que app carrega
  - Confirmar que nenhuma funcionalidade foi quebrada

---

### FASE 4: Implementação do Toggle Button

- [x] 10. Criar componente ChartToggle.tsx
  - Criar arquivo em `src/components/chart/ChartToggle.tsx`
  - Implementar botão com ícone (TrendingUp ou BarChart2 do lucide-react)
  - Aceitar props: `isActive`, `onToggle`
  - Estilizar com Tailwind (consistente com design system)
  - Suportar tema dark/light
  - _Requirements: 5.1, 5.4, 5.6_

- [x] 11. Integrar ChartToggle no MainArea
  - Adicionar estado `isChartVisible` no MainArea.tsx
  - Posicionar toggle acima da área de conteúdo, abaixo do AccountHeader
  - Conectar toggle ao estado
  - _Requirements: 5.2, 5.3_

- [ ] 12. Checkpoint - Toggle funciona isoladamente
  - Verificar que botão aparece na posição correta
  - Verificar que estado alterna corretamente (console.log)
  - Testar em dark e light mode

---

### FASE 5: Implementação do Chart Layer

- [-] 13. Criar componente ChartLayer.tsx
  - Criar arquivo em `src/components/chart/ChartLayer.tsx`
  - Implementar container com posicionamento absolute e z-5
  - Aceitar props: `isVisible`, `symbol`, `theme`
  - Configurar Lightweight Charts com tema Deriv
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [-] 14. Criar dados mock de candlesticks
  - Criar arquivo `src/services/mockChartData.ts`
  - Gerar ~100 candles diários simulados de BTC
  - Formato: { time, open, high, low, close }
  - _Requirements: 6.5_

- [ ] 15. Integrar ChartLayer no MainArea
  - Adicionar ChartLayer como primeira camada dentro do main
  - Conectar ao estado `isChartVisible`
  - Passar tema atual (dark/light)
  - _Requirements: 6.1, 6.6_

- [ ] 16. Configurar cores do chart para tema Deriv
  - Candle de alta: #00B67B (brand-green)
  - Candle de baixa: #ff444f (vermelho Deriv)
  - Grid: cores zinc apropriadas para cada tema
  - Crosshair: vermelho Deriv
  - _Requirements: 6.3_

- [ ] 17. Checkpoint - Chart renderiza corretamente
  - Verificar que chart aparece quando toggle está ativo
  - Verificar que chart desaparece quando toggle está inativo
  - Verificar que todos os componentes da UI ficam acima do chart
  - Testar responsividade (resize da janela)

---

### FASE 6: Refinamento e Integração

- [ ] 18. Implementar suporte a dark/light mode no chart
  - Detectar tema atual via useTheme()
  - Aplicar configurações de cores apropriadas
  - Testar alternância de tema com chart ativo
  - _Requirements: 6.3_

- [ ] 19. Garantir responsividade do chart
  - Implementar resize handler
  - Chart deve se adaptar ao tamanho do container
  - Testar em diferentes tamanhos de tela
  - _Requirements: 6.4_

- [ ] 20. Preparar para integração futura com Langflow
  - Expor interface para controle externo
  - Documentar props e métodos disponíveis
  - Garantir que componente pode receber dados dinâmicos
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

---

### FASE 7: Revisão Final

- [ ] 21. Revisão geral e testes finais
  - Testar fluxo completo: toggle on → chart aparece → toggle off → chart some
  - Verificar que chat funciona normalmente com chart ativo
  - Verificar que sidebars funcionam normalmente com chart ativo
  - Testar em dark mode e light mode
  - Verificar console por erros ou warnings
  - Executar build final: `npm run build`

- [ ] 22. Documentação
  - Atualizar README se necessário
  - Documentar como usar o ChartLayer em outros contextos
  - Listar próximos passos para integração com dados reais

---

## Notes

- A biblioteca Lightweight Charts é leve (~40KB) e não deve impactar performance
- O chart usa canvas para renderização, garantindo boa performance
- Dados mock são suficientes para demonstração; integração com API real é fase futura
- O toggle pode ser controlado futuramente pelo Langflow via UI Events
