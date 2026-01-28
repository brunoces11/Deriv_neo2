import { TrendingUp, Clock, CheckCircle, XCircle, Circle } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, PositionsCardPayload, Position } from '../../types';

interface PositionsCardProps {
  card: BaseCard;
}

/**
 * PositionsCard Component
 * 
 * Displays a list of active trading positions in a compact, scannable format.
 * Each position shows asset info, contract type, stake/payout, time remaining, and status.
 * 
 * Status color coding:
 * - Open: Neutral/cyan indicator
 * - Won: Green indicator (#00d0a0)
 * - Lost: Red indicator (#ff444f)
 */
export function PositionsCard({ card }: PositionsCardProps) {
  const { theme } = useTheme();
  const payload = card.payload as unknown as PositionsCardPayload;
  const positions = payload?.positions || [];

  /**
   * Get status icon component based on position status
   */
  const getStatusIcon = (status: Position['status']) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-3.5 h-3.5 text-[#00d0a0]" />;
      case 'lost':
        return <XCircle className="w-3.5 h-3.5 text-[#ff444f]" />;
      case 'open':
      default:
        return <Circle className="w-3.5 h-3.5 text-cyan-500" />;
    }
  };

  /**
   * Get status badge styling based on position status
   */
  const getStatusBadgeClasses = (status: Position['status']) => {
    switch (status) {
      case 'won':
        return 'bg-[#00d0a0]/10 text-[#00d0a0]';
      case 'lost':
        return 'bg-[#ff444f]/10 text-[#ff444f]';
      case 'open':
      default:
        return theme === 'dark' 
          ? 'bg-cyan-500/10 text-cyan-400' 
          : 'bg-cyan-500/10 text-cyan-600';
    }
  };

  /**
   * Format contract type for display (capitalize first letter)
   */
  const formatContractType = (type: Position['contractType']) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  return (
    <CardWrapper card={card} accentColor="cyan">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-cyan-500 uppercase tracking-wider block">
              Active Positions
            </span>
            <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {positions.length} {positions.length === 1 ? 'Position' : 'Positions'}
            </h3>
          </div>
        </div>

        {/* Positions List */}
        {positions.length === 0 ? (
          <div className={`text-center py-4 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            No active positions
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((position) => (
              <div
                key={position.id}
                className={`rounded-lg p-3 border transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/50'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Position Row 1: Asset, Contract Type, Stake → Payout */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {position.asset}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {formatContractType(position.contractType)}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                    {position.stake} → {position.payout}
                  </div>
                </div>

                {/* Position Row 2: Status Badge, Time/Profit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(position.status)}
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getStatusBadgeClasses(position.status)}`}>
                      {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {position.status === 'open' ? (
                      <>
                        <Clock className={`w-3 h-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
                        <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                          Expires: {position.timeRemaining}
                        </span>
                      </>
                    ) : (
                      <>
                        {position.profit && (
                          <span className={`text-xs font-semibold ${
                            position.status === 'won' ? 'text-[#00d0a0]' : 'text-[#ff444f]'
                          }`}>
                            {position.profit}
                          </span>
                        )}
                        <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                          Completed
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Asset Name (subtle) */}
                <div className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                  {position.assetName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
