# Placeholder-Based Card Rendering System

## Visão Geral

Sistema para renderizar cards dinamicamente baseado em placeholders `[[CARD_NAME]]` detectados nas respostas do LangFlow. Substitui o mecanismo atual de triggers por um sistema mais simples e declarativo.

## Problema Atual

O sistema atual possui duas questões:

**1. Detecção de cards (`langflowApi.ts`):**
- Usa `findCardsInPayload()` que busca nomes de cards diretamente no payload
- Não há controle preciso de onde o card deve aparecer

**2. Renderização separada (`ActiveCards.tsx`):**
- Cards são renderizados em área dedicada "Active Cards" **abaixo** de todas as mensagens
- Não há relação posicional entre a mensagem e o card
- Layout em grid (`sm:grid-cols-2`) separado do fluxo de chat

**Fluxo atual:**
```
MainArea.tsx
  └── ChatMessages (todas as mensagens)
  └── ActiveCards (área separada com grid de cards)
```

## Modelo Proposto

Queremos um sistema onde:
1. O LLM inclui placeholders explícitos na resposta (ex: `[[PORTFOLIO_TABLE]]`)
2. O React detecta esses placeholders **dentro do texto da mensagem**
3. O card é renderizado **inline na posição exata** do placeholder
4. Simultaneamente, uma cópia compactada vai para o painel lateral
5. A área "Active Cards" é **desativada/removida**

**Fluxo proposto:**
```
MainArea.tsx
  └── ChatMessages
        └── MessageBubble
              └── Texto + [[PLACEHOLDER]] → Card Inline (expandido)
  └── (ActiveCards REMOVIDO)
```

## User Stories

### US-1: Detecção de Placeholders
Como sistema, quero detectar placeholders no formato `[[NOME]]` nas respostas do LangFlow, para saber quais cards renderizar.

**Critérios de Aceite:**
- 1.1 Regex `\[\[([A-Z_]+)\]\]` detecta todos os placeholders
- 1.2 Placeholders são case-insensitive na detecção
- 1.3 Múltiplos placeholders na mesma resposta são todos detectados

### US-2: Renderização Dual (Inline + Painel)
Como usuário, quero que cada placeholder renderize cards em dois locais simultaneamente: inline no chat e no painel lateral.

**Critérios de Aceite:**
- 2.1 Card inline aparece na posição exata do placeholder no texto
- 2.2 Card no painel aparece na aba correta (cards/actions/bots)
- 2.3 Card inline usa estado visual expandido
- 2.4 Card no painel usa estado visual compactado

### US-3: Comportamento por Modo
Como usuário, quero que o comportamento dos cards varie conforme o modo atual (chat/graph/dash/hub).

**Critérios de Aceite:**
- 3.1 Sistema lê `currentMode` do ViewModeContext
- 3.2 Regras diferentes são aplicadas por modo conforme mapa de regras
- 3.3 Modos podem ser agrupados quando compartilham mesma configuração

### US-4: Regras Isoladas
Como desenvolvedor, quero que as regras de placeholder→card fiquem em arquivo isolado para fácil manutenção.

**Critérios de Aceite:**
- 4.1 Arquivo `src/services/placeholderRules.ts` contém todas as regras
- 4.2 Regras são tipadas com TypeScript
- 4.3 Fácil adicionar/remover/modificar regras sem tocar em outros arquivos

---

## Regras de Nível 1 - Renderização

### Mapa de Placeholders

```
'[[PORTFOLIO_TABLE]]': {
  chatmode: inline 'portfolio-table-complete' expandido + painel 'cards' 'portfolio-snapshot' compactado,
  graphmode | dashmode | hubmode: inline 'portfolio-snapshot' expandido + painel 'cards' 'portfolio-snapshot' compactado
}

'[[CREATE_TRADE_CARD]]': {
  *: inline 'create-trade-card' expandido + painel 'cards' 'create-trade-card' compactado
}

'[[CREATE_BOT_CARD]]': {
  *: inline 'bot-creator' expandido + painel 'bots' 'bot-creator' compactado
}

'[[CREATE_ACTION_CARD]]': {
  *: inline 'actions-creator' expandido + painel 'actions' 'actions-creator' compactado
}
```

### Legenda
- `*` = todos os modos (chat/graph/dash/hub)
- `inline` = renderiza dentro da mensagem do chat
- `painel` = renderiza na sidebar direita
- `expandido` = card mostra todos os detalhes
- `compactado` = card mostra versão resumida

---

## Regras de Nível 2 - Interações de Botões

Quando o usuário clica em botões de confirmação dentro de cards "creator", o card é **substituído** pelo card "resultado" em **todos os locais** onde está sendo exibido (inline + painel).

### Mapa de Transformações

| Card Creator | Botão Trigger | Transforma em | Comportamento |
|--------------|---------------|---------------|---------------|
| `create-trade-card` | "Higher" ou "Lower" | `trade-card` | Substitui em todos os painéis |
| `bot-creator` | "Deploy Bot" | `bot-card` | Substitui em todos os painéis |
| `actions-creator` | "Deploy Action" | `actions-card` | Substitui em todos os painéis |

### Regras Detalhadas

```
'create-trade-card': {
  onHigher: substituir por 'trade-card' (direction: 'higher') em inline + painel,
  onLower: substituir por 'trade-card' (direction: 'lower') em inline + painel
}

'bot-creator': {
  onDeployBot: substituir por 'bot-card' em inline + painel
}

'actions-creator': {
  onDeployAction: substituir por 'actions-card' em inline + painel
}
```

### Fluxo Visual

```
ANTES (usuário criando):
┌─────────────────────────────┐
│  create-trade-card          │
│  [Higher] [Lower]           │
└─────────────────────────────┘

DEPOIS (usuário clicou "Higher"):
┌─────────────────────────────┐
│  trade-card                 │
│  Direction: HIGHER          │
│  Status: Open               │
└─────────────────────────────┘
```

### Sincronização

A substituição deve ocorrer **simultaneamente** em:
1. Card inline (dentro da mensagem)
2. Card no painel lateral (aba correspondente)

Ambos devem mostrar o mesmo card "resultado" após a ação.

---

## Arquivos Impactados

| Arquivo | Ação |
|---------|------|
| `src/services/placeholderRules.ts` | CRIAR - Registry de regras |
| `src/services/langflowApi.ts` | REFATORAR - Nova lógica de detecção |
| `src/components/chat/ChatMessages.tsx` | MODIFICAR - Renderização inline de cards |
| `src/components/cards/ActiveCards.tsx` | DESATIVAR - Remover do fluxo principal |
| `src/components/layout/MainArea.tsx` | MODIFICAR - Remover `<ActiveCards />` |
| `src/components/cards/TradeCard.tsx` | MODIFICAR - Prop defaultExpanded |
| `src/components/cards/BotCard.tsx` | MODIFICAR - Prop defaultExpanded |
| `src/components/cards/ActionsCard.tsx` | MODIFICAR - Prop defaultExpanded |

## Mudança Arquitetural

**ANTES:**
```
MainArea.tsx
  ├── ChatMessages.tsx (lista de mensagens)
  └── ActiveCards.tsx (área separada com grid de cards)
```

**DEPOIS:**
```
MainArea.tsx
  └── ChatMessages.tsx
        └── MessageBubble
              └── parseMessageWithPlaceholders()
                    ├── Texto normal
                    └── [[PLACEHOLDER]] → <InlineCard /> (expandido)
```

A área "Active Cards" deixa de existir. Cards inline são renderizados diretamente dentro do `MessageBubble` na posição exata do placeholder.

---

## Estrutura TypeScript Proposta

```typescript
type ViewMode = 'chat' | 'graph' | 'dashboard' | 'hub';
type PanelTab = 'cards' | 'actions' | 'bots';
type VisualState = 'expandido' | 'compactado';

interface RenderAction {
  cardType: string;
  location: 'inline' | 'panel';
  panel?: PanelTab;
  visualState: VisualState;
}

interface PlaceholderRule {
  placeholder: string;
  modes: {
    [key: string]: RenderAction[]; // 'chat' | 'graph|dash|hub' | '*'
  };
}
```
