CONTEXTO DO PROJETO (para Kiro IDE)
1) O que é este projeto (importante: é uma simulação)

Este projeto é uma simulação/protótipo de como seriam as plataformas de trading do futuro quando construídas AI-first (100% orientadas por agentes), reduzindo drasticamente a dependência de dashboards complexos e navegação por UI tradicional.

Não é uma plataforma real conectada a corretora/exchange.

Não há execução real de ordens financeiras.

O objetivo é demonstrar o “paradigma”: o usuário conversa com um concierge agent e, a partir disso, a interface se reorganiza automaticamente, exibindo cards/módulos dinâmicos com dados e ações.

Tagline do protótipo:
“Trading interface as a conversation + dynamic modules”.

2) Stack e arquitetura (simples e deliberada)

A stack é propositalmente mínima, para que o protótipo seja fácil de rodar, demonstrar e avaliar no hackathon:

Frontend: React + TypeScript

Backend tradicional: em standby (fora do escopo do simulador)

Backend de IA / Orquestração: Langflow

Integração: o frontend se comunica diretamente com o backend de IA via HTTP (request/response)

Ponto central da arquitetura:
O simulador gira em torno do frontend como camada principal de orquestração da experiência, recebendo do Langflow:

Resposta textual para o chat

Payload estruturado em JSON com instruções de UI (UI states / UI actions)

Isso faz com que a IA não apenas responda em texto, mas coordene o comportamento da interface.

3) Ideia principal de UX

O produto simula uma experiência de “ChatGPT + cockpit de módulos dinâmicos”.

A tela é composta por três áreas principais:

Sidebar esquerda (Sessões de chat)

Lista de conversas (threads)

Navegação entre sessões como em chats modernos

Área central (Chat)

Input do usuário

Output textual da IA

Módulos inline (cards) anexados diretamente às respostas

Sidebar direita (Execuções / Resultados persistentes)

Toda interação que gera dados estruturados (tabelas, ordens simuladas, relatórios, alertas de risco) cria uma “execução”

As execuções aparecem de forma persistente na sidebar direita

O usuário pode fixar, ocultar ou remover módulos

Itens favoritados persistem entre login/logout (simulado)

Objetivo prático:
O usuário não navega por páginas. Ele descreve o que quer, e a interface se adapta automaticamente.

4) Modelo mental: Concierge e subagentes

O sistema é apresentado como um conjunto de agentes especializados, orquestrados por um agente principal.

Agente principal: Concierge (Manager / Orquestrador)

Responsabilidades:

Interpretar a intenção do usuário

Fazer perguntas de clarificação quando necessário

Decidir quais subagentes devem ser evocados

Consolidar respostas

Retornar texto + JSON de módulos para a UI

Subagentes (especialistas simulados) — ordem final

Treinamento personalizado
Educação guiada sobre produtos, conceitos, estratégias e funcionamento da plataforma simulada.

Gestão de portfólio (inclui insights complementares)
Análise da carteira do usuário: variação de performance, exposição por ativo, concentração, distribuição e resumos.
Pode gerar insights organizacionais e informativos, sem se posicionar como aconselhamento legal definitivo.

Agente Trader (Execução / Order Builder)
Converte intenção em operações estruturadas simuladas (spot, opções, etc.).
Gera Order Tickets prontos para confirmação ou cancelamento.

Agente de Risco (Guardrail / Risk Gatekeeper)
Camada automática e personalizada (conservador, moderado, intermediário, arrojado).

Avalia todas as operações antes da confirmação

Detecta discrepâncias e riscos excessivos

Emite alertas claros e explicáveis

Pode exigir acknowledgement explícito do usuário

Foco principal: mitigação de perdas e disciplina operacional

Agente de Bots (criação e gestão)
Simula criação, configuração e acompanhamento de bots e estratégias automatizadas.

Suporte técnico personalizado
Atende dúvidas operacionais da plataforma simulada, comportamento da UI, configurações e entendimento geral do sistema.

5) Contrato de integração: resposta do Langflow = texto + “UI instruction JSON”

A integração é centrada em um contrato rígido de resposta, que define exatamente como o frontend deve reagir.

O sistema suporta dois modos de interação no chat:

(A) Modo automático (default)

O usuário conversa livremente com o Concierge, que:

Decide quais agentes evocar

Consolida a resposta final

Retorna texto + módulos + execuções no mesmo payload

(B) Modo manual (invocação direta de agentes)

O usuário pode direcionar a conversa explicitamente para um agente:

@portfolio

@trader

@risk

@bots

@training

@support

Nesse modo, o Langflow recebe também o agent_target, mantendo o mesmo contrato de saída.

Princípio operacional do contrato

Cada mensagem do usuário pode resultar em:

Apenas texto

Texto + módulos dinâmicos

Texto + execuções persistidas

Combinação dos itens acima

O frontend não decide o que mostrar.
Ele interpreta e executa as instruções retornadas no JSON.

6) Módulos dinâmicos

Os módulos são componentes UI plugáveis que podem aparecer:

Inline no chat

Persistidos na sidebar direita

Exemplos:

PortfolioSummaryCard

HoldingsTable

PerformanceChart

OrderTicket

RiskAlertCard

BotBuilderCard

EducationLessonCard

SupportCaseCard

7) Fluxos essenciais para demo

Consulta de portfólio

Operação simulada com ticket

Avaliação automática de risco

Criação e acompanhamento de bots

Uso do modo manual com @agent

8) Regras de produto

Todos os dados são simulados

Nenhuma promessa de retorno financeiro

Todas as ações podem ser canceladas

Alertas sempre explicáveis

Persistência leve via storage

Prompt de sistema sugerido para o Kiro

Este repositório implementa um simulador de plataforma de trading AI-first.

A experiência é centrada em chat com módulos dinâmicos.

O frontend (React/TypeScript) se comunica diretamente com o backend de IA (Langflow).

O backend tradicional permanece em standby e fora do escopo do simulador.

O Langflow retorna texto + JSON com instruções de UI.

O sistema suporta modo automático (Concierge) e modo manual (@agent).

Todos os fluxos são simulados; nenhuma execução real.

Prioridade técnica: contrato de resposta estável, UI modular e persistência simples.


deriv colors

VERMELHO: "ff444f"