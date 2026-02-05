# Dynamic Card Titles - Design

## Architecture Overview

### Fluxo de Dados
```
LLM Response → Placeholder Parser → Card Creation → Payload with Title → Card Render
                     ↓
              Extract title from "..."
                     ↓
              payload.title = extracted || undefined
```

## Technical Design

### 1. Placeholder Parsing (placeholderRules.ts)

**Regex Atualizada:**
```typescript
// Atual
const PLACEHOLDER_REGEX = /\[\[([A-Z_]+)\]\]/g;

// Nova (captura título opcional)
const PLACEHOLDER_WITH_TITLE_REGEX = /\[\[([A-Z_]+)\]\](?::"([^"]*)")?/g;
```

**Lógica de Extração:**
1. Match placeholder conhecido (grupo 1)
2. Verificar se existe `:"`
3. Capturar conteúdo entre aspas (grupo 2)
4. Retornar `{ placeholder, title: grupo2 || undefined }`

### 2. Card Creation (ChatMessages.tsx)

**Função `parseMessageWithPlaceholders`:**
- Atualizar para usar nova regex
- Passar título extraído para `MessagePart`

**Função `getDefaultPayloadForCard`:**
- Adicionar parâmetro `title?: string`
- Incluir `title` no payload retornado

**Função `createMockCard`:**
- Receber título como parâmetro
- Incluir no payload

### 3. Card Components (8 arquivos)

**Padrão de Implementação:**
```typescript
// Antes
const name = payload?.name || 'Unnamed Action';

// Depois
const title = payload?.title || payload?.name || 'Unnamed Action';
```

**Arquivos a Modificar:**
- `ActionsCard.tsx`
- `ActionsCardCreator.tsx`
- `BotCard.tsx`
- `BotCardCreator.tsx`
- `PortfolioTableCardComplete.tsx`
- `PortfolioSnapshotCard.tsx`
- `CreateTradeCard.tsx`
- `TradeCard.tsx`

### 4. Persistência

**Não requer migration** - o campo `payload` já é JSONB no Supabase.

O título é automaticamente:
- Salvo via `addCardToSession` (payload inclui title)
- Recuperado via `getSessionCards` (payload retorna title)
- Sincronizado via `updateCardPayload` (atualiza twins)

## Mapeamento de Títulos por Card

| Card | Lógica de Título |
|------|-----------------|
| ActionsCard | `payload.title \|\| payload.name \|\| 'Unnamed Action'` |
| ActionsCardCreator | `payload.title \|\| payload.actionName \|\| 'New Action'` |
| BotCard | `payload.title \|\| payload.name \|\| 'Unnamed Bot'` |
| BotCardCreator | `payload.title \|\| payload.botName \|\| 'New Bot Strategy'` |
| PortfolioTableCardComplete | `payload.title \|\| 'Portfolio Complete'` |
| PortfolioSnapshotCard | `payload.title \|\| 'Portfolio'` |
| CreateTradeCard | `payload.title \|\| payload.asset \|\| 'BTC/USD'` |
| TradeCard | `payload.title \|\| payload.asset \|\| 'BTC/USD'` |

## Impacto no Mecanismo Siamês

**ZERO IMPACTO** - O mecanismo já está preparado:

1. `updateCardPayload(cardId, updates)` atualiza AMBOS os twins
2. Usa matching por `baseId` (remove prefixo `panel-`)
3. Título sendo parte do `payload`, sincroniza automaticamente

## Exemplo de Fluxo

```
1. LLM retorna: "Aqui está seu portfolio [[PORTFOLIO_TABLE]]:"Minha Carteira Crypto""

2. Parser extrai:
   - placeholder: "[[PORTFOLIO_TABLE]]"
   - title: "Minha Carteira Crypto"

3. Card criado com payload:
   {
     ...defaultPayload,
     title: "Minha Carteira Crypto"
   }

4. PortfolioTableCardComplete renderiza:
   const title = payload.title || 'Portfolio Complete';
   // Exibe: "Minha Carteira Crypto"

5. Card siamês no panel também exibe: "Minha Carteira Crypto"
```

## Considerações

- LLM será instruído a não usar caracteres especiais no título
- Títulos vazios (`[[CARD]]:""`) usam fallback
- Backward compatible com placeholders sem título
