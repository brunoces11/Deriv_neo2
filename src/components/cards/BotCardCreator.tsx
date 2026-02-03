import { useState } from 'react';
import { Bot, Rocket, Settings, X } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { CardMenuActions } from './CardMenuActions';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import { transformCard as transformCardRule } from '../../services/placeholderRules';
import type { BaseCard, BotCreatorPayload, CardType } from '../../types';

interface BotCardCreatorProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

/**
 * BotCardCreator Component
 * 
 * Visual flowchart/mind-map representation of a bot configuration.
 * Shows trigger, action, target, and condition boxes connected by lines.
 * Used when AI has mapped user intentions and is ready to deploy a new bot.
 */
export function BotCardCreator({ card, defaultExpanded = true }: BotCardCreatorProps) {
  const { theme } = useTheme();
  const { transformCard } = useChat();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const payload = card.payload as unknown as BotCreatorPayload;

  const botName = payload?.botName || 'New Bot Strategy';
  const trigger = payload?.trigger || { type: 'Weekly', value: 'Monday' };
  const action = payload?.action || { type: 'Buy', asset: 'BTC' };
  const target = payload?.target || { type: 'Amount', value: '$100' };
  const condition = payload?.condition;

  const handleDeploy = () => {
    console.log('[BotCardCreator] Deploy bot:', { botName, trigger, action, target, condition });
    const result = transformCardRule('bot-creator', 'onDeployBot', {
      name: botName,
      strategy: `${trigger.type} ${action.type} ${action.asset}`,
      trigger,
      action,
      target,
      condition,
    });
    if (result) {
      transformCard(card.id, result.newType as CardType, result.newPayload);
    }
  };

  const handleEditConfig = () => {
    console.log('[BotCardCreator] Edit config:', { botName });
  };

  const handleCancel = () => {
    console.log('[BotCardCreator] Cancel bot creation:', { botName });
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
    <CardWrapper card={card} accentColor="cyan">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
              <Bot className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-cyan-500 uppercase tracking-wider block">
                New Bot Configuration
              </span>
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                "{botName}"
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

        {/* Footer Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditConfig}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleCancel}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
            }`}
          >
            <Rocket className="w-4 h-4" />
            Deploy Bot
          </button>
        </div>
        </>
        )}
      </div>
    </CardWrapper>
  );
}
