import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Paperclip, Mic, ChevronDown } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools, DRAWING_COLORS } from '../../store/DrawingToolsContext';
import { callLangflow } from '../../services/langflowApi';
import { simulateLangFlowResponse } from '../../services/mockSimulation';
import type { ChatMessage } from '../../types';

const AGENTS = [
  'Risk Analysis Agent',
  'Portfolio Manager Agent',
  'Trader Agent',
  'Bot Creator Agent',
  'Market Agent',
  'Support Agent',
  'Trainer Agent',
];

const PRODUCTS = [
  'Forex',
  'Derived Indices',
  'Stocks',
  'Stock Indices',
  'Commodities',
  'Cryptocurrencies',
  'ETFs',
];

interface ChatInput_NEOProps {
  displayMode?: 'center' | 'sidebar';
}

export function ChatInput_NEO({ displayMode = 'center' }: ChatInput_NEOProps) {
  const [message, setMessage] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    addMessage, 
    setTyping, 
    isTyping, 
    processUIEvent, 
    currentSessionId, 
    createNewSession,
    addTagToSession,
    addDrawingToSession,
  } = useChat();
  const { theme } = useTheme();
  const { chatTags, removeTagFromChat, clearChatTags, selectDrawing, selectedDrawingId, drawings } = useDrawingTools();

  const isSidebar = displayMode === 'sidebar';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setIsAgentDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = async () => {
    if ((!message.trim() && chatTags.length === 0) || isTyping) return;

    const tagsPrefix = chatTags.length > 0 
      ? chatTags.map(tag => `[@${tag.label}]`).join(' ') + ' '
      : '';
    const messageContent = tagsPrefix + message.trim();
    const tagsToSave = [...chatTags];
    
    setMessage('');
    clearChatTags();
    setTyping(true);

    try {
      let sessionId = currentSessionId;
      
      if (!sessionId) {
        sessionId = await createNewSession(messageContent);
        if (!sessionId) throw new Error('Failed to create session');
        
        // Persist any existing drawings to the new session
        if (drawings.length > 0) {
          console.log('[ChatInput] Persisting existing drawings to new session:', drawings.length);
          for (const drawing of drawings) {
            await addDrawingToSession(drawing);
          }
        }
      }

      if (tagsToSave.length > 0) {
        for (const tag of tagsToSave) {
          const drawing = drawings.find(d => d.id === tag.drawingId);
          if (drawing) await addTagToSession(tag, drawing);
        }
      }

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      await addMessage(userMessage, sessionId);
      
      // Try Langflow API first, fallback to mock simulation
      let response;
      try {
        response = await callLangflow(userMessage.content, sessionId);
        console.log('[ChatInput] Langflow response received');
      } catch (langflowError) {
        console.warn('[ChatInput] Langflow failed, using mock simulation:', langflowError);
        response = await simulateLangFlowResponse(userMessage.content);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.chat_message,
        timestamp: new Date(),
      };

      await addMessage(assistantMessage, sessionId);

      for (let i = 0; i < response.ui_events.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
        await processUIEvent(response.ui_events[i], sessionId);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      await addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Custom slow pulse animation */}
      <style>{`
        @keyframes slow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-slow-pulse {
          animation: slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className={`relative rounded-2xl ${isSidebar ? 'shadow-lg shadow-black/20' : ''}`}>
        <div
          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/50 via-rose-400/50 to-red-500/50 animate-slow-pulse"
        />

        <div className={`relative rounded-2xl border transition-colors ${
          theme === 'dark'
            ? isSidebar 
              ? 'bg-zinc-800 border-zinc-600'
              : 'bg-zinc-900 border-zinc-700/50'
            : 'bg-white border-gray-200'
        }`}>
          {/* Drawing Tags */}
          {chatTags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 px-3 pt-2 ${isSidebar ? 'pb-0' : 'pb-1'}`}>
              {chatTags.map((tag) => {
                const colors = DRAWING_COLORS[tag.type];
                const isTagSelected = selectedDrawingId === tag.drawingId;
                
                return (
                  <span
                    key={tag.drawingId}
                    onClick={() => selectDrawing(isTagSelected ? null : tag.drawingId)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${
                      isTagSelected
                        ? `${colors.tagBgSelected} ${colors.tagTextSelected} border-2 ${colors.tagBorderSelected}`
                        : `${colors.tagBg} ${colors.tagText} border ${colors.tagBorder} hover:opacity-80`
                    }`}
                  >
                    @{tag.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTagFromChat(tag.drawingId);
                      }}
                      className={`ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20 ${
                        isTagSelected ? colors.tagTextSelected : colors.tagText
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* LINE 1: Text Input */}
          <div className="px-3 pt-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSidebar ? "Message..." : "Message FlowChat..."}
              rows={1}
              disabled={isTyping}
              className={`w-full bg-transparent resize-none focus:outline-none py-2 disabled:opacity-50 transition-colors scrollbar-neo ${
                isSidebar ? 'text-xs max-h-[80px]' : 'text-sm max-h-[150px]'
              } ${
                theme === 'dark'
                  ? 'text-white placeholder-zinc-500'
                  : 'text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* LINE 2: Action Buttons */}
          <div className={`flex items-center justify-between px-3 pb-2 pt-1 border-t ${
            theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-100'
          }`}>
            {/* Left side: Controls */}
            <div className="flex items-center gap-2">
              {/* 1. Auto Mode Switch (first element) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoMode(!autoMode)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    autoMode 
                      ? 'bg-red-500' 
                      : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    autoMode ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                }`}>
                  Auto Mode
                </span>
              </div>

              {/* Divider */}
              <div className={`w-px h-5 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`} />

              {/* 2. Select Agent Dropdown */}
              <div className="relative" ref={agentDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAgentDropdownOpen(!isAgentDropdownOpen);
                    setIsProductDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-zinc-700 text-zinc-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <span>Select Agent</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isAgentDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-48 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    {AGENTS.map((agent) => (
                      <button
                        key={agent}
                        type="button"
                        onClick={() => {
                          setSelectedAgent(agent === selectedAgent ? null : agent);
                          setIsAgentDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                          selectedAgent === agent
                            ? theme === 'dark'
                              ? 'bg-zinc-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : theme === 'dark'
                              ? 'text-zinc-300 hover:bg-zinc-700/50'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {agent}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Select Product Dropdown */}
              <div className="relative" ref={productDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProductDropdownOpen(!isProductDropdownOpen);
                    setIsAgentDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-zinc-700 text-zinc-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <span>Markets</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isProductDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-40 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    {PRODUCTS.map((product) => (
                      <button
                        key={product}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product === selectedProduct ? null : product);
                          setIsProductDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                          selectedProduct === product
                            ? theme === 'dark'
                              ? 'bg-zinc-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : theme === 'dark'
                              ? 'text-zinc-300 hover:bg-zinc-700/50'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right side: Attachment + Microphone + Send button */}
            <div className="flex items-center gap-2">
              {/* Attachment */}
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Microphone */}
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={(!message.trim() && chatTags.length === 0) || isTyping}
                className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isSidebar ? 'w-8 h-8' : 'w-10 h-10'
                } ${
                  (message.trim() || chatTags.length > 0) && !isTyping
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95'
                    : theme === 'dark'
                      ? isSidebar 
                        ? 'bg-zinc-700 text-zinc-400'
                        : 'bg-zinc-800 text-zinc-500'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isTyping ? (
                  <Loader2 className={`animate-spin ${isSidebar ? 'w-4 h-4' : 'w-5 h-5'}`} />
                ) : (
                  <Send className={isSidebar ? 'w-4 h-4' : 'w-5 h-5'} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isSidebar && (
        <p className={`text-xs text-center mt-3 transition-colors ${
          theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
        }`}>
          FlowChat may produce inaccurate information. Cards are dynamically generated.
        </p>
      )}
    </div>
  );
}
