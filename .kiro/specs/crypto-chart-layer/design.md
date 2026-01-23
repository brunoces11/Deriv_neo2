# Design Document: Crypto Chart Layer

## Overview

Este documento detalha o design técnico para implementação de uma camada de gráficos de criptomoedas usando TradingView Lightweight Charts. O chart será uma camada visual de fundo que aparece abaixo de todos os componentes da UI quando ativado via toggle button.

---

## 1. Análise Detalhada do Z-Index Atual

### 1.1 Mapeamento Completo dos Componentes

Após análise detalhada do código-fonte, aqui está o mapeamento completo:

#### Componentes com Z-Index Explícito

| Componente | Arquivo | Z-Index Atual | Classe/Estilo |
|------------|---------|---------------|---------------|
| AccountHeader | `AccountHeader.tsx` | `z-30` | `relative z-30` |
| MainArea content | `MainArea.tsx` | `z-10` | `relative z-10` |
| ChatInput container | `MainArea.tsx` | `z-20` | `relative z-20` |
| Background gradient | `MainArea.tsx` | nenhum | `pointer-events-none` |
| CardsPage header | `CardsPage.tsx` | `z-10` | `sticky top-0 z-10` |
| CardsPage logo | `CardsPage.tsx` | `z-20` | `fixed ... z-20` |
| CardsPage user profile | `CardsPage.tsx` | `z-20` | `fixed ... z-20` |

#### Componentes SEM Z-Index Explícito (herdam do contexto)

| Componente | Arquivo | Comportamento |
|------------|---------|---------------|
| Sidebar | `Sidebar.tsx` | Sem z-index, usa stacking context do flex |
| ExecutionsSidebar | `ExecutionsSidebar.tsx` | Sem z-index, usa stacking context do flex |
| ChatMessages | `ChatMessages.tsx` | Herda do parent (z-10) |
| WelcomeScreen | `MainArea.tsx` | Herda do parent (z-10) |
| ActiveCards | `ActiveCards.tsx` | Herda do parent (z-10) |

### 1.2 Estrutura de Layout Atual

```
┌─────────────────────────────────────────────────────────────────┐
│ App Container (h-screen flex overflow-hidden)                   │
├──────────┬────────────────────────────────┬────────────────────┤
│ Sidebar  │         MainArea               │ ExecutionsSidebar  │
│ (w-72)   │         (flex-1)               │ (w-72)             │
│          │                                │                    │
│ z: auto  │ ┌────────────────────────────┐ │ z: auto            │
│          │ │ AccountHeader (z-30)       │ │                    │
│          │ ├────────────────────────────┤ │                    │
│          │ │ Background Gradient        │ │                    │
│          │ │ (absolute inset-0)         │ │                    │
│          │ │ pointer-events-none        │ │                    │
│          │ ├────────────────────────────┤ │                    │
│          │ │ Content Area (z-10)        │ │                    │
│          │ │ - WelcomeScreen            │ │                    │
│          │ │ - ChatMessages             │ │                    │
│          │ │ - ActiveCards              │ │                    │
│          │ ├────────────────────────────┤ │                    │
│          │ │ ChatInput (z-20)           │ │                    │
│          │ └────────────────────────────┘ │                    │
└──────────┴────────────────────────────────┴────────────────────┘
```

### 1.3 Hierarquia Z-Index Proposta

Para inserir o Chart Layer corretamente, proponho a seguinte hierarquia:

```
Z-INDEX STACK (de baixo para cima):
─────────────────────────────────────
z-0   │ Background (bg-zinc-900)
z-5   │ Chart Layer (NOVO) ← quando ativo
z-10  │ Content Area (WelcomeScreen, ChatMessages, ActiveCards)
z-20  │ ChatInput
z-30  │ AccountHeader
z-40  │ Sidebars (precisam ser elevados)
z-50  │ Modals/Overlays (futuro)
```

---

## 2. Ajustes de Z-Index Necessários

### 2.1 Componentes que PRECISAM de Ajuste

#### Sidebar.tsx
- **Atual**: Sem z-index explícito
- **Necessário**: Adicionar `z-40` ou `relative z-40`
- **Motivo**: Garantir que fique acima do chart layer

#### ExecutionsSidebar.tsx
- **Atual**: Sem z-index explícito
- **Necessário**: Adicionar `z-40` ou `relative z-40`
- **Motivo**: Garantir que fique acima do chart layer

### 2.2 Componentes que NÃO Precisam de Ajuste

| Componente | Motivo |
|------------|--------|
| AccountHeader | Já tem z-30, suficiente |
| ChatInput container | Já tem z-20, suficiente |
| Content Area | Já tem z-10, suficiente |
| Background gradient | Não precisa, é decorativo |

### 2.3 Novo Componente: Chart Layer

```
Posição: z-5
Container: absolute inset-0 dentro do MainArea
Condição: Renderiza apenas quando toggle está ativo
```

---

## 3. Verificação de Compatibilidade

### 3.1 TradingView Lightweight Charts vs Stack Atual

| Requisito | Stack Atual | Lightweight Charts | Status |
|-----------|-------------|-------------------|--------|
| React | 18.3.1 | Suporta React 16+ | ✅ Compatível |
| Vite | 5.4.2 | ESM nativo | ✅ Compatível |
| TypeScript | 5.5.3 | Types incluídos | ✅ Compatível |
| ES Modules | type: "module" | ESM nativo | ✅ Compatível |
| Bundle size | - | ~40KB gzipped | ✅ Leve |
| Tree-shaking | Vite suporta | Suportado | ✅ Compatível |

### 3.2 Dependências Existentes - Análise de Conflitos

```json
{
  "@supabase/supabase-js": "^2.57.4",  // Sem conflito
  "lucide-react": "^0.344.0",          // Sem conflito
  "react": "^18.3.1",                  // Compatível
  "react-dom": "^18.3.1",              // Compatível
  "react-router-dom": "^7.12.0"        // Sem conflito
}
```

**Resultado**: Nenhum conflito identificado. Instalação segura.

### 3.3 Versão Recomendada

```bash
npm install lightweight-charts@^4.1.0
```

- Versão 4.x é a mais recente e estável
- Types TypeScript incluídos nativamente
- Não precisa de @types/lightweight-charts

---

## 4. Arquitetura do Chart Layer

### 4.1 Estrutura de Componentes

```
src/
├── components/
│   ├── chart/
│   │   ├── ChartLayer.tsx        # Componente principal
│   │   ├── ChartToggle.tsx       # Botão toggle
│   │   └── useChart.ts           # Hook para controle do chart
│   └── layout/
│       └── MainArea.tsx          # Modificado para incluir ChartLayer
```

### 4.2 Fluxo de Dados

```
┌─────────────────┐
│ ChartToggle     │ ──── onClick ────┐
└─────────────────┘                  │
                                     ▼
┌─────────────────┐         ┌─────────────────┐
│ ChartContext    │ ◄────── │ toggleChart()   │
│ (ou useState)   │         └─────────────────┘
└────────┬────────┘
         │
         │ isChartVisible
         ▼
┌─────────────────┐
│ ChartLayer      │ ──── conditional render
└─────────────────┘
```

### 4.3 Posicionamento do Toggle Button

```
┌────────────────────────────────────────────────────────────┐
│ AccountHeader (z-30)                                       │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [📊 Toggle] ← AQUI, alinhado à direita, acima do chat  │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │                                                        │ │
│ │              WelcomeScreen / ChatMessages              │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ ChatInput (z-20)                                           │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Configuração Visual do Chart

### 5.1 Tema Deriv (Dark Mode)

```typescript
const derivDarkTheme = {
  layout: {
    background: { type: 'solid', color: 'transparent' },
    textColor: '#a1a1aa', // zinc-400
  },
  grid: {
    vertLines: { color: '#27272a' }, // zinc-800
    horzLines: { color: '#27272a' },
  },
  crosshair: {
    mode: 0, // Normal
    vertLine: { color: '#ff444f', width: 1, style: 2 },
    horzLine: { color: '#ff444f', width: 1, style: 2 },
  },
  rightPriceScale: {
    borderColor: '#27272a',
  },
  timeScale: {
    borderColor: '#27272a',
    timeVisible: true,
    secondsVisible: false,
  },
};

const candlestickOptions = {
  upColor: '#00B67B',      // brand-green
  downColor: '#ff444f',    // vermelho Deriv
  borderUpColor: '#00B67B',
  borderDownColor: '#ff444f',
  wickUpColor: '#00B67B',
  wickDownColor: '#ff444f',
};
```

### 5.2 Tema Light Mode

```typescript
const derivLightTheme = {
  layout: {
    background: { type: 'solid', color: 'transparent' },
    textColor: '#52525b', // zinc-600
  },
  grid: {
    vertLines: { color: '#e4e4e7' }, // zinc-200
    horzLines: { color: '#e4e4e7' },
  },
  // ... resto similar
};
```

---

## 6. Dados Mock para Demonstração

### 6.1 Estrutura de Dados

```typescript
interface CandlestickData {
  time: string; // formato 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
}
```

### 6.2 Geração de Dados Mock

Dados simulados de BTC/USD para demonstração inicial, com ~100 candles diários.

---

## 7. Integração com Sistema Existente

### 7.1 Modificações no MainArea.tsx

```
ANTES:
<main>
  <BackgroundGradient />
  <AccountHeader />
  <ContentArea />
  <ChatInput />
</main>

DEPOIS:
<main>
  <BackgroundGradient />
  <ChartLayer /> ← NOVO (z-5, conditional)
  <AccountHeader />
  <ChartToggle /> ← NOVO (dentro do content area)
  <ContentArea />
  <ChatInput />
</main>
```

### 7.2 Estado do Chart

Opção recomendada: **useState local no MainArea** (simplicidade)

Alternativa futura: Adicionar ao ChatContext para controle via Langflow

---

## 8. Checklist de Implementação

### Fase 1: Preparação
- [ ] Documentar z-index atual (FEITO neste documento)
- [ ] Ajustar z-index do Sidebar para z-40
- [ ] Ajustar z-index do ExecutionsSidebar para z-40
- [ ] Verificar que UI continua funcionando

### Fase 2: Instalação
- [ ] Executar `npm install lightweight-charts`
- [ ] Verificar build: `npm run build`
- [ ] Verificar types: `npm run typecheck`

### Fase 3: Implementação
- [ ] Criar ChartLayer.tsx
- [ ] Criar ChartToggle.tsx
- [ ] Integrar no MainArea.tsx
- [ ] Adicionar dados mock
- [ ] Testar toggle on/off

### Fase 4: Refinamento
- [ ] Ajustar cores para tema Deriv
- [ ] Testar responsividade
- [ ] Testar dark/light mode
- [ ] Documentar uso

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Conflito de z-index | Baixa | Médio | Testar cada ajuste isoladamente |
| Performance com muitos candles | Baixa | Baixo | Lightweight Charts é otimizado |
| Incompatibilidade TypeScript | Muito Baixa | Alto | Types incluídos na lib |
| Quebra de layout responsivo | Média | Médio | Testar em múltiplos breakpoints |

---

## 10. Conclusão

O plano está bem estruturado e viável. A biblioteca TradingView Lightweight Charts é 100% compatível com o stack atual. Os ajustes de z-index são mínimos (apenas 2 componentes). A implementação pode ser feita de forma incremental e segura.

**Tempo estimado de implementação**: 2-3 horas para versão funcional básica.
