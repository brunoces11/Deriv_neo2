import { Zap, Play, Pencil, Trash2, Calendar } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, ActionsCardPayload } from '../../types';

interface ActionsCardProps {
  card: BaseCard;
}

/**
 * ActionsCard Component
 * 
 * Displays a configured action with management buttons.
 * Actions can be executed, edited, deleted, or scheduled.
 * Simplified 2-line layout: Name + Status/LastRun
 */
export function ActionsCard({ card }: ActionsCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as ActionsCardPayload;

  const actionId = payload?.actionId || 'ACT-000';
  const name = payload?.name || 'Unnamed Action';
  const status = payload?.status || 'inactive';
  const lastExecution = payload?.lastExecution;

  const isActive = status === 'active';

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

  const handleExecute = () => {
    console.log('[ActionsCard] Execute action:', { actionId, name });
  };

  const handleEdit = () => {
    console.log('[ActionsCard] Edit action:', { actionId, name });
  };

  const handleDelete = () => {
    console.log('[ActionsCard] Delete action:', { actionId, name });
  };

  const handleSchedule = () => {
    console.log('[ActionsCard] Schedule action:', { actionId, name });
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
            } ${isActive ? 'bg-[#00d0a0]' : theme === 'dark' ? 'bg-zinc-500' : 'bg-gray-400'}`}
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
            <span className={`text-xs font-medium ${isActive ? 'text-[#00d0a0]' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            {lastExecution && (
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Last run: {formatDate(lastExecution)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleExecute}
            title="Execute"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <Play className="w-4 h-4" />
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
