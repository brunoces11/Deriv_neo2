# Dynamic Card Titles - Requirements

## Overview
Permitir que o LLM gere títulos dinâmicos para cada card renderizado no frontend. O título é extraído do placeholder e usado no lugar do título hardcoded atual, com fallback automático.

## User Stories

### US-1: Título Dinâmico via Placeholder
**Como** sistema de renderização de cards  
**Quero** extrair o título do formato `[[PLACEHOLDER]]:"Título Dinâmico"`  
**Para que** cada card exiba um título contextual gerado pelo LLM

#### Acceptance Criteria
- AC-1.1: O parser detecta placeholders conhecidos seguidos de `:"título"`
- AC-1.2: O conteúdo entre aspas duplas é extraído como título
- AC-1.3: Aspas não aparecem no título renderizado
- AC-1.4: Placeholders sem título usam fallback hardcoded

### US-2: Fallback de Título
**Como** card component  
**Quero** usar título hardcoded quando não houver título dinâmico  
**Para que** todo card sempre tenha um título válido

#### Acceptance Criteria
- AC-2.1: Se `payload.title` existe, usar como título
- AC-2.2: Se não existe, usar fallback hardcoded do card
- AC-2.3: Mudança é invisível para o usuário

### US-3: Sincronização Siamesa do Título
**Como** sistema de cards siameses  
**Quero** que o título seja sincronizado entre inline e panel cards  
**Para que** ambos exibam o mesmo título

#### Acceptance Criteria
- AC-3.1: Título é armazenado no `payload.title`
- AC-3.2: `updateCardPayload` sincroniza título entre twins
- AC-3.3: Persistência mantém título após refresh

### US-4: Persistência do Título
**Como** sistema de persistência  
**Quero** que o título seja salvo junto com o card  
**Para que** seja recuperado corretamente após reload

#### Acceptance Criteria
- AC-4.1: Título é parte do `payload` (JSON)
- AC-4.2: Não requer migration de banco
- AC-4.3: Cards existentes continuam funcionando

## Cards Afetados

| Card | Fallback Hardcoded |
|------|-------------------|
| ActionsCard | `payload.name` ou `'Unnamed Action'` |
| ActionsCardCreator | `payload.actionName` ou `'New Action'` |
| BotCard | `payload.name` ou `'Unnamed Bot'` |
| BotCardCreator | `payload.botName` ou `'New Bot Strategy'` |
| PortfolioTableCardComplete | `'Portfolio Complete'` |
| PortfolioSnapshotCard | `'Portfolio'` |
| CreateTradeCard | `payload.asset` ou `'BTC/USD'` |
| TradeCard | `payload.asset` ou `'BTC/USD'` |

## Formato do Placeholder

```
Formato atual:  [[PORTFOLIO_TABLE]]
Novo formato:   [[PORTFOLIO_TABLE]]:"Meu Portfolio Atualizado"
```

- Placeholder conhecido + `:` + `"título entre aspas"`
- Título é opcional (fallback se ausente)
- LLM será instruído a não usar caracteres especiais no título
