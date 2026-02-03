/**
 * Placeholder-Based Card Rendering Rules
 * 
 * This file contains all rules for mapping [[PLACEHOLDER]] patterns
 * to card rendering configurations based on the current view mode.
 */

// ============================================================================
// Types
// ============================================================================

export type ViewMode = 'chat' | 'graph' | 'dashboard' | 'hub';
export type PanelTab = 'cards' | 'actions' | 'bots' | 'positions';
export type VisualState = 'expanded' | 'compacted';

// Card type names used in the rendering system
export type RenderCardType = 
  | 'portfolio-table-complete'
  | 'portfolio-snapshot'
  | 'portfolio-sidebar'
  | 'create-trade-card'
  | 'trade-card'
  | 'bot-creator'
  | 'bot-card'
  | 'actions-creator'
  | 'actions-card';

export interface RenderAction {
  cardType: RenderCardType;
  location: 'inline' | 'panel';
  panel?: PanelTab;
  visualState: VisualState;
}

export interface ModeConfig {
  inline: RenderAction;
  panel: RenderAction;
}

export interface PlaceholderRule {
  chatmode: ModeConfig;
  otherModes: ModeConfig; // graph | dashboard | hub
}

// ============================================================================
// Level 1 Rules - Rendering
// ============================================================================

export const PLACEHOLDER_RULES: Record<string, PlaceholderRule> = {
  '[[PORTFOLIO_TABLE]]': {
    chatmode: {
      inline: { cardType: 'portfolio-table-complete', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'portfolio-snapshot', location: 'panel', panel: 'cards', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'portfolio-snapshot', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'portfolio-snapshot', location: 'panel', panel: 'cards', visualState: 'compacted' }
    }
  },
  '[[CREATE_TRADE_CARD]]': {
    chatmode: {
      inline: { cardType: 'create-trade-card', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'create-trade-card', location: 'panel', panel: 'positions', visualState: 'expanded' }
    },
    otherModes: {
      inline: { cardType: 'create-trade-card', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'create-trade-card', location: 'panel', panel: 'positions', visualState: 'expanded' }
    }
  },
  '[[CREATE_BOT_CARD]]': {
    chatmode: {
      inline: { cardType: 'bot-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'bot-creator', location: 'panel', panel: 'bots', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'bot-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'bot-creator', location: 'panel', panel: 'bots', visualState: 'compacted' }
    }
  },
  '[[CREATE_ACTION_CARD]]': {
    chatmode: {
      inline: { cardType: 'actions-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'actions-creator', location: 'panel', panel: 'actions', visualState: 'compacted' }
    },
    otherModes: {
      inline: { cardType: 'actions-creator', location: 'inline', visualState: 'expanded' },
      panel: { cardType: 'actions-creator', location: 'panel', panel: 'actions', visualState: 'compacted' }
    }
  }
};

// ============================================================================
// Level 2 Rules - Card Transformations
// ============================================================================

export interface CardTransformation {
  fromCard: RenderCardType;
  toCard: RenderCardType;
  trigger: string;
  payloadTransform?: (creatorPayload: Record<string, unknown>, action: string) => Record<string, unknown>;
}

export const CARD_TRANSFORMATIONS: CardTransformation[] = [
  {
    fromCard: 'create-trade-card',
    toCard: 'trade-card',
    trigger: 'onHigher',
    payloadTransform: (payload) => ({
      ...payload,
      direction: 'higher',
      status: 'open',
      tradeId: `TRD-${Date.now()}`
    })
  },
  {
    fromCard: 'create-trade-card',
    toCard: 'trade-card',
    trigger: 'onLower',
    payloadTransform: (payload) => ({
      ...payload,
      direction: 'lower',
      status: 'open',
      tradeId: `TRD-${Date.now()}`
    })
  },
  {
    fromCard: 'bot-creator',
    toCard: 'bot-card',
    trigger: 'onDeployBot',
    payloadTransform: (payload) => ({
      ...payload,
      status: 'active',
      botId: `BOT-${Date.now()}`
    })
  },
  {
    fromCard: 'actions-creator',
    toCard: 'actions-card',
    trigger: 'onDeployAction',
    payloadTransform: (payload) => ({
      ...payload,
      status: 'active',
      actionId: `ACT-${Date.now()}`
    })
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get rendering configuration for a placeholder based on current view mode
 */
export function getRuleForMode(placeholder: string, mode: ViewMode): ModeConfig | null {
  const rule = PLACEHOLDER_RULES[placeholder];
  if (!rule) return null;
  return mode === 'chat' ? rule.chatmode : rule.otherModes;
}

/**
 * Transform a card from creator to result type
 */
export function transformCard(
  fromType: RenderCardType,
  trigger: string,
  currentPayload: Record<string, unknown>
): { newType: RenderCardType; newPayload: Record<string, unknown> } | null {
  const transformation = CARD_TRANSFORMATIONS.find(
    t => t.fromCard === fromType && t.trigger === trigger
  );
  
  if (!transformation) return null;
  
  return {
    newType: transformation.toCard,
    newPayload: transformation.payloadTransform 
      ? transformation.payloadTransform(currentPayload, trigger)
      : currentPayload
  };
}

// ============================================================================
// Regex and Validation
// ============================================================================

/** Regex to detect [[PLACEHOLDER]] patterns in text */
export const PLACEHOLDER_REGEX = /\[\[([A-Z_]+)\]\]/g;

/** List of valid placeholder names */
export const VALID_PLACEHOLDERS = Object.keys(PLACEHOLDER_RULES);

/**
 * Find all placeholders in a text string
 */
export function findPlaceholdersInText(text: string): string[] {
  const found: string[] = [];
  let match;
  
  // Reset regex state
  PLACEHOLDER_REGEX.lastIndex = 0;
  
  while ((match = PLACEHOLDER_REGEX.exec(text)) !== null) {
    const placeholder = `[[${match[1]}]]`;
    if (VALID_PLACEHOLDERS.includes(placeholder) && !found.includes(placeholder)) {
      found.push(placeholder);
    }
  }
  
  return found;
}
