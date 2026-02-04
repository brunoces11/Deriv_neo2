import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronDown, ChevronUp, Star, Pencil, Trash2, Calendar } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard } from '../../types';

interface CardMenuActionsProps {
  card: BaseCard;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showExpand?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onDropdownChange?: (isOpen: boolean) => void;
}

/**
 * CardMenuActions Component
 * 
 * Reusable component for card action buttons:
 * - Three dots dropdown menu (Favorite, Edit, Delete, Schedule)
 * - Expand/Collapse button
 */
export function CardMenuActions({ 
  card, 
  isExpanded = false, 
  onToggleExpand,
  showExpand = true,
  onEdit,
  onDelete,
  onSchedule,
  onDropdownChange,
}: CardMenuActionsProps) {
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to update dropdown state and notify parent
  const updateDropdownState = (open: boolean) => {
    setIsDropdownOpen(open);
    onDropdownChange?.(open);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        updateDropdownState(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFavorite = () => {
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
    updateDropdownState(false);
  };

  const handleEdit = () => {
    onEdit?.();
    updateDropdownState(false);
  };

  const handleDelete = () => {
    updateDropdownState(false);
    // Call onDelete after closing dropdown to avoid state updates on unmounted component
    onDelete?.();
  };

  const handleSchedule = () => {
    onSchedule?.();
    updateDropdownState(false);
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Dropdown Menu (3 dots) */}
      <div className={`relative ${isDropdownOpen ? 'z-[9999]' : ''}`} ref={dropdownRef}>
        <button
          onClick={() => updateDropdownState(!isDropdownOpen)}
          title="More options"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-[9999] ${
            theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700'
              : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={handleFavorite}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-4 h-4 ${card.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
              {card.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
            </button>
            <button
              onClick={handleEdit}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSchedule}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {showExpand && onToggleExpand && (
        <button
          onClick={onToggleExpand}
          title={isExpanded ? 'Collapse' : 'Expand'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
