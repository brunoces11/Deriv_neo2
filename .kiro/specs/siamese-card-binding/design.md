# Design - Siamese Card Binding

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ChatContext (Fonte Única de Verdade)          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  activeCards: BaseCard[]                                          │  │
│  │                                                                   │  │
│  │  Exemplo de par de gêmeos:                                        │  │
│  │  - { id: "panel-msg123-placeholder-0", type: "bot-card", ... }   │  │
│  │                                                                   │  │
│  │  Nota: Apenas o card do painel é armazenado no activeCards.      │  │
│  │  O card inline consulta o estado via getCardById().              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Operações que afetam gêmeos (via baseId matching):                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ transformCard   │  │deleteCardWithTwin│  │ updateCardPayload      │ │
│  │ (já implementado)│  │ (já implementado)│  │ (já implementado)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   InlineCard          │       │   Card no Painel      │
        │   (ChatMessages.tsx)  │       │   (CardsSidebar.tsx)  │
        │                       │       │                       │
        │ 1. Gera cardId        │       │ Renderiza diretamente │
        │ 2. Busca panel-{id}   │       │ do activeCards        │
        │ 3. Usa tipo/payload   │       │                       │
        │    do estado real     │       │                       │
        └───────────────────────┘       └───────────────────────┘
```

## Mudança Principal: InlineCard Consulta Estado Real

### ANTES (problema atual)
```tsx
// ChatMessages.tsx - InlineCard
function InlineCard({ config, cardId, onAddToPanel }: InlineCardProps) {
  // PROBLEMA: Cria mock card em vez de consultar estado real
  const card: BaseCard = existingCard || createMockCard(inline.cardType, cardId);
  
  // PROBLEMA: Usa cardType da config, não do estado transformado
  const CardComponent = cardComponents[inline.cardType];
  // ...
}
```

### DEPOIS (solução)
```tsx
// ChatMessages.tsx - InlineCard
function InlineCard({ config, cardId, onAddToPanel }: InlineCardProps) {
  const { getCardById } = useChat();
  
  // SOLUÇÃO: Busca o card real do estado (panel card)
  const panelCardId = `panel-${cardId}`;
  const existingCard = getCardById(panelCardId);
  
  // Se card foi deletado (não existe no estado), não renderiza
  if (!existingCard && hasBeenAddedToPanel) {
    return null; // Card foi deletado
  }
  
  // Usa o tipo REAL do card (pode ter sido transformado)
  const actualCardType = existingCard?.type || config.inline.cardType;
  const ActualCardComponent = cardComponents[actualCardType as RenderCardType];
  
  // Usa o payload REAL do card
  const card: BaseCard = existingCard || createMockCard(config.inline.cardType, cardId);
  // ...
}
```

---

## Implementação Detalhada

### 1. ChatMessages.tsx - InlineCard (MODIFICAR)

**Objetivo**: Fazer o card inline consultar o estado real e reagir a transformações/deleções.

```typescript
function InlineCard({ config, cardId, onAddToPanel }: InlineCardProps) {
  const { inline, panel } = config;
  const { getCardById, activeCards } = useChat();
  const hasAddedToPanelRef = useRef(false);
  
  // Busca o card real do estado (panel card é a fonte de verdade)
  const panelCardId = `panel-${cardId}`;
  const existingCard = getCardById(panelCardId);
  
  // Se já foi adicionado ao painel mas não existe mais, foi deletado
  if (hasAddedToPanelRef.current && !existingCard) {
    return null; // Card foi deletado - não renderiza nada
  }
  
  // Usa o tipo REAL do card (pode ter sido transformado)
  // Ex: bot-creator → bot-card após Deploy
  const actualCardType = existingCard?.type || inline.cardType;
  const ActualCardComponent = cardComponents[actualCardType as RenderCardType];
  
  if (!ActualCardComponent) {
    console.warn(`[InlineCard] Unknown card type: ${actualCardType}`);
    return null;
  }
  
  // Cria objeto card com dados reais ou mock
  const card: BaseCard = existingCard 
    ? { ...existingCard, id: cardId } // Usa dados reais, mas com ID inline
    : createMockCard(inline.cardType, cardId);
  
  // Adiciona ao painel apenas uma vez
  useEffect(() => {
    if (hasAddedToPanelRef.current) return;
    
    if (panel && panel.panel) {
      hasAddedToPanelRef.current = true;
      const payload = existingCard?.payload || getDefaultPayloadForCard(panel.cardType);
      onAddToPanel(cardId, panel.cardType, panel.panel, payload as Record<string, unknown>);
    }
  }, [cardId, panel, onAddToPanel, existingCard]);
  
  const isExpanded = inline.visualState === 'expanded';
  
  return (
    <div className="my-4 max-w-full" style={{ marginBottom: '22px' }}>
      <ActualCardComponent card={card} defaultExpanded={isExpanded} />
    </div>
  );
}
```

### 2. ActionsCardCreator.tsx (MODIFICAR)

**Objetivo**: Usar `deleteCardWithTwin` em vez de `hideCard` no Discard.

```typescript
// ANTES
const handleDiscard = () => {
  console.log('[ActionsCardCreator] Discard action creation:', { actionName });
  hideCard(card.id); // ❌ Não deleta o gêmeo
};

// DEPOIS
const handleDiscard = () => {
  console.log('[ActionsCardCreator] Discard action (deleting twins):', { actionName, cardId: card.id });
  deleteCardWithTwin(card.id); // ✅ Deleta ambos os gêmeos
};
```

### 3. CardMenuActions.tsx (VERIFICAR)

O componente já recebe `onDelete` como prop. Precisamos garantir que todos os cards passem a função correta.

```typescript
// Já implementado corretamente
const handleDelete = () => {
  onDelete?.(); // Chama a função passada pelo card pai
  setIsDropdownOpen(false);
};
```

### 4. Cards Deployed (BotCard, ActionsCard, TradeCard) - MODIFICAR

**Objetivo**: Passar `onDelete` com `deleteCardWithTwin` para o CardMenuActions.

```typescript
// Exemplo: BotCard.tsx
export function BotCard({ card, defaultExpanded = true }: BotCardProps) {
  const { deleteCardWithTwin } = useChat();
  
  const handleDelete = () => {
    console.log('[BotCard] Delete (deleting twins):', { cardId: card.id });
    deleteCardWithTwin(card.id);
  };
  
  return (
    <CardWrapper card={card} accentColor="cyan">
      {/* ... */}
      <CardMenuActions 
        card={card} 
        isExpanded={isExpanded} 
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onDelete={handleDelete} // ✅ Passa função de delete
      />
      {/* ... */}
    </CardWrapper>
  );
}
```

### 5. CreateTradeCard.tsx (MODIFICAR)

**Objetivo**: Adicionar botão "Discard" e usar `deleteCardWithTwin`.

```typescript
export function CreateTradeCard({ card, defaultExpanded = true }: CreateTradeCardProps) {
  const { transformCard, deleteCardWithTwin } = useChat();
  
  const handleDiscard = () => {
    console.log('[CreateTradeCard] Discard trade (deleting twins):', { cardId: card.id });
    deleteCardWithTwin(card.id);
  };
  
  // No JSX, adicionar botão Discard antes dos botões Higher/Lower
  // ...
}
```

---

## Fluxo de Transformação (Deploy)

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuário clica "Deploy Bot" no BotCardCreator (inline ou painel) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ handleDeploy() chama transformCard(card.id, 'bot-card', payload)│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ChatContext.transformCard() - Reducer TRANSFORM_CARD            │
│                                                                 │
│ 1. Extrai baseId = cardId.replace(/^panel-/, '')               │
│ 2. Mapeia activeCards:                                          │
│    - Se card.baseId === baseId → atualiza tipo e payload       │
│ 3. Retorna novo estado com card transformado                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ React re-renderiza:                                             │
│                                                                 │
│ - CardsSidebar: card no painel agora é BotCard                 │
│ - ChatMessages/InlineCard: consulta getCardById()              │
│   → existingCard.type = 'bot-card'                             │
│   → renderiza BotCard em vez de BotCardCreator                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Deleção (Discard/Delete)

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuário clica "Discard" (inline) ou "Delete" (menu 3 pontinhos) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ handleDiscard/handleDelete() chama deleteCardWithTwin(card.id)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ChatContext.deleteCardWithTwin() - Já implementado              │
│                                                                 │
│ 1. Extrai baseId = cardId.replace(/^panel-/, '')               │
│ 2. Filtra activeCards removendo cards com mesmo baseId         │
│ 3. Chama supabaseService.deleteCardFromSession(panelCard.id)   │
│ 4. Retorna novo estado sem o card                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ React re-renderiza:                                             │
│                                                                 │
│ - CardsSidebar: card removido do painel                        │
│ - ChatMessages/InlineCard: getCardById() retorna undefined     │
│   → hasAddedToPanelRef.current = true (já foi adicionado)      │
│   → existingCard = undefined (foi deletado)                    │
│   → return null (não renderiza nada)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verificação do Código Existente

### ChatContext.tsx - TRANSFORM_CARD (já funciona)
```typescript
case 'TRANSFORM_CARD': {
  const { cardId, newType, newPayload } = action.payload;
  const baseId = cardId.replace(/^panel-/, '');
  const panelId = cardId.startsWith('panel-') ? cardId : `panel-${cardId}`;
  
  return {
    ...state,
    activeCards: state.activeCards.map(card => {
      const cardBaseId = card.id.replace(/^panel-/, '');
      if (cardBaseId === baseId || card.id === panelId) {
        return { ...card, type: newType, payload: newPayload };
      }
      return card;
    }),
    // ... mesmo para archivedCards e favoriteCards
  };
}
```

### ChatContext.tsx - DELETE_CARD_WITH_TWIN (já funciona)
```typescript
case 'DELETE_CARD_WITH_TWIN': {
  const cardId = action.payload;
  const baseId = cardId.replace(/^panel-/, '');
  
  const filterTwins = (cards: BaseCard[]) => 
    cards.filter(card => {
      const cardBaseId = card.id.replace(/^panel-/, '');
      return cardBaseId !== baseId;
    });
  
  return {
    ...state,
    activeCards: filterTwins(state.activeCards),
    archivedCards: filterTwins(state.archivedCards),
    favoriteCards: filterTwins(state.favoriteCards),
  };
}
```

---

## Persistência no Supabase

### Transformação
Atualmente há um comentário no código:
```typescript
// Note: Supabase persistence for card type/payload transformation 
// would require schema changes. For now, transformation is UI-only.
```

**Ação necessária**: Implementar persistência de transformação no Supabase.

```typescript
// Em ChatContext.tsx - transformCard callback
const transformCard = useCallback((cardId: string, newType: CardType, newPayload: Record<string, unknown>) => {
  dispatch({ 
    type: 'TRANSFORM_CARD', 
    payload: { cardId, newType, newPayload } 
  });
  
  // Persistir no Supabase
  const panelId = cardId.startsWith('panel-') ? cardId : `panel-${cardId}`;
  supabaseService.updateCardInSession(panelId, { 
    type: newType, 
    payload: newPayload 
  });
}, []);
```

### Deleção
Já implementado em `deleteCardWithTwin`:
```typescript
if (panelCard) {
  await supabaseService.deleteCardFromSession(panelCard.id);
}
```

---

## Compatibilidade

- Manter comportamento existente para cards que não têm gêmeos
- Não quebrar funcionalidade de favoritos/arquivados
- Preservar singleton behavior para portfolio cards
