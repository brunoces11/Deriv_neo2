import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
 * 
 * Uses React Portal to render dropdown directly in document.body,
 * ensuring it appears above all other UI elements regardless of
 * parent container overflow or stacking context.
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to update dropdown state and notify parent
  const updateDropdownState = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
    onDropdownChange?.(open);
  }, [onDropdownChange]);

  // Calculate dropdown position based on button location
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 160; // w-40 = 10rem = 160px
      
      // Position dropdown below button, aligned to right edge
      setDropdownPosition({
        top: rect.bottom + 4, // 4px gap (mt-1)
        left: rect.right - dropdownWidth, // Align right edges
      });
    }
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
    }
  }, [isDropdownOpen, updateDropdownPosition]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handlePositionUpdate = () => {
      updateDropdownPosition();
    };

    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isDropdownOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnButton = buttonRef.current?.contains(target);
      const isClickOnDropdown = dropdownRef.current?.contains(target);
      
      if (!isClickOnButton && !isClickOnDropdown) {
        updateDropdownState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, updateDropdownState]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        updateDropdownState(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDropdownOpen, updateDropdownState]);

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

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) {
      updateDropdownPosition();
    }
    updateDropdownState(!isDropdownOpen);
  };

  // Dropdown content rendered via Portal
  const dropdownContent = isDropdownOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed w-40 rounded-lg shadow-xl border z-[99999] ${
        theme === 'dark'
          ? 'bg-zinc-800 border-zinc-700'
          : 'bg-white border-gray-200'
      }`}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <button
        onClick={handleFavorite}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
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
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-b-lg ${
          theme === 'dark'
            ? 'text-zinc-300 hover:bg-zinc-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Calendar className="w-4 h-4" />
        Schedule
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Dropdown Menu (3 dots) */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          title="More options"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Content - Rendered via Portal */}
        {dropdownContent}
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
