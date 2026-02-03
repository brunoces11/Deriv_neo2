import { useState, useRef, useEffect } from 'react';
import { Zap, Play, Pause, MoreVertical, ChevronDown, ChevronUp, Pencil, Trash2, Calendar, Star, Settings, Save, RotateCcw } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard, ActionsCardPayload } from '../../types';

interface ActionsCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

/**
 * ActionsCard Component
 * 
 * Displays a configured action with management buttons.
 * Compact mode: Play/Pause, Dropdown Menu (3 dots), Expand
 * Expanded mode: Shows visual flowchart of action configuration with edit buttons
 * Dropdown contains: Favorite, Edit, Delete, Schedule
 */
export function ActionsCard({ card, defaultExpanded = false }: ActionsCardProps) {
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard, deleteCardWithTwin } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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

  // Sync isPlaying with status on mount - safe access to payload
  const payload = card?.payload as unknown as ActionsCardPayload | undefined;
  const status = payload?.status || 'inactive';
  
  useEffect(() => {
    setIsPlaying(status === 'active');
  }, [status]);
  
  // Guard against invalid card - MUST be after all hooks
  if (!card || !card.id) {
    return null;
  }

  const actionId = payload?.actionId || 'ACT-000';
  const name = payload?.name || 'Unnamed Action';
  const lastExecution = payload?.lastExecution;
  
  // Action configuration data (from payload or defaults)
  const trigger = payload?.trigger || { type: 'schedule' as const, value: 'Daily' };
  const action = payload?.action || { type: 'Alert', asset: 'BTC' };
  const schedule = payload?.schedule || { frequency: 'daily' as const, time: '09:00' };
  const condition = payload?.condition;

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

  const handleDelete = async () => {
    console.log('[ActionsCard] Delete action (deleting twins):', { actionId, name, cardId: card.id });
    setIsDropdownOpen(false);
    // Call delete after closing dropdown to avoid state updates on unmounted component
    await deleteCardWithTwin(card.id);
  };

  const handleSchedule = () => {
    console.log('[ActionsCard] Schedule action:', { actionId, name });
    setIsDropdownOpen(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSaveChanges = () => {
    console.log('[ActionsCard] Save changes:', { actionId, name, trigger, action, schedule, condition });
  };

  const handleEditConfig = () => {
    console.log('[ActionsCard] Edit config:', { actionId, name });
  };

  const handleResetConfig = () => {
    console.log('[ActionsCard] Reset config:', { actionId, name });
  };

  // Box component for flowchart nodes
  const FlowBox = ({ 
    label, 
    value, 
    colorClass 
  }: { 
    label: string; 
    value: string; 
    colorClass: string;
  }) => (
    <div className={`px-3 py-2 rounded-lg border-2 text-center min-w-[80px] ${colorClass}`}>
      <div className="text-[10px] font-medium uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-xs font-semibold mt-0.5">{value}</div>
    </div>
  );

  return (
    <CardWrapper card={card} accentColor="amber">
      <div className="flex items-center gap-3">
        {/* Icon with status dot overlay */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
            <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
          </div>
          {/* Status dot - top right - Blue when active */}
          <div 
            className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
              theme === 'dark' ? 'border-zinc-900' : 'border-white'
            } ${isPlaying ? 'bg-cyan-500' : theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
          />
        </div>

        {/* Content - 2 lines only */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Name - Always neutral */}
          <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </h3>

          {/* Line 2: Last Run - Subtle gray */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              Last Run: {formatDate(lastExecution || (card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt))}
            </span>
          </div>
        </div>

        {/* Action Buttons - Compact: Play/Pause, Dropdown, Expand */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Play/Pause Button - Blue when active */}
          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30'
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

      {/* Expanded Content - Visual Flowchart */}
      {isExpanded && (
        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
          {/* Flowchart Area */}
          <div className={`rounded-xl p-4 border relative overflow-hidden ${
            theme === 'dark' 
              ? 'bg-zinc-800/30 border-zinc-700/50' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            {/* Grid pattern background */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Top Row: Trigger → Action → Schedule - All neutral gray */}
            <div className="relative flex items-center justify-center gap-2 mb-4">
              {/* Trigger Box */}
              <FlowBox 
                label="Trigger" 
                value={trigger.value ? `${trigger.type} (${trigger.value})` : trigger.type}
                colorClass={theme === 'dark' 
                  ? 'bg-zinc-700/50 border-zinc-600 text-zinc-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
                }
              />

              {/* Arrow */}
              <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

              {/* Action Box */}
              <FlowBox 
                label="Action" 
                value={action.asset ? `${action.type} ${action.asset}` : action.type}
                colorClass={theme === 'dark' 
                  ? 'bg-zinc-700/50 border-zinc-600 text-zinc-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
                }
              />

              {/* Arrow */}
              <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

              {/* Schedule Box */}
              <FlowBox 
                label="Schedule" 
                value={schedule.time ? `${schedule.frequency} @ ${schedule.time}` : schedule.frequency}
                colorClass={theme === 'dark' 
                  ? 'bg-zinc-700/50 border-zinc-600 text-zinc-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
                }
              />
            </div>

            {/* Vertical connector line */}
            {condition && (
              <>
                <div className="flex justify-center">
                  <div className={`w-0.5 h-6 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />
                </div>

                {/* Condition Box */}
                <div className="flex justify-center">
                  <FlowBox 
                    label="Condition" 
                    value={`${condition.type} ${condition.operator} ${condition.value}`}
                    colorClass={theme === 'dark' 
                      ? 'bg-zinc-700/50 border-zinc-600 text-zinc-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                    }
                  />
                </div>
              </>
            )}

            {/* Flow summary text */}
            <div className={`text-center mt-4 text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              {condition 
                ? `${schedule.frequency} at ${schedule.time || 'scheduled time'}, if ${condition.type.toLowerCase()} ${condition.operator} ${condition.value}, then ${action.type.toLowerCase()}${action.asset ? ` ${action.asset}` : ''}`
                : `${schedule.frequency} at ${schedule.time || 'scheduled time'}, ${action.type.toLowerCase()}${action.asset ? ` ${action.asset}` : ''}`
              }
            </div>
          </div>

          {/* Action Info */}
          <div className={`mt-3 flex items-center justify-between text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
            <span>ID: {actionId}</span>
            {lastExecution && (
              <span>Last run: {formatDate(lastExecution)}</span>
            )}
          </div>

          {/* Edit Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleEditConfig}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleResetConfig}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
