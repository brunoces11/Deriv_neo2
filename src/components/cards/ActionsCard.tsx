import { Zap, Play, Pencil, Trash2, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
 */
export function ActionsCard({ card }: ActionsCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as ActionsCardPayload;

  const actionId = payload?.actionId || 'ACT-000';
  const name = payload?.name || 'Unnamed Action';
  const description = payload?.description || 'No description';
  const status = payload?.status || 'inactive';
  const lastExecution = payload?.lastExecution;

  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Active',
    },
    inactive: {
      icon: XCircle,
      color: 'text-zinc-500',
      bgColor: theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200',
      label: 'Inactive',
    },
    error: {
      icon: AlertCircle,
      color: 'text-[#ff444f]',
      bgColor: 'bg-[#ff444f]/10',
      label: 'Error',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.inactive;
  const StatusIcon = currentStatus.icon;

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
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-amber-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label + ID */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">
              Action
            </span>
            <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              {actionId}
            </span>
          </div>

          {/* Name */}
          <h3 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </h3>

          {/* Description */}
          <p className={`text-xs mb-2 line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {description}
          </p>

          {/* Status + Last Execution */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${currentStatus.bgColor}`}>
              <StatusIcon className={`w-3 h-3 ${currentStatus.color}`} />
              <span className={`text-[10px] font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            {lastExecution && (
              <span className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
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
