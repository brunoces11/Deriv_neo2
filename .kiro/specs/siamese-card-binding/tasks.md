# Tasks - Siamese Card Binding

## Status: NÃO INICIADO

---

## GRUPO A: Infraestrutura (Pré-requisito)

### Fase 1: InlineCard - Não Renderizar Quando Deletado (CRÍTICA)

O InlineCard já consulta o estado real e usa o tipo transformado. Falta apenas a lógica de não renderizar quando deletado.

- [x] 1.1 Modificar `InlineCard` em `ChatMessages.tsx` (linha ~265):
  - Após `const existingCard = getCardById(panelCardId);`
  - Adicionar verificação: `if (hasAddedToPanelRef.current && !existingCard) return null`
  - Isso faz o placeholder "desaparecer" quando o card é deletado

**Código atual (linha ~260-270 em ChatMessages.tsx):**
```typescript
// Try to get the card from centralized state (panel card)
const panelCardId = `panel-${cardId}`;
const existingCard = getCardById(panelCardId);

// Use existing card data if available, otherwise create mock
const card: BaseCard = existingCard || createMockCard(inline.cardType, cardId);
```

**Código proposto:**
```typescript
// Try to get the card from centralized state (panel card)
const panelCardId = `panel-${cardId}`;
const existingCard = getCardById(panelCardId);

// Se já foi adicionado ao painel mas não existe mais, foi deletado
if (hasAddedToPanelRef.current && !existingCard) {
  return null; // Card deletado - não renderiza nada
}

// Use existing card data if available, otherwise create mock
const card: BaseCard = existingCard || createMockCard(inline.cardType, cardId);
```

- [x] 1.2 Testar: Deletar card via BotCardCreator → placeholder não renderiza nada

**Por que primeiro?** Sem esta mudança, nenhuma deleção funciona visualmente no inline.

---

## GRUPO B: Cards Creator (Discard)

Todos os cards "creator" precisam usar `deleteCardWithTwin` no Discard.

### Fase 2: ActionsCardCreator - Corrigir Discard

- [x] 2.1 Modificar `ActionsCardCreator.tsx` linha 24:
```typescript
// ANTES:
const { transformCard, hideCard } = useChat();
// DEPOIS:
const { transformCard, deleteCardWithTwin } = useChat();
```

- [x] 2.2 Modificar `handleDiscard` (linha 53-56):
```typescript
// ANTES:
const handleDiscard = () => {
  console.log('[ActionsCardCreator] Discard action creation:', { actionName });
  hideCard(card.id);
};
// DEPOIS:
const handleDiscard = () => {
  console.log('[ActionsCardCreator] Discard action (deleting twins):', { actionName, cardId: card.id });
  deleteCardWithTwin(card.id);
};
```

### Fase 3: CreateTradeCard - Adicionar Discard

- [x] 3.1 Modificar `CreateTradeCard.tsx` linha 17:
```typescript
// ANTES:
const { transformCard } = useChat();
// DEPOIS:
const { transformCard, deleteCardWithTwin } = useChat();
```

- [x] 3.2 Adicionar import do ícone Trash2 no topo:
```typescript
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Minus, Plus, Trash2 } from 'lucide-react';
```

- [x] 3.3 Adicionar função `handleDiscard` (após handleLowerClick, ~linha 60):
```typescript
const handleDiscard = () => {
  console.log('[CreateTradeCard] Discard trade (deleting twins):', { cardId: card.id });
  deleteCardWithTwin(card.id);
};
```

- [x] 3.4 Adicionar botão "Discard" no JSX (antes dos botões Higher/Lower, ~linha 130):
```typescript
{/* Discard Button */}
<button
  onClick={handleDiscard}
  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors mb-2 ${
    theme === 'dark'
      ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`}
>
  <Trash2 className="w-3.5 h-3.5" />
  <span className="font-medium text-xs">Discard</span>
</button>
```

- [x] 3.5 Testar: Discard em ActionsCardCreator e CreateTradeCard remove ambos os gêmeos

**Nota:** BotCardCreator já usa `deleteCardWithTwin` corretamente.

---

## GRUPO C: Cards Deployed (Delete no Menu)

Todos os cards "deployed" precisam implementar delete real no menu 3 pontinhos.

### Fase 4: Implementar Delete nos Cards Deployed

#### 4.1 BotCard.tsx
- [x] 4.1.1 Modificar linha 26:
```typescript
// ANTES:
const { favoriteCard, unfavoriteCard } = useChat();
// DEPOIS:
const { favoriteCard, unfavoriteCard, deleteCardWithTwin } = useChat();
```

- [x] 4.1.2 Modificar `handleDelete` (linha 78-81):
```typescript
// ANTES:
const handleDelete = () => {
  console.log('[BotCard] Delete bot:', { botId, name });
  setIsDropdownOpen(false);
};
// DEPOIS:
const handleDelete = () => {
  console.log('[BotCard] Delete bot (deleting twins):', { botId, name, cardId: card.id });
  deleteCardWithTwin(card.id);
  setIsDropdownOpen(false);
};
```

#### 4.2 ActionsCard.tsx
- [x] 4.2.1 Modificar linha 24:
```typescript
// ANTES:
const { favoriteCard, unfavoriteCard } = useChat();
// DEPOIS:
const { favoriteCard, unfavoriteCard, deleteCardWithTwin } = useChat();
```

- [x] 4.2.2 Modificar `handleDelete` (linha 80-83):
```typescript
// ANTES:
const handleDelete = () => {
  console.log('[ActionsCard] Delete action:', { actionId, name });
  setIsDropdownOpen(false);
};
// DEPOIS:
const handleDelete = () => {
  console.log('[ActionsCard] Delete action (deleting twins):', { actionId, name, cardId: card.id });
  deleteCardWithTwin(card.id);
  setIsDropdownOpen(false);
};
```

#### 4.3 TradeCard.tsx
- [x] 4.3.1 Modificar linha 24:
```typescript
// ANTES:
const { favoriteCard, unfavoriteCard } = useChat();
// DEPOIS:
const { favoriteCard, unfavoriteCard, deleteCardWithTwin } = useChat();
```

- [x] 4.3.2 Modificar `handleDelete` (linha 77-80):
```typescript
// ANTES:
const handleDelete = () => {
  console.log('[TradeCard] Delete trade:', { tradeId });
  setIsDropdownOpen(false);
};
// DEPOIS:
const handleDelete = () => {
  console.log('[TradeCard] Delete trade (deleting twins):', { tradeId, cardId: card.id });
  deleteCardWithTwin(card.id);
  setIsDropdownOpen(false);
};
```

- [x] 4.4 Testar: Delete no menu 3 pontinhos remove card do inline E do painel

---

## GRUPO D: Persistência

### Fase 5: Persistência de Transformação no Supabase

#### 5.0 Verificar Schema (PRÉ-REQUISITO)
- [x] 5.0.1 Verificar se tabela `chat_executions` aceita campos `type` e `payload` para UPDATE
  - Se não aceitar, criar migration ou ajustar abordagem

#### 5.1 Modificar supabase.ts
- [x] 5.1.1 Atualizar `updateSessionExecution` (linha ~340):

**Código atual:**
```typescript
export async function updateSessionExecution(
  executionId: string,
  updates: Partial<Pick<BaseCard, 'status' | 'isFavorite'>>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }
  if (updates.isFavorite !== undefined) {
    updateData.is_favorite = updates.isFavorite;
  }
  // ...
}
```

**Código proposto:**
```typescript
export async function updateSessionExecution(
  executionId: string,
  updates: Partial<Pick<BaseCard, 'status' | 'isFavorite' | 'type' | 'payload'>>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.payload !== undefined) updateData.payload = updates.payload;
  // ...
}
```

#### 5.2 Modificar ChatContext.tsx
- [x] 5.2.1 Atualizar `transformCard` callback (linha ~430):

**Código atual:**
```typescript
const transformCard = useCallback((cardId: string, newType: CardType, newPayload: Record<string, unknown>) => {
  dispatch({ 
    type: 'TRANSFORM_CARD', 
    payload: { cardId, newType, newPayload } 
  });
  // Note: Supabase persistence for card type/payload transformation 
  // would require schema changes. For now, transformation is UI-only.
}, []);
```

**Código proposto:**
```typescript
const transformCard = useCallback((cardId: string, newType: CardType, newPayload: Record<string, unknown>) => {
  dispatch({ 
    type: 'TRANSFORM_CARD', 
    payload: { cardId, newType, newPayload } 
  });
  
  // Persistir transformação no Supabase
  const panelId = cardId.startsWith('panel-') ? cardId : `panel-${cardId}`;
  supabaseService.updateCardInSession(panelId, { 
    type: newType, 
    payload: newPayload 
  });
}, []);
```

- [x] 5.3 Testar: Após refresh, card transformado mantém novo tipo

---

## GRUPO E: Validação Final

### Fase 6: Testes de Integração

#### 6.1 Testes de Deleção
- [ ] 6.1.1 Discard no inline (ActionsCardCreator) → painel removido + placeholder não renderiza
- [ ] 6.1.2 Discard no inline (CreateTradeCard) → painel removido + placeholder não renderiza
- [ ] 6.1.3 Delete no painel (BotCard menu) → inline não renderiza
- [ ] 6.1.4 Delete no painel (ActionsCard menu) → inline não renderiza
- [ ] 6.1.5 Delete no painel (TradeCard menu) → inline não renderiza

#### 6.2 Testes de Transformação
- [ ] 6.2.1 Deploy Bot no inline → AMBOS mudam para BotCard
- [ ] 6.2.2 Deploy Action no inline → AMBOS mudam para ActionsCard
- [ ] 6.2.3 Higher/Lower no inline → AMBOS mudam para TradeCard

#### 6.3 Testes de Persistência
- [ ] 6.3.1 Refresh após deploy → card mantém tipo transformado
- [ ] 6.3.2 Refresh após delete → card não reaparece

---

## Resumo de Arquivos

| Arquivo | Grupo | Fase | Ação |
|---------|-------|------|------|
| `ChatMessages.tsx` | A | 1 | Adicionar null return quando deletado |
| `ActionsCardCreator.tsx` | B | 2 | Trocar hideCard → deleteCardWithTwin |
| `CreateTradeCard.tsx` | B | 3 | Adicionar botão Discard |
| `BotCard.tsx` | C | 4 | Implementar handleDelete real |
| `ActionsCard.tsx` | C | 4 | Implementar handleDelete real |
| `TradeCard.tsx` | C | 4 | Implementar handleDelete real |
| `supabase.ts` | D | 5 | Aceitar type/payload no update |
| `ChatContext.tsx` | D | 5 | Persistir transformação |

---

## Diagrama de Dependências

```
GRUPO A (Infraestrutura)
    │
    ├── Fase 1: InlineCard null return ← CRÍTICO
    │
    ▼
┌───────────────────────────────────────────────────┐
│  GRUPO B + C (Podem ser paralelos)                │
│                                                   │
│  B: Cards Creator          C: Cards Deployed     │
│  ├── Fase 2: ActionsCardCreator                  │
│  │            ├── Fase 4.1: BotCard              │
│  └── Fase 3: CreateTradeCard                     │
│               ├── Fase 4.2: ActionsCard          │
│               └── Fase 4.3: TradeCard            │
└───────────────────────────────────────────────────┘
    │
    ▼
GRUPO D (Persistência)
    │
    ├── Fase 5.0: Verificar schema
    ├── Fase 5.1: supabase.ts
    └── Fase 5.2: ChatContext.tsx
    │
    ▼
GRUPO E (Validação)
    │
    └── Fase 6: Testes de integração
```

---

## Critérios de Sucesso

### Deleção (Discard/Delete)
- ✅ Clicar "Discard" no inline → AMBOS são removidos + placeholder não renderiza
- ✅ Clicar "Delete" no painel → AMBOS são removidos + placeholder não renderiza
- ✅ Card e placeholder não reaparecem após refresh

### Transformação (Deploy)
- ✅ Clicar "Deploy Bot" → AMBOS mudam para BotCard
- ✅ Clicar "Deploy Action" → AMBOS mudam para ActionsCard
- ✅ Clicar "Higher/Lower" → AMBOS mudam para TradeCard

### Persistência
- ✅ Após refresh, cards transformados mantêm novo tipo
- ✅ Após refresh, cards deletados não reaparecem

---

## Notas Importantes

1. **Fase 1 é bloqueante** - sem ela, nenhuma deleção funciona visualmente
2. **Grupos B e C são independentes** - podem ser executados em paralelo
3. **Fase 5.0 é crítica** - verificar schema antes de implementar persistência
4. **Não quebrar**: Comportamento existente de favoritos/arquivados
