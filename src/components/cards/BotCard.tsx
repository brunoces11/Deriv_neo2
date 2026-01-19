import { Bot, Play, Pause, Square, TrendingUp } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import type { BaseCard, BotPayload } from '../../types';

interface BotCardProps {
  card: BaseCard;
}

const statusConfig = {
  active: { icon: Play, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Active', dot: 'bg-red-500' },
  paused: { icon: Pause, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Paused', dot: 'bg-amber-500' },
  stopped: { icon: Square, color: 'text-zinc-500', bg: 'bg-zinc-500/10', label: 'Stopped', dot: 'bg-zinc-500' },
};

export function BotCard({ card }: BotCardProps) {
  const payload = card.payload as unknown as BotPayload;
  const status = statusConfig[payload.status] || statusConfig.stopped;
  const StatusIcon = status.icon;

  return (
    <CardWrapper card={card} accentColor="amber">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 relative">
          <Bot className="w-5 h-5 text-amber-500" />
          {payload.status === 'active' && (
            <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse ring-2 ring-zinc-900`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">
              Trading Bot
            </span>
            <span className="text-xs text-zinc-600 font-mono">
              {payload.botId}
            </span>
          </div>

          <h3 className="text-white font-medium mb-1">{payload.name}</h3>
          <p className="text-sm text-zinc-500 mb-3">{payload.strategy}</p>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
              <span className={`text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>

            {payload.performance && (
              <div className="flex items-center gap-1 text-red-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{payload.performance}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
