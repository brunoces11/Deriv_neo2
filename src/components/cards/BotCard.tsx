import { useState, useRef, useEffect } from 'react';
import { Bot, Play, Pause, MoreVertical, ChevronDown, ChevronUp, Pencil, Trash2, Calendar, Star, TrendingUp, TrendingDown, Settings, Save, RotateCcw } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard, BotCardPayload } from '../../types';

interface BotCardProps {
  card: BaseCard;
}

/**
 * BotCard Component
 * 
 * Card for managing active/existing bots.
 * Compact mode: Play/Pause, Dropdown Menu (3 dots), Expand
 * Expanded mode: Shows visual flowchart of bot configuration with edit buttons
 * Dropdown contains: Favorite, Edit, Delete, Schedule
 */
export function BotCard({ card }: BotCardProps) {
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard } = useChat();
  const payload = card.payload as unknown as BotCardPayload;
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

  const botId = payload?.botId || 'BOT-000';
  const name = payload?.name || 'Unnamed Bot';
  const status = payload?.status || 'stopped';
  const performance = payload?.performance;
  
  // Bot configuration data (from payload or defaults)
  const trigger = payload?.trigger || { type: 'Weekly', value: 'Monday' };
  const action = payload?.action || { type: 'Buy', asset: 'BTC' };
  const target = payload?.target || { type: 'Amount', value: '$100' };
  const condition = payload?.condition;

  // Sync isPlaying with status on mount
  useEffect(() => {
    setIsPlaying(status === 'active');
  }, [status]);

  const isPositivePerformance = performance?.startsWith('+');

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log(`[BotCard] Toggle play/pause:`, { botId, name, newState: !isPlaying ? 'playing' : 'paused' });
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
    console.log('[BotCard] Edit bot:', { botId, name });
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    console.log('[BotCard] Delete bot:', { botId, name });
    setIsDropdownOpen(false);
  };

  const handleSchedule = () => {
    console.log('[BotCard] Schedule bot:', { botId, name });
    setIsDropdownOpen(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSaveChanges = () => {
    console.log('[BotCard] Save changes:', { botId, name, trigger, action, target, condition });
  };

  const handleEditConfig = () => {
    console.log('[BotCard] Edit config:', { botId, name });
  };

  const handleResetConfig = () => {
    console.log('[BotCard] Reset config:', { botId, name });
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
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-amber-500" />
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

          {/* Line 2: Status + Performance */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium ${isPlaying ? 'text-[#00d0a0]' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {isPlaying ? 'Active' : 'Stopped'}
            </span>
            {performance && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                isPositivePerformance ? 'text-[#00d0a0]' : 'text-[#ff444f]'
              }`}>
                {isPositivePerformance ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {performance}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Compact: Play/Pause, Dropdown, Expand */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Start'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-[#00d0a0]/20 text-[#00d0a0] hover:bg-[#00d0a0]/30'
                : theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-400'
            }`}
          >
            {isPlaying ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
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

            {/* Top Row: Trigger → Action → Target */}
            <div className="relative flex items-center justify-center gap-2 mb-4">
              {/* Trigger Box */}
              <FlowBox 
                label="Trigger" 
                value={trigger.value ? `${trigger.type} (${trigger.value})` : trigger.type}
                colorClass={theme === 'dark' 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-cyan-50 border-cyan-300 text-cyan-700'
                }
              />

              {/* Arrow */}
              <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

              {/* Action Box */}
              <FlowBox 
                label="Action" 
                value={`${action.type} ${action.asset}`}
                colorClass={theme === 'dark' 
                  ? 'bg-[#00d0a0]/10 border-[#00d0a0]/30 text-[#00d0a0]' 
                  : 'bg-green-50 border-green-300 text-green-700'
                }
              />

              {/* Arrow */}
              <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

              {/* Target Box */}
              <FlowBox 
                label="Target" 
                value={target.value}
                colorClass={theme === 'dark' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-amber-50 border-amber-300 text-amber-700'
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
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                      : 'bg-orange-50 border-orange-300 text-orange-700'
                    }
                  />
                </div>
              </>
            )}

            {/* Flow summary text */}
            <div className={`text-center mt-4 text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              {condition 
                ? `When ${trigger.type.toLowerCase()}, if ${condition.type.toLowerCase()} ${condition.operator} ${condition.value}, then ${action.type.toLowerCase()} ${action.asset} (${target.value})`
                : `When ${trigger.type.toLowerCase()}, ${action.type.toLowerCase()} ${action.asset} (${target.value})`
              }
            </div>
          </div>

          {/* Bot Info */}
          <div className={`mt-3 flex items-center justify-between text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
            <span>ID: {botId}</span>
            {performance && (
              <span className={isPositivePerformance ? 'text-[#00d0a0]' : 'text-[#ff444f]'}>
                Performance: {performance}
              </span>
            )}
          </div>

          {/* Edit Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSaveChanges}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00d0a0] hover:bg-[#00d0a0]/90 text-white font-medium text-sm transition-colors shadow-lg shadow-[#00d0a0]/20"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleEditConfig}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleResetConfig}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
