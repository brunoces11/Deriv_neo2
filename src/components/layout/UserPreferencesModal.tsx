import { useState } from 'react';
import { X, Sparkles, ShieldCheck, Briefcase, TrendingUp, Bot, BarChart3, PenLine } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

interface AgentPreference {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  details: string;
  preferences: string;
}

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AGENTS: AgentPreference[] = [
  {
    id: 'risk',
    name: 'Risk Analysis Agent',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Monitors and controls your exposure to market risks',
    details: 'Define your risk tolerance level, maximum loss per trade, daily loss limits, stop-loss rules, and position sizing preferences. This agent will alert you before risky operations.',
    preferences: '',
  },
  {
    id: 'portfolio',
    name: 'Portfolio Manager',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Manages asset allocation and portfolio balance',
    details: 'Set target allocations per asset class, rebalancing triggers, diversification rules, and concentration limits. The agent tracks your portfolio health and suggests adjustments.',
    preferences: '',
  },
  {
    id: 'trader',
    name: 'Trader Agent',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Executes trades based on your strategy preferences',
    details: 'Configure preferred order types (market, limit, stop), execution timing, slippage tolerance, and trading hours. Define which markets and instruments you want to trade.',
    preferences: '',
  },
  {
    id: 'bot',
    name: 'Bot Creator Agent',
    icon: <Bot className="w-5 h-5" />,
    description: 'Builds and manages automated trading strategies',
    details: 'Set automation rules, entry/exit conditions, profit targets, and alert thresholds. Define how aggressive or conservative your bots should behave in different market conditions.',
    preferences: '',
  },
  {
    id: 'market',
    name: 'Market Analysis Agent',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Analyzes market trends and generates insights',
    details: 'Choose preferred technical indicators, analysis timeframes, signal sensitivity, and news sources. Configure which market events and patterns you want to be notified about.',
    preferences: '',
  },
];

export function UserPreferencesModal({ isOpen, onClose }: UserPreferencesModalProps) {
  const { theme } = useTheme();
  const [agentPreferences, setAgentPreferences] = useState<Record<string, string>>({});
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreferenceChange = (agentId: string, value: string) => {
    setAgentPreferences(prev => ({ ...prev, [agentId]: value }));
  };

  const handleWritePreferences = (agentId: string) => {
    // Focus on textarea for manual writing
    setExpandedAgent(agentId);
  };

  const handleGenerateWithAI = (agentId: string) => {
    // TODO: Integrate with AI to help create preferences
    console.log('Generate with AI for agent:', agentId);
    alert(`AI Wizard will help you configure ${AGENTS.find(a => a.id === agentId)?.name}. This feature is coming soon!`);
  };

  const handleSave = () => {
    // TODO: Save preferences to backend/localStorage
    console.log('Saving preferences:', agentPreferences);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              User Preferences
            </h2>
            <p className={`text-sm mt-1 leading-relaxed max-w-md ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              Customize each AI agent to match your trading style and goals. Write your own rules or use the AI Wizard anytime to help you define the best preferences for your profile.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-4">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className={`rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Agent Header */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {agent.name}
                      </h3>
                      <div className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                        agentPreferences[agent.id] 
                          ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {agentPreferences[agent.id] ? 'Configured' : 'Default'}
                      </div>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      {agent.description}
                    </p>
                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                    }`}>
                      {agent.details}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleWritePreferences(agent.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        Write Preferences
                      </button>
                      <button
                        onClick={() => handleGenerateWithAI(agent.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all hover:shadow-md hover:shadow-red-500/25"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate with AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Textarea */}
              {expandedAgent === agent.id && (
                <div className={`px-4 pb-4 pt-0 border-t ${
                  theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-200'
                }`}>
                  <div className="pt-4">
                    <textarea
                      value={agentPreferences[agent.id] || ''}
                      onChange={(e) => handlePreferenceChange(agent.id, e.target.value)}
                      placeholder={`Enter your preferences for ${agent.name}...\n\nExample: "Conservative approach, max 2% risk per trade, prefer limit orders, avoid trading during high volatility news events"`}
                      rows={4}
                      autoFocus
                      className={`w-full px-4 py-3 rounded-xl border resize-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                      } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => setExpandedAgent(null)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
