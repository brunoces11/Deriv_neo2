# Tasks - Placeholder-Based Card Rendering System

## Status: IMPLEMENTAÇÃO COMPLETA ✅

Todas as fases (1-7) foram implementadas com sucesso.

---

## Fase 1: Infraestrutura Base

- [x] 1.1 Criar `src/services/placeholderRules.ts` com tipos e registry
- [x] 1.2 Implementar `PLACEHOLDER_RULES` com as 4 regras de nível 1
- [x] 1.3 Implementar helper `getRuleForMode(placeholder, mode)`
- [x] 1.4 Exportar `PLACEHOLDER_REGEX` e `VALID_PLACEHOLDERS`

## Fase 2: Props de Estado Visual (ANTES da renderização)

- [x] 2.1 Adicionar `defaultExpanded?: boolean` em CreateTradeCard.tsx
- [x] 2.2 Adicionar `defaultExpanded?: boolean` em BotCardCreator.tsx
- [x] 2.3 Adicionar `defaultExpanded?: boolean` em ActionsCardCreator.tsx
- [x] 2.4 Adicionar `defaultExpanded?: boolean` em TradeCard.tsx
- [x] 2.5 Adicionar `defaultExpanded?: boolean` em BotCard.tsx
- [x] 2.6 Adicionar `defaultExpanded?: boolean` em ActionsCard.tsx
- [x] 2.7 Usar prop para controlar estado inicial (expandido/compactado)

## Fase 3: Detecção de Placeholders

- [x] 3.1 Criar `findPlaceholdersInPayload()` em langflowApi.ts
- [x] 3.2 Integrar com `callLangflow()` para detectar placeholders
- [x] 3.3 Manter fallback para método antigo `findCardsInPayload()`

## Fase 4: Renderização Inline (MUDANÇA PRINCIPAL)

- [x] 4.1 Criar função `parseMessageWithPlaceholders()` em ChatMessages.tsx
- [x] 4.2 Criar componente `InlineCard` para renderizar card na posição do placeholder
- [x] 4.3 Modificar `MessageBubble` para usar `parseMessageWithPlaceholders()`
- [x] 4.4 Integrar com ViewModeContext para obter modo atual
- [x] 4.5 Aplicar regras de renderização baseado no modo
- [x] 4.6 Importar mapa de componentes de cards (similar ao ActiveCards.tsx)

## Fase 5: Remoção de ActiveCards

- [x] 5.1 Remover `<ActiveCards />` de MainArea.tsx
- [x] 5.2 Manter arquivo ActiveCards.tsx como referência/fallback (não deletar)
- [x] 5.3 Verificar se há outras referências a ActiveCards no código

## Fase 6: Integração com Painel

- [x] 6.1 Modificar ChatMessages para adicionar cards ao painel via processUIEvent
- [x] 6.2 Garantir que cards no painel usem estado compactado (via payload.visualState)
- [x] 6.3 Garantir que cards vão para aba correta (cards/actions/bots via payload.panelTab)

## Fase 7: Regras de Nível 2 - Transformações de Cards

- [x] 7.1 Criar `CARD_TRANSFORMATIONS` em placeholderRules.ts
- [x] 7.2 Implementar função `transformCard(cardId, fromType, trigger, payload)`
- [x] 7.3 Adicionar action `TRANSFORM_CARD` no ChatContext reducer
- [x] 7.4 Modificar CreateTradeCard: onClick "Higher"/"Lower" → transformCard
- [x] 7.5 Modificar BotCardCreator: onClick "Deploy Bot" → transformCard
- [x] 7.6 Modificar ActionsCardCreator: onClick "Deploy Action" → transformCard
- [x] 7.7 Garantir sincronização: transformação afeta inline + painel simultaneamente

---

## Arquivos a Modificar

| Arquivo | Fase | Ação |
|---------|------|------|
| `src/services/placeholderRules.ts` | 1, 7 | CRIAR |
| `src/components/cards/CreateTradeCard.tsx` | 2, 7 | MODIFICAR |
| `src/components/cards/BotCardCreator.tsx` | 2, 7 | MODIFICAR |
| `src/components/cards/ActionsCardCreator.tsx` | 2, 7 | MODIFICAR |
| `src/components/cards/TradeCard.tsx` | 2 | MODIFICAR |
| `src/components/cards/BotCard.tsx` | 2 | MODIFICAR |
| `src/components/cards/ActionsCard.tsx` | 2 | MODIFICAR |
| `src/services/langflowApi.ts` | 3 | REFATORAR |
| `src/components/chat/ChatMessages.tsx` | 4 | MODIFICAR (principal) |
| `src/components/layout/MainArea.tsx` | 5 | MODIFICAR (remover ActiveCards) |
| `src/components/cards/ActiveCards.tsx` | 5 | DESATIVAR (manter arquivo) |
| `src/store/ChatContext.tsx` | 6, 7 | MODIFICAR |

---

## Ordem de Dependências

```
Fase 1 (Infraestrutura)
    ↓
Fase 2 (Props) ← Cards precisam da prop ANTES de serem usados
    ↓
Fase 3 (Detecção)
    ↓
Fase 4 (Renderização Inline) ← Depende de 1, 2, 3
    ↓
Fase 5 (Remoção ActiveCards) ← Só após inline funcionar
    ↓
Fase 6 (Integração Painel)
    ↓
Fase 7 (Transformações) ← Depende de tudo anterior
```

---

## Regras Consolidadas

### Nível 1 - Renderização
- ✅ `[[PORTFOLIO_TABLE]]` → portfolio-table-complete (chat) / portfolio-snapshot (outros)
- ✅ `[[CREATE_TRADE_CARD]]` → create-trade-card
- ✅ `[[CREATE_BOT_CARD]]` → bot-creator
- ✅ `[[CREATE_ACTION_CARD]]` → actions-creator

### Nível 2 - Transformações
- ✅ `create-trade-card` + "Higher"/"Lower" → `trade-card`
- ✅ `bot-creator` + "Deploy Bot" → `bot-card`
- ✅ `actions-creator` + "Deploy Action" → `actions-card`

---

## Notas

- **MUDANÇA PRINCIPAL:** Cards deixam de ser renderizados em área separada (ActiveCards) e passam a ser inline dentro da mensagem
- **ORDEM CRÍTICA:** Props devem ser adicionadas ANTES da renderização inline
- Prioridade: mínimo de mudanças no código existente
- Fallback: manter método antigo funcionando durante transição
- Testes: validar em todos os 4 modos (chat/graph/dash/hub)
