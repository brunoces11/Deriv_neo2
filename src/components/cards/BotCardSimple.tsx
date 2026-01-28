import { Bot, Play, Pause, Pencil, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, BotSimplePayload } from '../../types';

interface BotCardSimpleProps {
  card: BaseCard;
}

/**
 * BotCardSimple Component
 * 
 * Simple card for managing active/existing bots.
 * Similar to ActionsCard with 4 action buttons aligned to the right.
 */
export function BotCardSimple({ card }: BotCardSimpleProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as BotSimplePayload;

  const botId = payload?.botId || 'BOT-000';
  const name = payload?.name || 'Unnamed Bot';
  const strategy = payload?.strategy || 'No strategy defined';
  const status = payload?.status || 'stopped';
  const performance = payload?.performance;

  const statusConfig = {
    active: {
      color: 'text-[#00d0a0]',
      bgColor: 'bg-[#00d0a0]/10',
      dotColor: 'bg-[#00d0a0]',
      label: 'Active',
      animate: true,
    },
    paused: {
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      dotColor: 'bg-amber-500',
      label: 'Paused',
      animate: false,
    },
    stopped: {
      color: theme === 'dark' ? 'text-zinc-500' : 'text-gray-500',
      bgColor: theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200',
      dotColor: theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400',
      label: 'Stopped',
      animate: false,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.stopped;
  const isPositivePerformance = performance?.startsWith('+');

  const handlePlayPause = () => {
    const action = status === 'active' ? 'pause' : 'start';
    console.log(`[BotCardSimple] ${action} bot:`, { botId, name });
  };

  const handleEdit = () => {
    console.log('[BotCardSimple] Edit bot:', { botId, name });
  };

  const handleDelete = () => {
    console.log('[BotCardSimple] Delete bot:', { botId, name });
  };

  const handleSchedule = () => {
    console.log('[BotCardSimple] Schedule bot:', { botId, name });
  };

  return (
    <CardWrapper card={card} accentColor="amber">
      <div className="flex items-start gap-3">
        {/* Icon with status dot */}
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-amber-500" />
          </div>
          {/* Status dot */}
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
              theme === 'dark' ? 'border-zinc-900' : 'border-white'
            } ${currentStatus.dotColor} ${currentStatus.animate ? 'animate-pulse' : ''}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label + ID */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">
              Trading Bot
            </span>
            <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              {botId}
            </span>
          </div>

          {/* Name */}
          <h3 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </h3>

          {/* Strategy */}
          <p className={`text-xs mb-2 line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {strategy}
          </p>

          {/* Status + Performance */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${currentStatus.bgColor}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotColor}`} />
              <span className={`text-[10px] font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
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
