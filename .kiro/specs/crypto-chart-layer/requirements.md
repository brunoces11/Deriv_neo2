# Requirements Document

## Introduction

Este documento especifica os requisitos para implementação de uma camada de gráficos de criptomoedas usando TradingView Lightweight Charts. O gráfico será uma camada visual de fundo que aparece abaixo de todos os componentes da UI quando ativado, substituindo visualmente o fundo cinza chumbo padrão.

## Glossary

- **Chart_Layer**: Camada visual que renderiza o gráfico de candlesticks, posicionada no z-index mais baixo da UI (acima apenas do fundo)
- **Toggle_Button**: Botão de alternância para ativar/ocultar o Chart_Layer
- **Lightweight_Charts**: Biblioteca TradingView para renderização de gráficos financeiros
- **MainArea**: Componente central do app que contém chat, welcome screen e input
- **Sidebar**: Componentes laterais (esquerdo e direito) que devem permanecer acima do chart
- **Background_Layer**: Fundo cinza chumbo padrão do app (bg-zinc-900)

## Requirements

### Requirement 1: Análise e Mapeamento de Z-Index

**User Story:** Como desenvolvedor, quero entender a hierarquia atual de z-index dos componentes, para que eu possa posicionar o chart corretamente abaixo de todos os elementos da UI.

#### Acceptance Criteria

1. THE Developer SHALL documentar todos os z-index explícitos encontrados nos componentes
2. THE Developer SHALL identificar a hierarquia visual implícita dos elementos
3. THE Developer SHALL mapear quais componentes precisam de z-index explícito para ficarem acima do chart
4. THE Developer SHALL criar um diagrama de camadas z-index proposto

---

### Requirement 2: Ajuste de Z-Index dos Componentes

**User Story:** Como desenvolvedor, quero ajustar os z-index dos componentes existentes, para que o chart possa ser inserido como camada de fundo sem quebrar a UI.

#### Acceptance Criteria

1. WHEN o Chart_Layer estiver ativo, THE Sidebar (esquerdo) SHALL permanecer visualmente acima do chart
2. WHEN o Chart_Layer estiver ativo, THE ExecutionsSidebar (direito) SHALL permanecer visualmente acima do chart
3. WHEN o Chart_Layer estiver ativo, THE ChatInput SHALL permanecer visualmente acima do chart
4. WHEN o Chart_Layer estiver ativo, THE AccountHeader SHALL permanecer visualmente acima do chart
5. WHEN o Chart_Layer estiver ativo, THE WelcomeScreen SHALL permanecer visualmente acima do chart
6. WHEN o Chart_Layer estiver ativo, THE ChatMessages SHALL permanecer visualmente acima do chart
7. THE Chart_Layer SHALL ter z-index de valor 1 (apenas acima do fundo)
8. THE Background_Layer SHALL ter z-index de valor 0 ou auto

---

### Requirement 3: Verificação de Compatibilidade

**User Story:** Como desenvolvedor, quero verificar a compatibilidade do TradingView Lightweight Charts com o stack atual, para garantir que a instalação será bem-sucedida.

#### Acceptance Criteria

1. THE Developer SHALL verificar compatibilidade com React 18.3.1
2. THE Developer SHALL verificar compatibilidade com Vite 5.4.2
3. THE Developer SHALL verificar compatibilidade com TypeScript 5.5.3
4. THE Developer SHALL verificar que a biblioteca suporta ESM (ES Modules)
5. THE Developer SHALL verificar que types TypeScript estão incluídos
6. THE Developer SHALL confirmar que não há conflitos com dependências existentes

---

### Requirement 4: Instalação da Biblioteca

**User Story:** Como desenvolvedor, quero instalar o TradingView Lightweight Charts e suas dependências, para que eu possa usar a biblioteca no projeto.

#### Acceptance Criteria

1. THE Developer SHALL instalar lightweight-charts via npm
2. THE Developer SHALL verificar que a instalação não gerou erros
3. THE Developer SHALL verificar que o build do projeto continua funcionando
4. THE Developer SHALL verificar que o TypeScript reconhece os types da biblioteca

---

### Requirement 5: Criação do Toggle Button

**User Story:** Como usuário, quero um botão toggle para ativar/ocultar o gráfico, para que eu possa escolher quando visualizar o chart.

#### Acceptance Criteria

1. THE Toggle_Button SHALL ser posicionado na parte superior do miolo do chat, acima da linha de separação
2. WHEN o Toggle_Button estiver no estado "off" (padrão), THE Chart_Layer SHALL estar oculto
3. WHEN o Toggle_Button estiver no estado "on", THE Chart_Layer SHALL estar visível
4. THE Toggle_Button SHALL ter visual consistente com o design system do app (Tailwind + tema dark/light)
5. THE Toggle_Button SHALL persistir seu estado durante a sessão
6. THE Toggle_Button SHALL ter ícone indicativo de gráfico (ex: TrendingUp ou BarChart2)

---

### Requirement 6: Implementação do Chart Layer

**User Story:** Como usuário, quero ver um gráfico de candlesticks quando ativo, para que eu possa visualizar dados de mercado.

#### Acceptance Criteria

1. WHEN ativado, THE Chart_Layer SHALL renderizar um gráfico de candlesticks
2. THE Chart_Layer SHALL ocupar toda a área do MainArea como fundo
3. THE Chart_Layer SHALL usar cores compatíveis com o tema Deriv (vermelho #ff444f para candles de baixa)
4. THE Chart_Layer SHALL ser responsivo e se adaptar ao tamanho da tela
5. THE Chart_Layer SHALL carregar dados mock inicialmente (dados simulados de BTC)
6. IF o Chart_Layer for desativado, THEN THE UI SHALL retornar ao estado visual padrão (fundo cinza)

---

### Requirement 7: Integração com Sistema de Módulos

**User Story:** Como desenvolvedor, quero que o chart se integre ao sistema de módulos dinâmicos, para que futuramente o Langflow possa controlar sua exibição.

#### Acceptance Criteria

1. THE Chart_Layer SHALL ser implementado como componente React reutilizável
2. THE Chart_Layer SHALL aceitar props para configuração (symbol, timeframe, theme)
3. THE Chart_Layer SHALL expor métodos para controle externo (show, hide, updateData)
4. THE Chart_Layer SHALL ser compatível com o padrão de UI Events do sistema
