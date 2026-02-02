import { useState, useRef, useEffect } from 'react';
import { Zap, Play, Pause, MoreVertical, ChevronDown, ChevronUp, Pencil, Trash2, Calendar, Star } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard, ActionsCardPayload } from '../../types';

interface ActionsCardProps {
  card: BaseCard;
}

/**
 * ActionsCard Component
 * 
 * Displays a configured action with management buttons.
 * Compact mode: Play/Pause, Dropdown Menu (3 dots), Expand
 * Dropdown contains: Favorite, Edit, Delete, Schedule
 */
export function ActionsCard({ card }: ActionsCardProps) {
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard } = useChat();
  const payload = card.payload as unknown as ActionsCardPayload;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actionId = payload?.actionId || 'ACT-000';
  const name = payload?.name || 'Unnamed Action';
  const status = payload?.status || 'inactive';
  const lastExecution = payload?.lastExecution;

  // Sync isPlaying with status on mount
  useEffect(() => {
    setIsPlaying(status === 'active');
  }, [status]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log('[ActionsCard] Toggle play/pause:', { actionId, name, newState: !isPlaying ? 'playing' : 'paused' });
  };

  const handleFavorite = () => {
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
    setIsDropdownOpen(false);
  };

  const handleEdit = () => {
    console.log('[ActionsCard] Edit action:', { actionId, name });
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    console.log('[ActionsCard] Delete action:', { actionId, name });
    setIsDropdownOpen(false);
  };

  const handleSchedule = () => {
    console.log('[ActionsCard] Schedule action:', { actionId, name });
    setIsDropdownOpen(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <CardWrapper card={card} accentColor="amber">
      <div className="flex items-center gap-3">
        {/* Icon with status dot overlay */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          {/* Status dot - top right */}
          <div 
            className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
              theme === 'dark' ? 'border-zinc-900' : 'border-white'
            } ${isPlaying ? 'bg-[#00d0a0]' : theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
          />
        </div>

        {/* Content - 2 lines only */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Name */}
          <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </h3>

          {/* Line 2: Status + Last Execution */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium ${isPlaying ? 'text-[#00d0a0]' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {isPlaying ? 'Active' : 'Inactive'}
            </span>
            {lastExecution && (
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Last run: {formatDate(lastExecution)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Compact: Play/Pause, Dropdown, Expand */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-[#00d0a0]/20 text-[#00d0a0] hover:bg-[#00d0a0]/30'
                : theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-400'
            }`}
          >
            {isPlaying ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Dropdown Menu (3 dots) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
              <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-50 ${
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
          <button
            onClick={toggleExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
          <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            <p>Action ID: {actionId}</p>
            {lastExecution && <p className="mt-1">Last execution: {formatDate(lastExecution)}</p>}
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
