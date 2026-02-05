# Dynamic Card Titles - Tasks

## Task List

- [x] 1. Update Placeholder Regex and Parsing
  - [x] 1.1 Update `PLACEHOLDER_REGEX` in `placeholderRules.ts` to capture optional title
  - [x] 1.2 Create `findPlaceholdersWithTitles` function that returns `{ placeholder, title }[]`
  - [x] 1.3 Export new regex and function for use in ChatMessages

- [x] 2. Update Card Creation in ChatMessages.tsx
  - [x] 2.1 Update `parseMessageWithPlaceholders` to use new regex and extract title
  - [x] 2.2 Update `MessagePart` type to include optional `title` field
  - [x] 2.3 Update `getDefaultPayloadForCard` to accept optional `title` parameter
  - [x] 2.4 Update `createMockCard` to include title in payload
  - [x] 2.5 Pass title through `InlineCard` to `addCardToPanel`

- [x] 3. Update Card Components to Use Dynamic Title
  - [x] 3.1 Update `ActionsCard.tsx` to use `payload.title || payload.name || 'Unnamed Action'`
  - [x] 3.2 Update `ActionsCardCreator.tsx` to use `payload.title || payload.actionName || 'New Action'`
  - [x] 3.3 Update `BotCard.tsx` to use `payload.title || payload.name || 'Unnamed Bot'`
  - [x] 3.4 Update `BotCardCreator.tsx` to use `payload.title || payload.botName || 'New Bot Strategy'`
  - [x] 3.5 Update `PortfolioTableCardComplete.tsx` to use `payload.title || 'Portfolio Complete'`
  - [x] 3.6 Update `PortfolioSnapshotCard.tsx` to use `payload.title || 'Portfolio'`
  - [x] 3.7 Update `CreateTradeCard.tsx` to use `payload.title || payload.asset || 'BTC/USD'`
  - [x] 3.8 Update `TradeCard.tsx` to use `payload.title || payload.asset || 'BTC/USD'`

## Implementation Notes

### Task 1: Regex Update
Current regex: `/\[\[([A-Z_]+)\]\]/g`
New regex: `/\[\[([A-Z_]+)\]\](?::"([^"]*)")?/g`

The new regex:
- Group 1: Placeholder name (e.g., `PORTFOLIO_TABLE`)
- Group 2: Optional title between quotes (e.g., `Meu Portfolio`)

### Task 2: Flow
1. LLM returns: `[[PORTFOLIO_TABLE]]:"Minha Carteira"`
2. Parser extracts: `{ placeholder: '[[PORTFOLIO_TABLE]]', title: 'Minha Carteira' }`
3. Card created with: `payload.title = 'Minha Carteira'`
4. Siamese sync happens automatically via existing `updateCardPayload`

### Task 3: Title Priority
Each card uses: `payload.title || existingFallback`
- Title from LLM takes precedence
- Existing hardcoded value serves as fallback
- No visual change if LLM doesn't provide title
