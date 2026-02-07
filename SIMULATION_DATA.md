# Dados Simulados Consolidados — Deriv Neo Prototype

> Referência única de todos os dados hardcoded/mock usados na simulação.

---

## 1. Perfil do Usuário

| Campo | Valor | Fonte |
|-------|-------|-------|
| Nome | Julia Roberts | `UserProfile.tsx`, `CashierPage.tsx` |
| Avatar | `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200` | `UserProfile.tsx`, `ChatMessages.tsx` |
| Tipo de Conta | Demo Account | `CashierPage.tsx` |
| Saldo (Demo) | $12,987.00 | `UserProfile.tsx`, `CashierPage.tsx` |
| Saldo (Real) | $0.00 | `UserProfile.tsx` |
| Variação Diária | +2.34% | `UserProfile.tsx` |
| Variação Semanal | +5.67% | `UserProfile.tsx` |
| Variação Mensal | +8.92% | `UserProfile.tsx` |

---

## 2. Portfolio

### 2.1 Resumo

| Campo | Valor |
|-------|-------|
| Valor Total | $45,230.00 |
| Variação 24h (USD) | +$1,250.00 |
| Variação 24h (%) | +2.84% |

### 2.2 Assets (Snapshot / Sidebar)

| Symbol | Allocation | Value |
|--------|-----------|-------|
| BTC | 45% | $20,353.50 |
| ETH | 30% | $13,569.00 |
| SOL | 15% | $6,784.50 |
| Other | 10% | $4,523.00 |

### 2.3 Assets (Table Complete — com invested/change)

| Symbol | Name | Allocation | Value | Invested | Change | Change% |
|--------|------|-----------|-------|----------|--------|---------|
| BTC | Bitcoin | 45% | $20,353.50 | $18,000.00 | +$2,353.50 | +13.07% |
| ETH | Ethereum | 30% | $13,569.00 | $12,500.00 | +$1,069.00 | +8.55% |
| SOL | Solana | 15% | $6,784.50 | $7,200.00 | -$415.50 | -5.77% |
| Other | Others | 10% | $4,523.00 | $4,500.00 | +$23.00 | +0.51% |

> Fontes: `ChatMessages.tsx` (`getDefaultPayloadForCard`), `mockSimulation.ts`

---

## 3. Trade Defaults

### 3.1 Create Trade Card (Default)

| Campo | Valor |
|-------|-------|
| Asset | BTC/USD |
| Asset Name | Bitcoin |
| Trade Type | higher-lower |
| Duration Mode | duration |
| Duration Unit | days |
| Duration Value | 1 |
| Duration Range | 1–365 |
| Expiry Date | 28 Jan 2026, 23:59:59 GMT +0 |
| Barrier | 42,500.00 |
| Spot Price | 42,350.75 |
| Stake Mode | stake |
| Stake Value | $100 USD |
| Payout Higher | $195.00 (95%) |
| Payout Lower | $195.00 (95%) |

### 3.2 Trade Card (Resultado)

| Campo | Valor |
|-------|-------|
| Trade ID | TRD-{random} |
| Asset | BTC/USD |
| Direction | higher |
| Stake | $100.00 |
| Payout | $195.00 |
| Barrier | 772,009.31 |
| Expiry | 28 Jan 2026, 23:59:59 |
| Status | open |

---

## 4. Mock Simulation Scenarios (`mockSimulation.ts`)

### 4.1 Buy (keywords: buy, comprar, purchase)

| Campo | Valor |
|-------|-------|
| Asset | BTC/USD |
| Barrier | 42,500.00 |
| Spot | 42,350.75 |
| Stake | $1,000 USD |
| Payout | $1,950.00 (95%) |

### 4.2 Sell (keywords: sell, vender)

| Campo | Valor |
|-------|-------|
| Asset | ETH/USD |
| Barrier | 2,350.00 |
| Spot | 2,340.50 |
| Stake | $500 USD |
| Payout | $975.00 (95%) |

### 4.3 Swap (keywords: swap, trocar, exchange, convert)

| Campo | Valor |
|-------|-------|
| Asset | ETH/USDC |
| Barrier | 2,400.00 |
| Spot | 2,380.25 |
| Stake | $2,850 USD |
| Payout | $5,557.50 (95%) |

### 4.4 Bot (keywords: bot, automate, automatizar)

| Campo | Valor |
|-------|-------|
| Bot ID | BOT-{random} |
| Name | DCA Master |
| Strategy | Dollar-cost averaging with weekly intervals |
| Status | active |
| Performance | +12.5% |

### 4.5 Portfolio (keywords: portfolio, carteira, balance, saldo, holdings)

> Mesmos dados da Seção 2.2

---

## 5. Bot Defaults

| Campo | Valor |
|-------|-------|
| Bot ID | BOT-{random} |
| Bot Name | DCA Bitcoin Weekly |
| Strategy | Dollar Cost Averaging |
| Status | active |
| Performance | +12.5% |
| Trigger | Weekly (Monday) |
| Action | Buy BTC |
| Target | Amount $100 |

> Fontes: `ChatMessages.tsx`, `BotCardCreator.tsx`, `BotCard.tsx`

---

## 6. Action Defaults

| Campo | Valor |
|-------|-------|
| Action ID | ACT-{random} |
| Action Name | Price Alert BTC |
| Description | Alert when BTC reaches target |
| Status | active |
| Trigger | price ($50,000) |
| Action | Alert BTC |
| Schedule | once @ 09:00 |

> Fontes: `ChatMessages.tsx`, `ActionsCardCreator.tsx`, `ActionsCard.tsx`

---

## 7. Agentes Disponíveis (UserPreferencesModal)

| ID | Nome | Descrição Resumida |
|----|------|--------------------|
| risk | Risk Analysis Agent | Tolerância a risco, stop-loss, position sizing |
| portfolio | Portfolio Manager | Alocação alvo, rebalanceamento, diversificação |
| trader | Trader Agent | Tipos de ordem, timing, slippage |
| bot | Bot Creator Agent | Regras de automação, entry/exit, profit targets |
| action | Action Creator Agent | Ações automatizadas, alertas, triggers |
| market | Market Analyses Agent | Indicadores técnicos, timeframes, sinais |

---

## 8. Hub View — Plataformas e Contas MT5

### 8.1 Plataformas

| ID | Nome | Descrição |
|----|------|-----------|
| deriv-trader | Deriv Trader | Options and multipliers |
| deriv-bot | Deriv Bot | Bot trading |
| smart-trader | SmartTrader | Legacy options |
| deriv-go | Deriv GO | Mobile multipliers/accumulators |

### 8.2 Contas MT5

| ID | Nome | Short | Descrição |
|----|------|-------|-----------|
| standard | Standard | STD | CFDs on derived and financial |
| financial | Financial | FIN | CFDs on financial |
| financial-stp | Financial STP | STP | Direct market access |
| swap-free | Swap-Free | SWF | Swap-free CFDs |
| zero-spread | Zero Spread | ZRS | Zero spread CFDs |
| gold | Gold (NEW) | GLD | Precious metals |

---

## 9. Constantes de UI

| Constante | Valor | Uso |
|-----------|-------|-----|
| Brand Red | `#ff444f` | Botões, acentos, alertas |
| Positive Green | `#00d0a0` | Lucro, alta, status positivo |
| User Avatar URL | (ver Seção 1) | Chat, sidebar, cashier |
