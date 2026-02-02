import { useState } from 'react';
import { Zap, Rocket, Settings, X } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import type { BaseCard, ActionsCreatorPayload } from '../../types';

interface ActionsCardCreatorProps {
  card: BaseCard;
}

/**
 * ActionsCardCreator Component
 * 
 * Visual flowchart/mind-map representation of an action configuration.
 * Shows trigger, action, schedule, and condition boxes connected by lines.
 * Used when AI has mapped user intentions and is ready to deploy a new action.
 */
export function ActionsCardCreator({ card }: ActionsCardCreatorProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const payload = card.payload as unknown as ActionsCreatorPayload;

  const actionName = payload?.actionName || 'New Action';
  const trigger = payload?.trigger || { type: 'schedule', value: 'Daily' };
  const action = payload?.action || { type: 'Alert', asset: 'BTC' };
  const schedule = payload?.schedule || { frequency: 'daily', time: '09:00' };
  const condition = payload?.condition;

  const handleDeploy = () => {
    console.log('[ActionsCardCreator] Deploy action:', { actionName, trigger, action, schedule, condition });
  };

  const handleEditConfig = () => {
    console.log('[ActionsCardCreator] Edit config:', { actionName });
  };

  const handleCancel = () => {
    console.log('[ActionsCardCreator] Cancel action creation:', { actionName });
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider block">
                New Action Configuration
              </span>
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                "{actionName}"
              </h3>
            </div>
          </div>
          <CardMenuActions 
            card={card} 
            isExpanded={isExpanded} 
            onToggleExpand={() => setIsExpanded(!isExpanded)} 
          />
        </div>

        {isExpanded && (
          <>

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

          {/* Top Row: Trigger → Action → Schedule */}
          <div className="relative flex items-center justify-center gap-2 mb-4">
            {/* Trigger Box */}
            <FlowBox 
              label="Trigger" 
              value={trigger.value ? `${trigger.type} (${trigger.value})` : trigger.type}
              colorClass={theme === 'dark' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-amber-50 border-amber-300 text-amber-700'
              }
            />

            {/* Arrow */}
            <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

            {/* Action Box */}
            <FlowBox 
              label="Action" 
              value={action.asset ? `${action.type} ${action.asset}` : action.type}
              colorClass={theme === 'dark' 
                ? 'bg-[#00d0a0]/10 border-[#00d0a0]/30 text-[#00d0a0]' 
                : 'bg-green-50 border-green-300 text-green-700'
              }
            />

            {/* Arrow */}
            <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

            {/* Schedule Box */}
            <FlowBox 
              label="Schedule" 
              value={schedule.time ? `${schedule.frequency} @ ${schedule.time}` : schedule.frequency}
              colorClass={theme === 'dark' 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-cyan-50 border-cyan-300 text-cyan-700'
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
              ? `${schedule.frequency} at ${schedule.time || 'scheduled time'}, if ${condition.type.toLowerCase()} ${condition.operator} ${condition.value}, then ${action.type.toLowerCase()}${action.asset ? ` ${action.asset}` : ''}`
              : `${schedule.frequency} at ${schedule.time || 'scheduled time'}, ${action.type.toLowerCase()}${action.asset ? ` ${action.asset}` : ''}`
            }
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeploy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00d0a0] hover:bg-[#00d0a0]/90 text-white font-medium text-sm transition-colors shadow-lg shadow-[#00d0a0]/20"
          >
            <Rocket className="w-4 h-4" />
            Deploy Action
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
            onClick={handleCancel}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
        </>
        )}
      </div>
    </CardWrapper>
  );
}
