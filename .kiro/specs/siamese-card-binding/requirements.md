# Siamese Card Binding - Sistema de Espelhamento de Cards Gêmeos

## Visão Geral

Sistema para criar e manter um vínculo permanente de espelhamento entre cards "gêmeos siameses" - dois cards que representam a mesma entidade e são criados simultaneamente quando um placeholder é detectado no payload do LangFlow.

## Conceito: Cards Gêmeos Siameses

Quando um placeholder (ex: `[[CREATE_BOT_CARD]]`) é renderizado:
- **Card Inline**: renderizado dentro da mensagem do chat
- **Card Painel**: renderizado no sidebar correspondente (bots, actions, positions, cards)

Esses dois cards são **gêmeos siameses** - representam a mesma entidade e devem estar **sempre sincronizados**. Nunca se separam.

## Análise do Código Atual (Validada)

### ✅ O que JÁ FUNCIONA

| Item | Arquivo | Status |
|------|---------|--------|
| `TRANSFORM_CARD` no reducer | `ChatContext.tsx` | ✅ Já faz matching por `baseId` |
| `DELETE_CARD_WITH_TWIN` no reducer | `ChatContext.tsx` | ✅ Já remove ambos os gêmeos |
| `deleteCardWithTwin` callback | `ChatContext.tsx` | ✅ Já chama Supabase delete |
| `getCardById` com baseId matching | `ChatContext.tsx` | ✅ Já busca por ID derivado |
| `BotCardCreator` handleDiscard | `BotCardCreator.tsx` | ✅ Já usa `deleteCardWithTwin` |
| `BotCardCreator` handleDelete | `BotCardCreator.tsx` | ✅ Já usa `deleteCardWithTwin` |
| `deleteCardFromSession` | `supabase.ts` | ✅ Já implementado |
| InlineCard busca existingCard | `ChatMessages.tsx` | ✅ Já usa `getCardById(panelCardId)` |
| InlineCard usa actualCardType | `ChatMessages.tsx` | ✅ Já usa tipo do card real |

### ❌ Problemas Identificados (Validados no Código)

| # | Problema | Arquivo | Evidência |
|---|----------|---------|-----------|
| 1 | InlineCard não retorna null quando deletado | `ChatMessages.tsx` | Não há lógica `if (hasAddedToPanelRef.current && !existingCard) return null` |
| 2 | ActionsCardCreator usa `hideCard()` | `ActionsCardCreator.tsx` | Linha 55: `hideCard(card.id)` em vez de `deleteCardWithTwin` |
| 3 | BotCard handleDelete só faz console.log | `BotCard.tsx` | Não importa nem usa `deleteCardWithTwin` |
| 4 | ActionsCard handleDelete só faz console.log | `ActionsCard.tsx` | Não importa nem usa `deleteCardWithTwin` |
| 5 | TradeCard handleDelete só faz console.log | `TradeCard.tsx` | Não importa nem usa `deleteCardWithTwin` |
| 6 | CreateTradeCard sem botão Discard | `CreateTradeCard.tsx` | Não tem botão Discard |
| 7 | `updateCardInSession` não aceita type/payload | `supabase.ts` | Aceita apenas `status` e `isFavorite` |

## Modelo Proposto

### Princípio Central
**Fonte Única de Verdade**: O estado `activeCards` no ChatContext é a fonte de verdade para TODOS os cards (inline e painel).

### Identificação de Gêmeos
Convenção de IDs já existente:
- Card Inline: `{messageId}-placeholder-{index}`
- Card Painel: `panel-{messageId}-placeholder-{index}`

A relação é estabelecida pelo prefixo `panel-`. O `baseId` (sem prefixo) identifica o par de gêmeos.

### Comportamento de Deleção
Quando um card é deletado (via Discard ou Delete):
1. **Card no painel**: removido do `activeCards` e deletado do Supabase
2. **Card inline**: `InlineCard` retorna `null` (não renderiza nada)
3. **Placeholder**: não é renderizado (o espaço onde estava o card simplesmente desaparece)
4. **Permanente**: card e placeholder nunca mais são exibidos, mesmo após refresh

---

## User Stories

### US-1: Sincronização de Transformação (Deploy)
Como usuário, quero que quando eu clicar em "Deploy" em qualquer card (inline ou painel), AMBOS os cards gêmeos sejam transformados simultaneamente.

**Critérios de Aceite:**
- 1.1 Clicar "Deploy Bot" no card inline → transforma AMBOS (inline + painel) de `bot-creator` para `bot-card`
- 1.2 Clicar "Deploy Bot" no card painel → transforma AMBOS (inline + painel) de `bot-creator` para `bot-card`
- 1.3 Mesma lógica para "Deploy Action" (`actions-creator` → `actions-card`)
- 1.4 Mesma lógica para "Higher"/"Lower" (`create-trade-card` → `trade-card`)
- 1.5 Transformação é persistida no Supabase

### US-2: Sincronização de Deleção
Como usuário, quero que quando eu deletar um card (via "Discard" ou "Delete"), AMBOS os cards gêmeos sejam removidos permanentemente e o placeholder não seja mais renderizado.

**Critérios de Aceite:**
- 2.1 Clicar "Discard" no card inline → remove AMBOS (inline + painel) + deleta do Supabase
- 2.2 Clicar "Delete" no menu 3 pontinhos do painel → remove AMBOS (inline + painel) + deleta do Supabase
- 2.3 Card é removido permanentemente (não apenas escondido)
- 2.4 Após deleção, o placeholder no chat não renderiza nada (espaço vazio)
- 2.5 Após refresh, card e placeholder continuam não aparecendo

### US-3: Sincronização de Configurações
Como usuário, quero que qualquer alteração de configuração em um card seja refletida no seu gêmeo.

**Critérios de Aceite:**
- 3.1 Alterar parâmetros no card inline → reflete no card painel
- 3.2 Alterar parâmetros no card painel → reflete no card inline
- 3.3 Alterações são persistidas no Supabase

### US-4: Card Inline Consulta Estado Real
Como sistema, quero que o card inline consulte o estado real do `activeCards` e não renderize quando deletado.

**Critérios de Aceite:**
- 4.1 Card inline busca dados do `activeCards` pelo ID (ou `panel-{id}`) ✅ JÁ IMPLEMENTADO
- 4.2 Se card foi transformado, inline renderiza o novo tipo ✅ JÁ IMPLEMENTADO
- 4.3 Se card foi deletado (hasAddedToPanelRef.current && !existingCard), inline retorna null ❌ FALTA
- 4.4 Se card não existe no estado e nunca foi adicionado, cria mock e adiciona ao estado ✅ JÁ IMPLEMENTADO

### US-5: Persistência de Estado
Como usuário, quero que o estado dos cards (transformado, deletado, configurações) seja mantido após refresh ou ao voltar à sessão.

**Critérios de Aceite:**
- 5.1 Cards transformados mantêm novo tipo após refresh
- 5.2 Cards deletados não reaparecem após refresh
- 5.3 Configurações alteradas são preservadas

---

## Escopo de Cards Afetados

Todos os cards que possuem gêmeos siameses:

| Card Creator | Card Deployed | Trigger |
|--------------|---------------|---------|
| `bot-creator` | `bot-card` | "Deploy Bot" |
| `actions-creator` | `actions-card` | "Deploy Action" |
| `create-trade-card` | `trade-card` | "Higher" / "Lower" |
| `portfolio-table-complete` | (singleton) | N/A |
| `portfolio-snapshot` | (singleton) | N/A |

**Nota**: Portfolio cards são singleton (apenas um no painel), mas ainda seguem a regra de gêmeos para deleção.

---

## Arquivos Impactados

| Arquivo | Ação |
|---------|------|
| `src/store/ChatContext.tsx` | MODIFICAR - Garantir `transformCard` e `deleteCardWithTwin` funcionam para ambos |
| `src/components/chat/ChatMessages.tsx` | MODIFICAR - InlineCard consulta estado real |
| `src/components/cards/BotCardCreator.tsx` | VERIFICAR - Já usa `deleteCardWithTwin` |
| `src/components/cards/ActionsCardCreator.tsx` | MODIFICAR - Usar `deleteCardWithTwin` em vez de `hideCard` |
| `src/components/cards/CreateTradeCard.tsx` | MODIFICAR - Adicionar botão Discard |
| `src/components/cards/CardMenuActions.tsx` | MODIFICAR - Implementar `onDelete` com `deleteCardWithTwin` |
| `src/components/cards/BotCard.tsx` | MODIFICAR - Passar `onDelete` para CardMenuActions |
| `src/components/cards/ActionsCard.tsx` | MODIFICAR - Passar `onDelete` para CardMenuActions |
| `src/components/cards/TradeCard.tsx` | MODIFICAR - Passar `onDelete` para CardMenuActions |
| `src/services/supabase.ts` | VERIFICAR - Função de delete card |

---

## Fluxo de Dados Proposto

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatContext                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  activeCards: BaseCard[]                                 │    │
│  │  - Fonte única de verdade para TODOS os cards           │    │
│  │  - Cards do painel: id = "panel-{baseId}"               │    │
│  │  - Operações afetam ambos os gêmeos via baseId          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ transformCard│      │deleteCardWithTwin│ │updateCardPayload│ │
│  │ (ambos)     │      │ (ambos)     │      │ (ambos)     │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────┐
│   Card Inline       │                 │   Card Painel       │
│   (ChatMessages)    │                 │   (CardsSidebar)    │
│                     │                 │                     │
│ - Consulta activeCards               │ - Renderiza de activeCards
│ - getCardById(baseId)│                │ - ID: panel-{baseId}│
│ - Renderiza tipo real│                │                     │
└─────────────────────┘                 └─────────────────────┘
```

---

## Estrutura TypeScript

```typescript
// Identificador único do par de gêmeos
type TwinBaseId = string; // Ex: "msg123-placeholder-0"

// Funções de matching de gêmeos
function getBaseId(cardId: string): TwinBaseId {
  return cardId.replace(/^panel-/, '');
}

function getPanelId(baseId: TwinBaseId): string {
  return `panel-${baseId}`;
}

function areTwins(cardId1: string, cardId2: string): boolean {
  return getBaseId(cardId1) === getBaseId(cardId2);
}
```

---

## Notas de Implementação

1. **Não criar novo estado**: Usar o `activeCards` existente como fonte de verdade
2. **Convenção de ID já existe**: Apenas garantir que todas as operações usem `baseId` para matching
3. **Prioridade**: Mínimo de mudanças no código existente
4. **Persistência**: Transformações e deleções devem ser persistidas no Supabase
