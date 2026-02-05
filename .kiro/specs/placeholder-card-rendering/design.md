# Design - Placeholder-Based Card Rendering System

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   LangFlow      │────▶│  langflowApi.ts  │────▶│  ChatMessages.tsx   │
│   Response      │     │  (detecta [[]])  │     │  (render inline)    │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────────┐
                        │placeholderRules.ts│     │   MessageBubble     │
                        │  (mapa de regras) │     │ parseWithPlaceholders│
                        └──────────────────┘     └─────────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────────┐
                        │  CardsSidebar.tsx │     │   InlineCard        │
                        │ (render no painel)│     │   (expandido)       │
                        └──────────────────┘     └─────────────────────┘
```

## Mudança Principal: Remoção de ActiveCards

**ANTES (modelo atual):**
```tsx
// MainArea.tsx
<div className="flex-1 overflow-y-auto">
  <ChatMessages />      {/* Mensagens de texto */}
  <ActiveCards />       {/* Área separada com grid de cards */}
</div>
```

**DEPOIS (modelo proposto):**
```tsx
// MainArea.tsx
<div className="flex-1 overflow-y-auto">
  <ChatMessages />      {/* Mensagens com cards inline */}
  {/* ActiveCards REMOVIDO */}
</div>

// ChatMessages.tsx > MessageBubble
<div className="message-content">
  {parseMessageWithPlaceholders(message.content).map((part, i) => (
    part.type === 'text' 
      ? <span key={i}>{part.content}</span>
      : <InlineCard key={i} placeholder={part.placeholder} />
  ))}
</div>
```

## Fluxo de Dados

1. **LangFlow retorna resposta** com texto contendo `[[PLACEHOLDER]]`
2. **langflowApi.ts** detecta placeholders via regex
3. **placeholderRules.ts** é consultado para obter regras de renderização
4. **ViewModeContext** fornece o modo atual (chat/graph/dash/hub)
5. **Duas ações simultâneas:**
   - Card inline é renderizado **dentro do MessageBubble** na posição do placeholder
   - Card no painel é adicionado via processUIEvent() (compactado)

---

## Implementação Detalhada

### 1. placeholderRules.ts (CRIAR)

```typescript
import type { CardType } from '../types';

export type ViewMode = 'chat' | 'graph' | 'dashboard' | 'hub';
export type PanelTab = 'cards' | 'actions' | 'bots' | 'positions';
export type VisualState = 'expanded' | 'compacted';

export interface RenderAction {
  cardType: CardType;
  location: 'inline' | 'panel';
  panel?: PanelTab;
  visualState: VisualState;
}

export interface ModeConfig {
  inline: RenderAction;
  panel: RenderAction;
}

export interface PlaceholderRule {
  chatmode: ModeConfig;
  otherModes: ModeConfig; // graph | dash | hub
}

export const PLACEHOLDER_RULES: Record<string, PlaceholderRule> = {
  '[[PORTFOLIO_TABLE]]': {
    chatmode: {
      inline: { cardType: 'portfolio-table-complete', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'portfolio-snapshot', location: 'panel', panel: 'cards', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'portfolio-snapshot', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'portfolio-snapshot', location: 'panel', panel: 'cards', visualState: 'compacted' }
    }
  },
  '[[CREATE_TRADE_CARD]]': {
    chatmode: {
      inline: { cardType: 'create-trade-card', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'create-trade-card', location: 'panel', panel: 'positions', visualState: 'expanded' }
    },
    otherModes: {
      inline: { cardType: 'create-trade-card', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'create-trade-card', location: 'panel', panel: 'positions', visualState: 'expanded' }
    }
  },
  '[[CREATE_BOT_CARD]]': {
    chatmode: {
      inline: { cardType: 'bot-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'bot-creator', location: 'panel', panel: 'bots', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'bot-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'bot-creator', location: 'panel', panel: 'bots', visualState: 'compacted' }
    }
  },
  '[[CREATE_ACTION_CARD]]': {
    chatmode: {
      inline: { cardType: 'actions-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'actions-creator', location: 'panel', panel: 'actions', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'actions-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'actions-creator', location: 'panel', panel: 'actions', visualState: 'compacted' }
    }
  }
};

// Helper para obter config baseado no modo atual
export function getRuleForMode(placeholder: string, mode: ViewMode): ModeConfig | null {
  const rule = PLACEHOLDER_RULES[placeholder];
  if (!rule) return null;
  return mode === 'chat' ? rule.chatmode : rule.otherModes;
}

// Regex para detectar placeholders
export const PLACEHOLDER_REGEX = /\[\[([A-Z_]+)\]\]/g;

// Lista de placeholders válidos
export const VALID_PLACEHOLDERS = Object.keys(PLACEHOLDER_RULES);
```

### 2. langflowApi.ts (REFATORAR)

```typescript
// Nova função para detectar placeholders
function findPlaceholdersInPayload(payload: string): string[] {
  const found: string[] = [];
  let match;
  
  PLACEHOLDER_REGEX.lastIndex = 0;
  while ((match = PLACEHOLDER_REGEX.exec(payload)) !== null) {
    const placeholder = `[[${match[1]}]]`;
    if (VALID_PLACEHOLDERS.includes(placeholder) && !found.includes(placeholder)) {
      found.push(placeholder);
    }
  }
  
  return found;
}
```

### 3. ChatMessages.tsx (MODIFICAR)

**Mudança principal:** Parsear `[[PLACEHOLDER]]` no conteúdo da mensagem e renderizar card inline.

```typescript
// Nova função para parsear mensagem com placeholders
function parseMessageWithPlaceholders(
  content: string, 
  mode: ViewMode
): Array<{ type: 'text'; content: string } | { type: 'card'; placeholder: string; config: ModeConfig }> {
  const parts: Array<...> = [];
  let lastIndex = 0;
  
  PLACEHOLDER_REGEX.lastIndex = 0;
  let match;
  
  while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
    // Texto antes do placeholder
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    
    // Placeholder → Card config
    const placeholder = `[[${match[1]}]]`;
    const config = getRuleForMode(placeholder, mode);
    if (config) {
      parts.push({ type: 'card', placeholder, config });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Texto restante
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }
  
  return parts;
}

// Componente InlineCard
function InlineCard({ config }: { config: ModeConfig }) {
  const { inline } = config;
  const CardComponent = cardComponents[inline.cardType];
  
  if (!CardComponent) return null;
  
  // Card inline sempre expandido
  return (
    <div className="my-4">
      <CardComponent defaultExpanded={true} />
    </div>
  );
}
```

### 4. MainArea.tsx (MODIFICAR)

**Remover ActiveCards do fluxo:**

```tsx
// ANTES
<div className="mx-auto w-full px-4 chat-content-width">
  <ChatMessages />
  <ActiveCards />  {/* REMOVER */}
</div>

// DEPOIS
<div className="mx-auto w-full px-4 chat-content-width">
  <ChatMessages />
  {/* ActiveCards removido - cards agora são inline */}
</div>
```

### 5. Cards (MODIFICAR)

Adicionar prop `defaultExpanded?: boolean` em:
- TradeCard.tsx
- BotCard.tsx  
- ActionsCard.tsx

---

## Regras de Nível 2 - Interações (Estrutura Completa)

### Mapa de Transformações

```typescript
export interface CardTransformation {
  fromCard: CardType;
  toCard: CardType;
  trigger: string;
  payloadTransform?: (creatorPayload: any, action: string) => any;
}

export const CARD_TRANSFORMATIONS: CardTransformation[] = [
  {
    fromCard: 'create-trade-card',
    toCard: 'trade-card',
    trigger: 'onHigher',
    payloadTransform: (payload) => ({
      ...payload,
      direction: 'higher',
      status: 'open',
      tradeId: `TRD-${Date.now()}`
    })
  },
  {
    fromCard: 'create-trade-card',
    toCard: 'trade-card',
    trigger: 'onLower',
    payloadTransform: (payload) => ({
      ...payload,
      direction: 'lower',
      status: 'open',
      tradeId: `TRD-${Date.now()}`
    })
  },
  {
    fromCard: 'bot-creator',
    toCard: 'bot-card',
    trigger: 'onDeployBot',
    payloadTransform: (payload) => ({
      ...payload,
      status: 'active',
      botId: `BOT-${Date.now()}`
    })
  },
  {
    fromCard: 'actions-creator',
    toCard: 'actions-card',
    trigger: 'onDeployAction',
    payloadTransform: (payload) => ({
      ...payload,
      status: 'active',
      actionId: `ACT-${Date.now()}`
    })
  }
];
```

### Função de Transformação

```typescript
// Em placeholderRules.ts ou novo arquivo cardTransformations.ts
export function transformCard(
  cardId: string,
  fromType: CardType,
  trigger: string,
  currentPayload: any
): { newType: CardType; newPayload: any } | null {
  const transformation = CARD_TRANSFORMATIONS.find(
    t => t.fromCard === fromType && t.trigger === trigger
  );
  
  if (!transformation) return null;
  
  return {
    newType: transformation.toCard,
    newPayload: transformation.payloadTransform 
      ? transformation.payloadTransform(currentPayload, trigger)
      : currentPayload
  };
}
```

### Integração com ChatContext

```typescript
// Nova action no ChatContext
| { type: 'TRANSFORM_CARD'; payload: { cardId: string; newType: CardType; newPayload: any } }

// Handler no reducer
case 'TRANSFORM_CARD': {
  return {
    ...state,
    activeCards: state.activeCards.map(card =>
      card.id === action.payload.cardId
        ? { ...card, type: action.payload.newType, payload: action.payload.newPayload }
        : card
    )
  };
}
```

---

## Compatibilidade

- Manter `findCardsInPayload()` funcionando como fallback
- Priorizar detecção de placeholders `[[]]` sobre método antigo
- Não quebrar funcionalidade existente durante transição
