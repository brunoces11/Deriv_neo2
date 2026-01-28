import { Bot, Play, Pause, Pencil, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, BotCardPayload } from '../../types';

interface BotCardProps {
  card: BaseCard;
}

/**
 * BotCard Component
 * 
 * Card for managing active/existing bots.
 * Features 4 action buttons aligned to the right (Play/Pause, Edit, Delete, Schedule).
 * Simplified 2-line layout: Name + Status/Performance
 */
export function BotCard({ card }: BotCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as BotCardPayload;

  const botId = payload?.botId || 'BOT-000';
  const name = payload?.name || 'Unnamed Bot';
  const status = payload?.status || 'stopped';
  const performance = payload?.performance;

  const isActive = status === 'active';
  const isPositivePerformance = performance?.startsWith('+');

  const statusLabel = status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Stopped';

  const handlePlayPause = () => {
    const action = status === 'active' ? 'pause' : 'start';
    console.log(`[BotCard] ${action} bot:`, { botId, name });
  };

  const handleEdit = () => {
    console.log('[BotCard] Edit bot:', { botId, name });
  };

  const handleDelete = () => {
    console.log('[BotCard] Delete bot:', { botId, name });
  };

  const handleSchedule = () => {
    console.log('[BotCard] Schedule bot:', { botId, name });
  };

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
            } ${isActive ? 'bg-[#00d0a0]' : theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
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
            <span className={`text-xs font-medium ${isActive ? 'text-[#00d0a0]' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {statusLabel}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handlePlayPause}
            title={status === 'active' ? 'Pause' : 'Start'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {status === 'active' ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleEdit}
            title="Edit"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSchedule}
            title="Schedule"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </CardWrapper>
  );
}
