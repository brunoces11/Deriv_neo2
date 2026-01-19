# RESUMO LÓGICO - DERIV NEO SIMULATOR

## O QUE É ESTE PROJETO

Simulador de plataforma de trading AI-first. O usuário conversa com um assistente e a interface se adapta automaticamente, gerando cards dinâmicos baseados nas intenções detectadas. Não há execução real de ordens - é um protótipo demonstrativo.

**Conceito central:** Chat + Módulos Dinâmicos. O usuário descreve o que quer, a IA responde com texto E instruções de UI que geram cards na tela.

---

## STACK RESUMIDA

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Estilo | TailwindCSS |
| Banco | Supabase (PostgreSQL) |
| Ícones | Lucide React |

---

## ESTRUTURA DO PROJETO

```
src/
├── types/          → Definições TypeScript
├── store/          → Estado global (Context API)
├── services/       → Supabase + Mock da IA
├── components/
│   ├── layout/     → Sidebar, MainArea, Header
│   ├── chat/       → Input e Mensagens
│   └── cards/      → 4 tipos de cards dinâmicos
└── assets/         → Logos SVG
```

---

## COMO O ESTADO FUNCIONA

### ThemeContext (Tema)
- Guarda se é `dark` ou `light`
- Salva no localStorage
- Aplica classe no HTML root

### ChatContext (Estado Principal)
Usa `useReducer` para gerenciar:
- Sessão atual
- Lista de sessões
- Mensagens do chat
- Cards ativos/arquivados/favoritos
- Estados de loading/typing

**Principais ações:**
- Criar/carregar/deletar sessão
- Adicionar mensagem
- Adicionar/arquivar/favoritar/esconder card
- Resetar chat

---

## TIPOS DE DADOS PRINCIPAIS

### Mensagem
```typescript
{ id, role: 'user'|'assistant', content, timestamp }
```

### Card
```typescript
{ id, type, status, isFavorite, createdAt, payload }
```

**4 tipos de card:**
1. `intent-summary` - Resume a intenção do usuário
2. `action-ticket` - Ticket de operação (buy/sell/swap)
3. `bot` - Trading bot configurado
4. `portfolio-snapshot` - Visão do portfólio

### Sessão
```typescript
{ id, title, created_at, updated_at, is_favorite, is_archived }
```

---

## FLUXO DE MENSAGEM

```
1. Usuário digita e envia
2. Se não tem sessão → cria uma nova
3. Salva mensagem do usuário
4. Chama simulação da IA (mock)
5. IA retorna: texto + eventos de UI
6. Salva resposta da IA
7. Para cada evento UI → cria card correspondente
8. Tudo persiste no Supabase
```

---

## SIMULAÇÃO DA IA (Mock)

O arquivo `mockSimulation.ts` simula respostas do LangFlow.

**Como funciona:**
- Recebe mensagem do usuário
- Procura keywords (buy, sell, portfolio, bot, etc.)
- Retorna resposta pré-definida + eventos de UI
- Delay artificial de 800-1500ms

**Cenários implementados:**
| Keyword | Ação |
|---------|------|
| buy, comprar | Gera IntentSummary + ActionTicket |
| sell, vender | Gera IntentSummary + ActionTicket |
| portfolio, saldo | Gera PortfolioSnapshot |
| bot, automate | Gera BotCard |
| swap, trocar | Gera IntentSummary + ActionTicket |
| help, ajuda | Só texto, sem cards |

---

## COMPONENTES PRINCIPAIS

### Sidebar (Esquerda)
- Logo clicável (reseta chat)
- Seção "Chats" - sessões ativas
- Seção "Favorites" - sessões e cards favoritos
- Seção "Archived" - itens arquivados
- Cada seção é colapsável

### MainArea (Centro)
- Header com perfil e saldo
- Se não tem mensagens → tela de boas-vindas
- Se tem mensagens → chat + cards ativos
- Input fixo no rodapé

### Cards
Todos usam `CardWrapper` que fornece:
- Menu de contexto (3 pontinhos)
- Ações: favoritar, arquivar
- Estilização por cor de destaque

---

## BANCO DE DADOS

3 tabelas no Supabase:

**chat_sessions**
- id, title, created_at, updated_at
- is_favorite, is_archived, user_id

**chat_messages**
- id, session_id, role, content, created_at

**chat_cards**
- id, session_id, type, status, is_favorite, payload

Relacionamentos: mensagens e cards pertencem a uma sessão (CASCADE delete).

---

## SISTEMA DE TEMAS

- Dark mode é o padrão
- Toggle no dropdown do perfil
- Classe aplicada no `<html>`: `dark` ou `light`
- Componentes usam condicionais para cores

---

## O QUE ESTÁ PRONTO

✅ Chat funcional com histórico
✅ Sessões persistentes (criar, renomear, deletar)
✅ 4 tipos de cards dinâmicos
✅ Favoritar/arquivar sessões e cards
✅ Tema dark/light
✅ Simulação de respostas da IA
✅ Persistência no Supabase

---

## O QUE FALTA (Contexto do Projeto)

❌ Integração real com LangFlow
❌ Autenticação de usuário
❌ Agentes especializados (trader, risco, bots, etc.)
❌ Modo manual com @agent
❌ Sidebar direita para execuções
❌ Mais tipos de cards (RiskAlert, Education, etc.)
❌ Ações nos cards (confirmar ticket, pausar bot)

---

## PADRÕES DE CÓDIGO USADOS

1. **Context + useReducer** para estado global
2. **useCallback** para funções memoizadas
3. **useMemo** para valores derivados
4. **useRef** para referências DOM
5. **Click outside** pattern para fechar dropdowns
6. **Dispatch otimista** + persistência async

---

## CORES DA MARCA

- Vermelho Deriv: `#ff444f`
- Verde (brand-green): `#00B67B`
- Cards usam: red, amber, cyan, rose

---

## RESUMO PARA LLMs

Este é um simulador de trading conversacional. O usuário fala com um chat, a IA (mockada) interpreta e retorna texto + instruções de UI. As instruções geram cards dinâmicos na tela. Tudo persiste no Supabase. O frontend é React/TypeScript com TailwindCSS. Estado gerenciado via Context API com useReducer. Tema dark/light com persistência local. Preparado para integração futura com LangFlow real e autenticação.

**Para adicionar funcionalidades:**
1. Novos tipos de card → adicionar em `types/index.ts` + criar componente
2. Novos cenários de IA → adicionar em `mockSimulation.ts`
3. Novas ações → adicionar no reducer do ChatContext
4. Novos componentes → seguir padrão de tema condicional


---

## DETALHES ADICIONAIS

### Como os Cards São Gerados

Quando a IA responde, ela retorna um objeto com dois campos:
- `chat_message`: texto que aparece no chat
- `ui_events`: array de instruções para a UI

Cada evento de UI tem:
- `type`: ação a executar (ADD_CARD, ARCHIVE_CARD, etc.)
- `cardType`: tipo do card a criar
- `cardId`: identificador único
- `payload`: dados específicos do card

O frontend processa cada evento sequencialmente, com delay de 300ms entre eles para criar efeito visual de "cards aparecendo".

### Ciclo de Vida de uma Sessão

1. **Criação**: primeira mensagem do usuário cria sessão automaticamente
2. **Título**: primeiros 50 caracteres da primeira mensagem
3. **Atualização**: cada nova mensagem/card atualiza `updated_at`
4. **Organização**: pode ser favoritada ou arquivada
5. **Exclusão**: remove sessão + todas mensagens e cards (CASCADE)

### Ciclo de Vida de um Card

1. **Criação**: evento ADD_CARD da IA
2. **Status inicial**: sempre `active`
3. **Favoritar**: marca `isFavorite = true`, aparece em Favorites
4. **Arquivar**: muda status para `archived`, sai da área principal
5. **Esconder**: muda status para `hidden`, some de todas as listas

### Responsividade

- Sidebar: largura fixa de 288px (w-72)
- MainArea: flex-1 (ocupa resto)
- Cards: grid de 1 coluna em mobile, 2 colunas em sm+
- Input: max-height de 150px com auto-resize

### Animações Implementadas

| Classe | Uso | Efeito |
|--------|-----|--------|
| animate-slide-up | Mensagens | Sobe de baixo com fade |
| animate-scale-in | Cards | Escala de 98% para 100% |
| animate-fade-in | Typing | Fade simples |
| animate-pulse | Indicadores | Pulso contínuo |
| animate-spin | Loaders | Rotação contínua |

### Validações Existentes

- Input vazio não envia mensagem
- Não permite enviar enquanto `isTyping = true`
- Renomear sessão: título não pode ser vazio
- Deletar sessão: requer confirmação do usuário
- Supabase: valida role (user/assistant), type e status dos cards

### Tratamento de Erros

- Se falha ao enviar mensagem: mostra mensagem de erro no chat
- Se falha operação Supabase: log no console, retorna false
- Se falta variáveis de ambiente: throw Error no startup

---

## GLOSSÁRIO RÁPIDO

| Termo | Significado |
|-------|-------------|
| Session | Conversa completa (thread) |
| Message | Uma mensagem no chat |
| Card | Módulo visual dinâmico |
| Payload | Dados específicos de cada card |
| UI Event | Instrução da IA para a interface |
| Dispatch | Enviar ação para o reducer |
| Provider | Componente que fornece contexto |
| Hook | Função que acessa contexto/estado |

---

## ARQUIVOS-CHAVE PARA MODIFICAR

| Objetivo | Arquivo |
|----------|---------|
| Adicionar tipo de card | `src/types/index.ts` |
| Criar componente de card | `src/components/cards/` |
| Novo cenário de IA | `src/services/mockSimulation.ts` |
| Nova ação de estado | `src/store/ChatContext.tsx` |
| Mudar cores/tema | `tailwind.config.js` + `src/index.css` |
| Alterar schema DB | `supabase/migrations/` |

---

*Documento de referência rápida - versão 1.0*
