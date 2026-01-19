import { Zap, ArrowUpRight, ArrowDownRight, RefreshCw, ArrowRightLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import type { BaseCard, ActionTicketPayload } from '../../types';

interface ActionTicketCardProps {
  card: BaseCard;
}

const actionIcons = {
  buy: ArrowUpRight,
  sell: ArrowDownRight,
  transfer: RefreshCw,
  swap: ArrowRightLeft,
};

const actionColors = {
  buy: 'red',
  sell: 'rose',
  transfer: 'amber',
  swap: 'cyan',
};

const statusConfig = {
  pending: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
  executing: { icon: Loader2, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Executing' },
  completed: { icon: CheckCircle2, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Failed' },
};

export function ActionTicketCard({ card }: ActionTicketCardProps) {
  const payload = card.payload as unknown as ActionTicketPayload;
  const ActionIcon = actionIcons[payload.action] || Zap;
  const accentColor = actionColors[payload.action] || 'red';
  const status = statusConfig[payload.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const colorClasses: Record<string, { iconBg: string; iconColor: string }> = {
    red: { iconBg: 'bg-red-500/10', iconColor: 'text-red-500' },
    rose: { iconBg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
    amber: { iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    cyan: { iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-500' },
  };

  const colors = colorClasses[accentColor] || colorClasses.red;

  return (
    <CardWrapper card={card} accentColor={accentColor}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
          <ActionIcon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-medium ${colors.iconColor} uppercase tracking-wider`}>
              {payload.action}
            </span>
            <span className="text-xs text-zinc-600 font-mono">
              {payload.ticketId}
            </span>
          </div>

          <h3 className="text-white font-medium mb-2">{payload.asset}</h3>

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">
              {payload.amount}
            </span>

            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.color} ${payload.status === 'pending' || payload.status === 'executing' ? 'animate-spin' : ''}`} />
              <span className={`text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
