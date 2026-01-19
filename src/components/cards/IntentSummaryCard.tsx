import { FileText, ArrowRight } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import type { BaseCard, IntentSummaryPayload } from '../../types';

interface IntentSummaryCardProps {
  card: BaseCard;
}

export function IntentSummaryCard({ card }: IntentSummaryCardProps) {
  const payload = card.payload as unknown as IntentSummaryPayload;

  return (
    <CardWrapper card={card} accentColor="cyan">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-cyan-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-cyan-500 uppercase tracking-wider">
              Intent
            </span>
          </div>

          <h3 className="text-white font-medium mb-2">{payload.action}</h3>

          {(payload.asset || payload.value) && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
              {payload.asset && <span>{payload.asset}</span>}
              {payload.asset && payload.value && (
                <ArrowRight className="w-3 h-3 text-zinc-600" />
              )}
              {payload.value && (
                <span className="text-emerald-400">{payload.value}</span>
              )}
            </div>
          )}

          <p className="text-sm text-zinc-500 leading-relaxed">
            {payload.summary}
          </p>
        </div>
      </div>
    </CardWrapper>
  );
}
