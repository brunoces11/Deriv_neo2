# Requirements Document

## Introduction

Este documento especifica os requisitos para transformar o gráfico estático atual em um gráfico interativo funcional. O gráfico ocupará toda a tela em modo fullscreen no "Graph Mode", com indicadores técnicos (MACD no principal, RSI+Volume em sub-painel), ferramentas de desenho básicas e integração com o chat via sistema de TAGs.

## Glossary

- **Chart_Layer**: Componente React que renderiza o gráfico usando TradingView Lightweight Charts
- **Main_Pane**: Área principal do gráfico com candlesticks e MACD
- **Sub_Pane**: Área inferior embutida com RSI e Volume sobrepostos
- **Overlay_Indicator**: Indicador desenhado sobre os candles (SMA, EMA, Bollinger, MACD)
- **Drawing_Tool**: Ferramenta para desenhar objetos no gráfico
- **Drawing_Object**: Objeto desenhado (TrendLine, HorizontalLine, Rectangle)
- **Chart_Tag**: Informação estruturada do desenho para envio ao chat
- **Chat_Input**: Campo de entrada do chat na ExecutionsSidebar (Graph Mode)

## Requirements

### Requirement 1: Toolbar do Gráfico

**User Story:** Como usuário, quero uma barra de ferramentas no gráfico para acessar controles básicos.

#### Acceptance Criteria

1. WHEN o Chart_Layer estiver visível, THE Toolbar SHALL ser exibida no topo
2. THE Toolbar SHALL conter Symbol_Selector (BTC/USD, ETH/USD, SOL/USD, XRP/USD, ADA/USD)
3. THE Toolbar SHALL conter Timeframe_Selector (1m, 5m, 15m, 1h, 4h, 1D)
4. THE Toolbar SHALL conter botão de Indicadores
5. THE Toolbar SHALL conter menu de Ferramentas de Desenho
6. THE Toolbar SHALL seguir tema Deriv (dark/light)

---

### Requirement 2: Gráfico Principal (Main_Pane)

**User Story:** Como usuário, quero ver candlesticks com MACD no gráfico principal.

#### Acceptance Criteria

1. THE Main_Pane SHALL ocupar ~75% da altura do Chart_Layer
2. THE Main_Pane SHALL exibir candlesticks (verde alta, vermelho #ff444f baixa)
3. THE Main_Pane SHALL suportar MACD como overlay (linhas suaves em tons de cinza neutro)
4. THE MACD SHALL ter parâmetros: fast=12, slow=26, signal=9
5. THE Main_Pane SHALL suportar zoom (scroll) e pan (arrastar)
6. THE Main_Pane SHALL exibir crosshair com preço e tempo

---

### Requirement 3: Sub-Painel (RSI + Volume)

**User Story:** Como usuário, quero ver RSI e Volume em um painel inferior embutido.

#### Acceptance Criteria

1. THE Sub_Pane SHALL ocupar ~25% da altura do Chart_Layer
2. THE Sub_Pane SHALL exibir RSI como linha (período=14)
3. THE RSI SHALL ter linhas de referência em 30 e 70
4. THE Sub_Pane SHALL exibir Volume como barras sobrepostas ao RSI
5. THE Volume SHALL usar cores: verde (alta), vermelho (baixa), com opacidade reduzida
6. THE Sub_Pane SHALL sincronizar scroll/zoom com Main_Pane

---

### Requirement 4: Indicadores Overlay Opcionais

**User Story:** Como usuário, quero adicionar médias móveis e Bollinger Bands ao gráfico.

#### Acceptance Criteria

1. THE System SHALL suportar SMA (Simple Moving Average) - período configurável
2. THE System SHALL suportar EMA (Exponential Moving Average) - período configurável
3. THE System SHALL suportar Bollinger Bands - período e desvio configuráveis
4. WHEN indicador for adicionado, THE System SHALL desenhar sobre os candles
5. THE Indicator_Panel SHALL permitir add/remove/configurar indicadores
6. THE configuração SHALL persistir em localStorage

---

### Requirement 5: Ferramentas de Desenho

**User Story:** Como usuário, quero desenhar linhas e formas no gráfico.

#### Acceptance Criteria

1. THE System SHALL suportar Trend_Line (linha entre dois pontos)
2. THE System SHALL suportar Horizontal_Line (linha de suporte/resistência)
3. THE System SHALL suportar Rectangle (área de destaque)
4. WHEN Drawing_Tool ativa, THE cursor SHALL indicar modo de desenho
5. THE Drawing_Object SHALL usar cor primária #ff444f
6. THE desenhos SHALL persistir em localStorage por símbolo

---

### Requirement 6: Seleção e Manipulação

**User Story:** Como usuário, quero selecionar e editar objetos desenhados.

#### Acceptance Criteria

1. WHEN clicar em Drawing_Object, THE System SHALL selecionar o objeto
2. THE objeto selecionado SHALL exibir handles de redimensionamento
3. THE usuário SHALL poder arrastar para mover o objeto
4. THE usuário SHALL poder arrastar handles para redimensionar
5. WHEN pressionar Delete, THE System SHALL remover objeto selecionado
6. WHEN clicar fora, THE System SHALL desselecionar

---

### Requirement 7: Action Bar do Objeto

**User Story:** Como usuário, quero ações rápidas quando seleciono um objeto.

#### Acceptance Criteria

1. WHEN objeto selecionado, THE Action_Bar SHALL aparecer próxima ao objeto
2. THE Action_Bar SHALL conter botão "Enviar para Chat"
3. THE Action_Bar SHALL conter botão "Deletar"
4. THE Action_Bar SHALL seguir tema atual

---

### Requirement 8: Sistema de TAGs

**User Story:** Como usuário, quero enviar informações do desenho para o chat.

#### Acceptance Criteria

1. WHEN clicar "Enviar para Chat", THE System SHALL gerar Chart_Tag
2. THE Chart_Tag SHALL seguir formato: `@chart:[tipo]:[símbolo]:[dados]`
3. FOR Trend_Line: `@chart:trendline:BTC/USD:42000→45000:bullish`
4. FOR Horizontal_Line: `@chart:hline:BTC/USD:43500`
5. FOR Rectangle: `@chart:zone:BTC/USD:42000-44000`
6. THE Chart_Tag SHALL ser inserida no Chat_Input da ExecutionsSidebar
7. THE Chat_Input SHALL receber foco após inserção

---

### Requirement 9: Renderização de TAGs no Chat

**User Story:** Como usuário, quero ver TAGs formatadas nas mensagens do chat.

#### Acceptance Criteria

1. WHEN mensagem contiver Chart_Tag, THE System SHALL renderizar como chip/badge
2. THE chip SHALL ser visualmente destacado (cor Deriv)
3. THE chip SHALL exibir informação resumida (ex: "📈 BTC Trendline")
4. WHEN clicar no chip, THE System SHALL destacar objeto no gráfico (se existir)

---

### Requirement 10: Persistência e Tema

**User Story:** Como usuário, quero que configurações sejam salvas e o tema respeitado.

#### Acceptance Criteria

1. THE System SHALL persistir: símbolo, timeframe, indicadores, desenhos
2. THE System SHALL restaurar estado ao recarregar página
3. THE Chart_Layer SHALL adaptar cores ao tema (dark/light)
4. WHEN tema mudar, THE System SHALL atualizar sem recarregar dados

