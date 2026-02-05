/**
 * Service for tracking permanently deleted cards
 * 
 * When a card is deleted, its ID is stored in localStorage to prevent
 * it from being recreated when the page is refreshed (since placeholders
 * in messages would otherwise recreate the cards).
 */

const DELETED_CARDS_STORAGE_KEY = 'deriv-neo-deleted-cards';

// Global set of deleted card IDs (loaded from localStorage)
let deletedCardsSet: Set<string> | null = null;

function getDeletedCardsSet(): Set<string> {
  if (deletedCardsSet !== null) {
    return deletedCardsSet;
  }
  
  try {
    const stored = localStorage.getItem(DELETED_CARDS_STORAGE_KEY);
    if (stored) {
      deletedCardsSet = new Set(JSON.parse(stored));
    } else {
      deletedCardsSet = new Set();
    }
  } catch {
    // Ignore parse errors
    deletedCardsSet = new Set();
  }
  
  return deletedCardsSet;
}

function saveDeletedCardsSet(): void {
  const set = getDeletedCardsSet();
  try {
    localStorage.setItem(DELETED_CARDS_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Mark a card as permanently deleted
 * This prevents the card from being recreated when the page is refreshed
 */
export function markCardAsDeleted(cardId: string): void {
  // Get the base ID for consistent tracking (remove 'panel-' prefix)
  const baseId = cardId.replace(/^panel-/, '');
  const set = getDeletedCardsSet();
  set.add(baseId);
  saveDeletedCardsSet();
  console.log('[deletedCardsStorage] Card marked as permanently deleted:', baseId);
}

/**
 * Check if a card was permanently deleted
 */
export function isCardDeleted(cardId: string): boolean {
  const baseId = cardId.replace(/^panel-/, '');
  return getDeletedCardsSet().has(baseId);
}

/**
 * Clear all deleted cards (useful for testing or reset)
 */
export function clearDeletedCards(): void {
  deletedCardsSet = new Set();
  try {
    localStorage.removeItem(DELETED_CARDS_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
