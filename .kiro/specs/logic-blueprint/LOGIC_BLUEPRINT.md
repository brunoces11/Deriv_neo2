# 🗺️ BLUEPRINT LÓGICO COMPLETO - DERIV NEO SIMULATOR

## 📋 ÍNDICE
1. [Stack Tecnológica](#1-stack-tecnológica)
2. [Arquitetura de Arquivos](#2-arquitetura-de-arquivos)
3. [Sistema de Tipos (TypeScript)](#3-sistema-de-tipos-typescript)
4. [Gerenciamento de Estado](#4-gerenciamento-de-estado)
5. [Serviços e Integrações](#5-serviços-e-integrações)
6. [Componentes de Layout](#6-componentes-de-layout)
7. [Sistema de Cards](#7-sistema-de-cards)
8. [Sistema de Chat](#8-sistema-de-chat)
9. [Fluxos de Dados](#9-fluxos-de-dados)
10. [Banco de Dados](#10-banco-de-dados)
11. [Estilização e Temas](#11-estilização-e-temas)
12. [Checklist de Funcionalidades](#12-checklist-de-funcionalidades)

---

## 1. STACK TECNOLÓGICA

### 1.1 Core
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | ^18.3.1 | Framework UI |
| TypeScript | ^5.5.3 | Tipagem estática |
| Vite | ^5.4.2 | Build tool / Dev server |

### 1.2 Estilização
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| TailwindCSS | ^3.4.1 | Utility-first CSS |
| PostCSS | ^8.4.35 | Processador CSS |
| Autoprefixer | ^10.4.18 | Prefixos automáticos |

### 1.3 Backend/Database
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Supabase | ^2.57.4 | BaaS (PostgreSQL) |

### 1.4 Ícones
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Lucide React | ^0.344.0 | Biblioteca de ícones |

### 1.5 Configurações Importantes
```typescript
// vite.config.ts
- Plugin: @vitejs/plugin-react
- optimizeDeps.exclude: ['lucide-react']

// tsconfig.app.json
- target: ES2020
- module: ESNext
- jsx: react-jsx
- strict: true
```

---

## 2. ARQUITETURA DE ARQUIVOS

```
src/
├── main.tsx                    # Entry point - renderiza <App />
├── App.tsx                     # Root component com providers
├── index.css                   # Estilos globais + Tailwind
├── vite-env.d.ts              # Tipos do Vite
│
├── types/
│   └── index.ts               # Todas as interfaces/types
│
├── store/
│   ├── ChatContext.tsx        # Estado global do chat (useReducer)
│   └── ThemeContext.tsx       # Estado do tema (useState)
│
├── services/
│   ├── supabase.ts            # Cliente e funções Supabase
│   └── mockSimulation.ts      # Simulação de respostas IA
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Sidebar esquerda
│   │   ├── MainArea.tsx       # Área principal
│   │   ├── AccountHeader.tsx  # Header com perfil
│   │   ├── ChatSessionCard.tsx # Card de sessão
│   │   └── SidebarCard.tsx    # Card na sidebar
│   │
│   ├── chat/
│   │   ├── ChatInput.tsx      # Input de mensagem
│   │   └── ChatMessages.tsx   # Lista de mensagens
│   │
│   └── cards/
│       ├── CardWrapper.tsx    # Wrapper com ações
│       ├── ActiveCards.tsx    # Container de cards ativos
│       ├── IntentSummaryCard.tsx
│       ├── ActionTicketCard.tsx
│       ├── BotCard.tsx
│       └── PortfolioSnapshotCard.tsx
│
└── assets/
    ├── deriv_neo_dark_mode.svg
    ├── deriv_neo_light_mode.svg
    └── simbolo_logo_deriv.svg
```

---

## 3. SISTEMA DE TIPOS (TypeScript)

### 3.1 Tipos de Cards
```typescript
type CardType = 'intent-summary' | 'action-ticket' | 'bot' | 'portfolio-snapshot';
type CardStatus = 'active' | 'archived' | 'hidden';
```

### 3.2 Interface Base de Card
```typescript
interface BaseCard {
  id: string;
  type: CardType;
  status: CardStatus;
  isFavorite: boolean;
  createdAt: Date;
  payload: Record<string, unknown>;
}
```

### 3.3 Payloads Específicos por Tipo de Card

#### IntentSummaryPayload
```typescript
interface IntentSummaryPayload {
  action: string;      // Ex: "Buy", "Sell", "Swap"
  asset?: string;      // Ex: "BTC", "ETH"
  value?: string;      // Ex: "$1,000"
  summary: string;     // Descrição da intenção
}
```

#### ActionTicketPayload
```typescript
interface ActionTicketPayload {
  ticketId: string;    // Ex: "TKT-1234"
  action: 'buy' | 'sell' | 'transfer' | 'swap';
  asset: string;
  amount: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}
```

#### BotPayload
```typescript
interface BotPayload {
  botId: string;       // Ex: "BOT-123"
  name: string;        // Ex: "DCA Master"
  strategy: string;    // Descrição da estratégia
  status: 'active' | 'paused' | 'stopped';
  performance?: string; // Ex: "+12.5%"
}
```

#### PortfolioSnapshotPayload
```typescript
interface PortfolioSnapshotPayload {
  totalValue: string;      // Ex: "$45,230.00"
  change24h: string;       // Ex: "+$1,250.00"
  changePercent: string;   // Ex: "+2.84%"
  assets: Array<{
    symbol: string;        // Ex: "BTC"
    allocation: number;    // Ex: 45 (percentual)
    value: string;         // Ex: "$20,353.50"
  }>;
}
```

### 3.4 Tipos de Mensagem
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### 3.5 Sistema de Eventos UI
```typescript
type UIEventType = 'ADD_CARD' | 'UPDATE_CARD' | 'ARCHIVE_CARD' | 'FAVORITE_CARD' | 'HIDE_CARD';

interface UIEvent {
  type: UIEventType;
  cardType?: CardType;
  cardId: string;
  payload?: Record<string, unknown>;
}
```

### 3.6 Resposta do LangFlow (Contrato)
```typescript
interface LangFlowResponse {
  chat_message: string;    // Texto da resposta
  ui_events: UIEvent[];    // Instruções de UI
}
```

### 3.7 Sessão de Chat
```typescript
interface ChatSession {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
  is_archived: boolean;
  user_id?: string;
}
```

---

## 4. GERENCIAMENTO DE ESTADO

### 4.1 ThemeContext (Tema)

**Arquivo:** `src/store/ThemeContext.tsx`

**Estado:**
```typescript
type Theme = 'light' | 'dark';
const [theme, setTheme] = useState<Theme>('dark'); // default
```

**Persistência:** `localStorage.getItem('flowchat-theme')`

**Lógica:**
- [ ] Carrega tema do localStorage no mount
- [ ] Salva tema no localStorage quando muda
- [ ] Aplica classe no `document.documentElement` ('dark' ou 'light')
- [ ] Função `toggleTheme()` alterna entre temas

**Hook:** `useTheme()` retorna `{ theme, toggleTheme }`

### 4.2 ChatContext (Estado Principal)

**Arquivo:** `src/store/ChatContext.tsx`

**Padrão:** useReducer + Context API

**Estado Inicial:**
```typescript
interface ChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeCards: BaseCard[];
  archivedCards: BaseCard[];
  favoriteCards: BaseCard[];
  isTyping: boolean;
  isLoading: boolean;
}
```

**Actions do Reducer:**
| Action | Payload | Efeito |
|--------|---------|--------|
| SET_SESSIONS | ChatSession[] | Define lista de sessões |
| SET_CURRENT_SESSION | string \| null | Define sessão atual |
| ADD_SESSION | ChatSession | Adiciona sessão no início |
| UPDATE_SESSION | {id, updates} | Atualiza sessão específica |
| DELETE_SESSION | string | Remove sessão e limpa se for atual |
| ADD_MESSAGE | ChatMessage | Adiciona mensagem ao array |
| SET_MESSAGES | ChatMessage[] | Define todas mensagens |
| SET_TYPING | boolean | Define estado de digitação |
| SET_LOADING | boolean | Define estado de loading |
| ADD_CARD | BaseCard | Adiciona card aos ativos |
| SET_CARDS | BaseCard[] | Separa cards por status |
| ARCHIVE_CARD | string | Move card para arquivados |
| FAVORITE_CARD | string | Marca card como favorito |
| UNFAVORITE_CARD | string | Remove favorito do card |
| HIDE_CARD | string | Remove card de todas listas |
| RESET_CHAT | - | Limpa sessão, mensagens e cards |

**Funções Expostas pelo Context:**
```typescript
interface ChatContextValue {
  // Estado
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeCards: BaseCard[];
  archivedCards: BaseCard[];
  favoriteCards: BaseCard[];
  isTyping: boolean;
  isLoading: boolean;
  
  // Ações
  addMessage: (message: ChatMessage) => Promise<void>;
  setTyping: (typing: boolean) => void;
  processUIEvent: (event: UIEvent) => Promise<void>;
  archiveCard: (cardId: string) => Promise<void>;
  favoriteCard: (cardId: string) => Promise<void>;
  unfavoriteCard: (cardId: string) => Promise<void>;
  hideCard: (cardId: string) => void;
  resetChat: () => void;
  createNewSession: (firstMessage: string) => Promise<string | null>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<...>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}
```

**Lógica de processUIEvent:**
```typescript
// Processa eventos vindos do LangFlow
switch (event.type) {
  case 'ADD_CARD':
    // Cria BaseCard com payload
    // dispatch ADD_CARD
    // Persiste no Supabase
    break;
  case 'ARCHIVE_CARD':
    // dispatch ARCHIVE_CARD
    // Atualiza no Supabase
    break;
  case 'FAVORITE_CARD':
    // dispatch FAVORITE_CARD
    // Atualiza no Supabase
    break;
  case 'HIDE_CARD':
    // dispatch HIDE_CARD
    // Atualiza no Supabase
    break;
}
```

**Hook:** `useChat()` retorna todo o ChatContextValue

---

## 5. SERVIÇOS E INTEGRAÇÕES

### 5.1 Supabase Service

**Arquivo:** `src/services/supabase.ts`

**Configuração:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Funções Disponíveis:**

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| createChatSession | title: string | ChatSession \| null | Cria nova sessão |
| getChatSessions | - | ChatSession[] | Lista todas sessões |
| updateChatSession | sessionId, updates | boolean | Atualiza sessão |
| deleteChatSession | sessionId | boolean | Deleta sessão |
| addMessageToSession | sessionId, message | boolean | Adiciona mensagem |
| getSessionMessages | sessionId | ChatMessage[] | Lista mensagens |
| addCardToSession | sessionId, card | boolean | Adiciona card |
| getSessionCards | sessionId | BaseCard[] | Lista cards |
| updateCardInSession | cardId, updates | boolean | Atualiza card |

### 5.2 Mock Simulation Service

**Arquivo:** `src/services/mockSimulation.ts`

**Propósito:** Simula respostas do LangFlow para demonstração

**Estrutura de Cenário:**
```typescript
interface MockScenario {
  keywords: string[];           // Palavras-chave para match
  response: string;             // Texto de resposta
  events: () => UIEvent[];      // Função que gera eventos UI
}
```

**Cenários Implementados:**

| Keywords | Ação | Cards Gerados |
|----------|------|---------------|
| buy, comprar, purchase | Compra | IntentSummary + ActionTicket |
| sell, vender | Venda | IntentSummary + ActionTicket |
| bot, automate, automatizar | Bot | BotCard |
| portfolio, carteira, balance, saldo, holdings | Portfolio | PortfolioSnapshot |
| swap, trocar, exchange, convert | Swap | IntentSummary + ActionTicket |
| help, ajuda, what can, o que você | Ajuda | Nenhum (só texto) |

**Função Principal:**
```typescript
async function simulateLangFlowResponse(userMessage: string): Promise<LangFlowResponse>
```

**Lógica:**
1. Delay artificial: 800-1500ms
2. Busca cenário por keyword match (case insensitive)
3. Se encontrar: retorna response + events do cenário
4. Se não encontrar: retorna fallback genérico + IntentSummary

**Geração de IDs:**
```typescript
function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 6. COMPONENTES DE LAYOUT

### 6.1 App.tsx (Root)

**Estrutura:**
```tsx
<ThemeProvider>
  <ChatProvider>
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <MainArea />
    </div>
  </ChatProvider>
</ThemeProvider>
```

**Hierarquia de Providers:**
1. ThemeProvider (mais externo)
2. ChatProvider (interno)

### 6.2 Sidebar.tsx

**Localização:** Sidebar esquerda (w-72)

**Seções:**
1. **Header:** Logo Deriv Neo (clicável → resetChat)
2. **Chats:** Lista de sessões ativas
3. **Favorites:** Sessões + Cards favoritos
4. **Archived:** Sessões + Cards arquivados

**Estado Local:**
```typescript
const [chatsOpen, setChatsOpen] = useState(true);
const [favoritesOpen, setFavoritesOpen] = useState(true);
const [archivedOpen, setArchivedOpen] = useState(true);
```

**Filtragem de Sessões:**
```typescript
const activeChats = sessions.filter(s => !s.is_archived && !s.is_favorite);
const favoriteChats = sessions.filter(s => s.is_favorite && !s.is_archived);
const archivedChats = sessions.filter(s => s.is_archived);
```

**Componentes Filhos:**
- `ChatSessionCard` - para cada sessão
- `SidebarCard` - para cada card favorito/arquivado

### 6.3 MainArea.tsx

**Estrutura:**
```tsx
<main>
  <AccountHeader />
  {!hasMessages ? <WelcomeScreen /> : (
    <ChatMessages />
    <ActiveCards />
  )}
  <ChatInput />
</main>
```

**Condicional Principal:**
- Se `messages.length === 0`: mostra WelcomeScreen
- Se tem mensagens: mostra ChatMessages + ActiveCards

**WelcomeScreen:**
- Ícone Deriv
- Título "What can I help you with?"
- Descrição
- 4 SuggestionCards: "Show my portfolio", "Buy 0.1 BTC", "Set up a DCA bot", "Swap ETH to USDC"

### 6.4 AccountHeader.tsx

**Localização:** Topo da MainArea

**Estado Local:**
```typescript
const [period, setPeriod] = useState<Period>('daily');
const [accountMode, setAccountMode] = useState<AccountMode>('demo');
const [isPeriodOpen, setIsPeriodOpen] = useState(false);
const [isProfileOpen, setIsProfileOpen] = useState(false);
```

**Tipos:**
```typescript
type Period = 'daily' | 'weekly' | 'monthly';
type AccountMode = 'demo' | 'real';
```

**Dados Simulados:**
```typescript
const balance = accountMode === 'demo' ? 12987 : 0;
const variation = accountMode === 'demo'
  ? (period === 'daily' ? 2.34 : period === 'weekly' ? 5.67 : 8.92)
  : 0;
```

**Elementos:**
- Nome do usuário: "Julia Roberts"
- Variação percentual com dropdown de período
- Saldo formatado
- Avatar com dropdown de perfil
- Toggle de tema (dark/light)

**Click Outside Logic:**
```typescript
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### 6.5 ChatSessionCard.tsx

**Props:**
```typescript
interface ChatSessionCardProps {
  session: ChatSession;
}
```

**Estado Local:**
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isRenaming, setIsRenaming] = useState(false);
const [newTitle, setNewTitle] = useState(session.title);
```

**Ações do Menu:**
| Ação | Função | Descrição |
|------|--------|-----------|
| Rename | handleRename | Ativa modo edição inline |
| Favorite | handleFavorite | Toggle is_favorite |
| Archive | handleArchive | Toggle is_archived |
| Delete | handleDelete | Deleta com confirmação |

**Indicador Visual:**
- Sessão ativa: background diferenciado
- Hover: mostra botão de menu (MoreVertical)

### 6.6 SidebarCard.tsx

**Props:**
```typescript
interface SidebarCardProps {
  card: BaseCard;
  variant: 'favorite' | 'archived';
}
```

**Mapeamento de Ícones:**
```typescript
const cardIcons = {
  'intent-summary': FileText,
  'action-ticket': Zap,
  'bot': Bot,
  'portfolio-snapshot': Wallet,
};
```

**Ações:**
- Unfavorite (se variant === 'favorite')
- Hide (sempre disponível)

---

## 7. SISTEMA DE CARDS

### 7.1 CardWrapper.tsx (HOC)

**Props:**
```typescript
interface CardWrapperProps {
  card: BaseCard;
  children: ReactNode;
  accentColor?: string; // 'red' | 'amber' | 'cyan' | 'rose'
}
```

**Funcionalidades:**
- Menu de contexto (MoreVertical)
- Ação: Favoritar/Desfavoritar
- Ação: Arquivar
- Estilização baseada em accentColor
- Suporte a tema dark/light

**Classes de Cor:**
```typescript
const colorClasses = {
  red: { border: 'border-red-500/20', hover: 'hover:bg-red-500/10', icon: 'text-red-500' },
  amber: { border: 'border-amber-500/20', ... },
  cyan: { border: 'border-cyan-500/20', ... },
  rose: { border: 'border-rose-500/20', ... },
};
```

### 7.2 ActiveCards.tsx

**Lógica:**
```typescript
const { activeCards } = useChat();
if (activeCards.length === 0) return null;
```

**Renderização:**
- Indicador pulsante vermelho
- Label "Active Cards"
- Grid responsivo (1 col mobile, 2 cols sm+)
- Animação `animate-scale-in` em cada card

**Mapeamento de Componentes:**
```typescript
const cardComponents = {
  'intent-summary': IntentSummaryCard,
  'action-ticket': ActionTicketCard,
  'bot': BotCard,
  'portfolio-snapshot': PortfolioSnapshotCard,
};
```

### 7.3 IntentSummaryCard.tsx

**Cor de Destaque:** cyan

**Elementos:**
- Ícone: FileText
- Label: "Intent"
- Título: payload.action
- Asset → Value (com seta)
- Summary

### 7.4 ActionTicketCard.tsx

**Mapeamento de Ícones por Ação:**
```typescript
const actionIcons = {
  buy: ArrowUpRight,
  sell: ArrowDownRight,
  transfer: RefreshCw,
  swap: ArrowRightLeft,
};
```

**Mapeamento de Cores:**
```typescript
const actionColors = {
  buy: 'red',
  sell: 'rose',
  transfer: 'amber',
  swap: 'cyan',
};
```

**Status Config:**
```typescript
const statusConfig = {
  pending: { icon: Loader2, color: 'text-amber-500', label: 'Pending' },
  executing: { icon: Loader2, color: 'text-cyan-500', label: 'Executing' },
  completed: { icon: CheckCircle2, color: 'text-red-500', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-rose-500', label: 'Failed' },
};
```

**Animação:** Spinner em pending/executing

### 7.5 BotCard.tsx

**Cor de Destaque:** amber

**Status Config:**
```typescript
const statusConfig = {
  active: { icon: Play, color: 'text-red-500', dot: 'bg-red-500' },
  paused: { icon: Pause, color: 'text-amber-500', dot: 'bg-amber-500' },
  stopped: { icon: Square, color: 'text-zinc-500', dot: 'bg-zinc-500' },
};
```

**Elementos:**
- Ícone Bot com dot pulsante (se active)
- Nome do bot
- Estratégia
- Status badge
- Performance (se disponível)

### 7.6 PortfolioSnapshotCard.tsx

**Cor de Destaque:** red

**Cores de Assets:**
```typescript
const assetColors = ['bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
```

**Elementos:**
- Total value
- Change badge (positivo/negativo)
- 24h change
- Barra de alocação (visual)
- Grid de assets com percentuais

---

## 8. SISTEMA DE CHAT

### 8.1 ChatInput.tsx

**Estado Local:**
```typescript
const [message, setMessage] = useState('');
const [isFocused, setIsFocused] = useState(false);
```

**Auto-resize do Textarea:**
```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
  }
}, [message]);
```

**Fluxo de Submit (handleSubmit):**
```typescript
1. Validação: if (!message.trim() || isTyping) return;
2. Limpa input e seta isTyping = true
3. Se não tem sessão: createNewSession(messageContent)
4. Cria userMessage e chama addMessage()
5. Chama simulateLangFlowResponse()
6. Cria assistantMessage e chama addMessage()
7. Para cada ui_event: delay 300ms + processUIEvent()
8. Em caso de erro: adiciona mensagem de erro
9. Finally: setTyping(false)
```

**Keyboard Handler:**
- Enter (sem Shift): submit
- Shift+Enter: nova linha

**Visual:**
- Borda animada com gradiente quando focado
- Botão muda de cor quando tem texto
- Loader quando isTyping

### 8.2 ChatMessages.tsx

**Auto-scroll:**
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isTyping]);
```

**MessageBubble:**
- Alinhamento: user → direita, assistant → esquerda
- Avatar: User icon ou Bot icon (gradiente vermelho)
- Timestamp formatado: "10:30 AM"
- Animação: `animate-slide-up`

**TypingIndicator:**
- Avatar Bot
- Loader spinner
- Texto "Thinking..."

**Formatação de Tempo:**
```typescript
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
```

---

## 9. FLUXOS DE DADOS

### 9.1 Fluxo: Envio de Mensagem

```
[User digita] → [Enter/Click]
      ↓
[handleSubmit()]
      ↓
[Verifica sessão] → [Se não existe: createNewSession()]
      ↓
[addMessage(userMessage)] → [dispatch ADD_MESSAGE] → [Supabase: addMessageToSession]
      ↓
[simulateLangFlowResponse()] → [Delay 800-1500ms] → [Match keywords]
      ↓
[addMessage(assistantMessage)] → [dispatch ADD_MESSAGE] → [Supabase: addMessageToSession]
      ↓
[Para cada ui_event:]
  ↓
  [processUIEvent()] → [dispatch ADD_CARD/ARCHIVE/etc] → [Supabase: addCardToSession]
```

### 9.2 Fluxo: Carregamento de Sessão

```
[Click em ChatSessionCard]
      ↓
[loadSession(sessionId)]
      ↓
[dispatch SET_LOADING: true]
[dispatch SET_CURRENT_SESSION: sessionId]
      ↓
[Promise.all:]
  - getSessionMessages(sessionId)
  - getSessionCards(sessionId)
      ↓
[dispatch SET_MESSAGES]
[dispatch SET_CARDS] → [Separa: active, archived, favorite]
      ↓
[dispatch SET_LOADING: false]
```

### 9.3 Fluxo: Ação em Card

```
[Click em Favoritar/Arquivar/Esconder]
      ↓
[archiveCard/favoriteCard/hideCard()]
      ↓
[dispatch ARCHIVE_CARD/FAVORITE_CARD/HIDE_CARD]
      ↓
[Supabase: updateCardInSession()]
```

### 9.4 Fluxo: Gerenciamento de Sessão

```
[Ação no ChatSessionCard]
      ↓
[updateSession/deleteSession()]
      ↓
[Supabase: updateChatSession/deleteChatSession]
      ↓
[dispatch UPDATE_SESSION/DELETE_SESSION]
```

---

## 10. BANCO DE DADOS (Supabase)

### 10.1 Tabela: chat_sessions
```sql
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  user_id uuid  -- Para futura autenticação
);
```

### 10.2 Tabela: chat_messages
```sql
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 10.3 Tabela: chat_cards
```sql
CREATE TABLE chat_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('intent-summary', 'action-ticket', 'bot', 'portfolio-snapshot')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
  is_favorite boolean DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

### 10.4 Índices
```sql
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_cards_session_id ON chat_cards(session_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_is_favorite ON chat_sessions(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_chat_sessions_is_archived ON chat_sessions(is_archived) WHERE is_archived = true;
```

### 10.5 Trigger de updated_at
```sql
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 10.6 RLS (Row Level Security)
- Habilitado em todas as tabelas
- Políticas atuais: permitem tudo (para desenvolvimento)
- Preparado para restrição com autenticação futura

---

## 11. ESTILIZAÇÃO E TEMAS

### 11.1 Cores Customizadas (Tailwind)
```javascript
// tailwind.config.js
colors: {
  'brand-green': '#00B67B',
}
```

### 11.2 Cores da Marca Deriv
- Vermelho principal: `#ff444f`
- Verde (brand-green): `#00B67B`

### 11.3 Sistema de Tema

**Aplicação de Tema:**
```typescript
document.documentElement.classList.add(theme); // 'dark' ou 'light'
```

**Padrão de Classes Condicionais:**
```typescript
className={`... ${
  theme === 'dark'
    ? 'bg-zinc-900 text-white border-zinc-800'
    : 'bg-white text-gray-900 border-gray-200'
}`}
```

### 11.4 Animações CSS

**Definidas em index.css:**
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Classes Utilitárias:**
- `.animate-slide-up` - Mensagens
- `.animate-scale-in` - Cards
- `.animate-fade-in` - Typing indicator

### 11.5 Scrollbar Customizada
```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(63, 63, 70, 0.5) transparent;
}
```

### 11.6 Selection
```css
::selection {
  background-color: rgba(239, 68, 68, 0.3); /* dark */
  /* ou */
  background-color: rgba(0, 182, 123, 0.2); /* light */
}
```

---

## 12. CHECKLIST DE FUNCIONALIDADES

### ✅ IMPLEMENTADO

#### Chat
- [x] Input de mensagem com auto-resize
- [x] Envio por Enter (Shift+Enter para nova linha)
- [x] Indicador de digitação (typing)
- [x] Mensagens com avatar e timestamp
- [x] Auto-scroll para última mensagem
- [x] Animações de entrada

#### Sessões
- [x] Criar nova sessão automaticamente
- [x] Listar sessões na sidebar
- [x] Carregar sessão existente
- [x] Renomear sessão (inline edit)
- [x] Favoritar/desfavoritar sessão
- [x] Arquivar/desarquivar sessão
- [x] Deletar sessão (com confirmação)
- [x] Separação: Chats / Favorites / Archived

#### Cards
- [x] 4 tipos de cards implementados
- [x] Adicionar card via UI Event
- [x] Favoritar/desfavoritar card
- [x] Arquivar card
- [x] Esconder card
- [x] Cards na sidebar (favorites/archived)
- [x] Menu de contexto em cada card

#### Simulação
- [x] Mock de respostas do LangFlow
- [x] 6 cenários por keyword
- [x] Fallback genérico
- [x] Delay artificial realista

#### Persistência
- [x] Sessões no Supabase
- [x] Mensagens no Supabase
- [x] Cards no Supabase
- [x] Atualização de updated_at

#### UI/UX
- [x] Tema dark/light
- [x] Persistência de tema (localStorage)
- [x] Logo responsivo ao tema
- [x] Welcome screen com sugestões
- [x] Header com perfil e saldo
- [x] Dropdown de período
- [x] Dropdown de perfil
- [x] Seções colapsáveis na sidebar

### ⏳ NÃO IMPLEMENTADO (Identificado no Contexto)

#### Integração Real
- [ ] Conexão com LangFlow real (atualmente mock)
- [ ] Autenticação de usuário
- [ ] RLS baseado em user_id
- [ ] Modo manual com @agent (mencionado no contexto)

#### Agentes (Mencionados no Contexto)
- [ ] Concierge (orquestrador)
- [ ] Agente de Treinamento
- [ ] Agente de Gestão de Portfólio
- [ ] Agente Trader
- [ ] Agente de Risco
- [ ] Agente de Bots
- [ ] Agente de Suporte

#### Cards Adicionais (Mencionados)
- [ ] RiskAlertCard
- [ ] EducationLessonCard
- [ ] SupportCaseCard
- [ ] HoldingsTable
- [ ] PerformanceChart

#### Funcionalidades de Cards
- [ ] Confirmar/Cancelar ActionTicket
- [ ] Pausar/Retomar Bot
- [ ] Expandir detalhes de Portfolio

#### Sidebar Direita
- [ ] Execuções persistentes
- [ ] Fixar módulos
- [ ] Ocultar módulos

---

## 13. PADRÕES DE CÓDIGO

### 13.1 Hooks Customizados
```typescript
// Padrão de criação
export function useCustomHook() {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error('useCustomHook must be used within CustomProvider');
  }
  return context;
}
```

### 13.2 Componentes com Tema
```typescript
// Padrão de estilização condicional
const { theme } = useTheme();

className={`base-classes ${
  theme === 'dark'
    ? 'dark-specific-classes'
    : 'light-specific-classes'
}`}
```

### 13.3 Click Outside Pattern
```typescript
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [isOpen]);
```

### 13.4 Async Actions Pattern
```typescript
const handleAction = useCallback(async () => {
  // 1. Dispatch otimista (UI imediata)
  dispatch({ type: 'ACTION', payload });
  
  // 2. Persistência assíncrona
  await supabaseService.action(payload);
}, [dependencies]);
```

---

## 14. VARIÁVEIS DE AMBIENTE

```env
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

**Validação:**
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

---

## 15. RESUMO EXECUTIVO

### Arquitetura
- **Frontend-first**: React + TypeScript + Vite
- **Estado**: Context API + useReducer
- **Persistência**: Supabase (PostgreSQL)
- **Estilização**: TailwindCSS com tema dark/light

### Fluxo Principal
1. Usuário envia mensagem
2. Sistema cria/usa sessão
3. Mock simula resposta do LangFlow
4. Resposta contém texto + UI events
5. UI events geram cards dinâmicos
6. Tudo persiste no Supabase

### Pontos de Extensão
1. Substituir `mockSimulation.ts` por integração real com LangFlow
2. Adicionar novos tipos de cards em `types/index.ts` + componentes
3. Implementar autenticação e RLS
4. Adicionar sidebar direita para execuções

---

*Blueprint gerado em: Janeiro 2026*
*Versão: 1.0*
