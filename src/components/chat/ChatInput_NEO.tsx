import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Paperclip, Mic, ChevronDown } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools } from '../../store/DrawingToolsContext';
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

// Regex para detectar tags no formato [@TagName-N]
const TAG_REGEX = /\[@([A-Za-z]+)-(\d+)\]/g;

// Mapeia nomes de tags para tipos de drawing
function getDrawingTypeFromTagName(tagName: string): 'trendline' | 'horizontal' | 'rectangle' | 'note' | null {
  const normalized = tagName.toLowerCase();
  if (normalized === 'trendline') return 'trendline';
  if (normalized === 'horizontal') return 'horizontal';
  if (normalized === 'rectangle') return 'rectangle';
  if (normalized === 'note') return 'note';
  return null;
}

// Cores inline para tags (convertidas de Tailwind)
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  trendline: { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
  horizontal: { bg: 'rgba(161, 161, 170, 0.2)', text: '#a1a1aa', border: 'rgba(161, 161, 170, 0.3)' },
  rectangle: { bg: 'rgba(34, 211, 238, 0.2)', text: '#67e8f9', border: 'rgba(34, 211, 238, 0.3)' },
  note: { bg: 'rgba(168, 85, 247, 0.2)', text: '#c4b5fd', border: 'rgba(168, 85, 247, 0.3)' },
};

// Gera HTML para uma tag estilizada
function generateTagHTML(tagName: string, tagNumber: string, theme: 'dark' | 'light'): string {
  const drawingType = getDrawingTypeFromTagName(tagName);
  const label = `${tagName}-${tagNumber}`;
  
  if (!drawingType) {
    // Tag desconhecida - estilo genérico
    return `<span class="inline-tag" data-tag="${label}" contenteditable="false" style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: rgba(113, 113, 122, 0.2); color: ${theme === 'dark' ? '#a1a1aa' : '#71717a'}; border: 1px solid rgba(113, 113, 122, 0.3); margin: 0 2px; user-select: all; cursor: default;">@${label}</span>`;
  }

  const c = TAG_COLORS[drawingType];
  
  return `<span class="inline-tag" data-tag="${label}" contenteditable="false" style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border}; margin: 0 2px; user-select: all; cursor: default;">@${label}</span>`;
}

// Converte texto com tags para HTML renderizado
function textToHTML(text: string, theme: 'dark' | 'light'): string {
  if (!text) return '';
  
  let result = text;
  TAG_REGEX.lastIndex = 0;
  
  // Substituir tags por HTML
  result = result.replace(TAG_REGEX, (_match, tagName, tagNumber) => {
    return generateTagHTML(tagName, tagNumber, theme);
  });
  
  // Preservar quebras de linha
  result = result.replace(/\n/g, '<br>');
  
  return result;
}

// Extrai texto puro do HTML (para enviar ao backend)
function htmlToText(html: string): string {
  // Criar elemento temporário
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Substituir tags span por formato texto
  const tags = temp.querySelectorAll('.inline-tag');
  tags.forEach(tag => {
    const tagLabel = tag.getAttribute('data-tag');
    if (tagLabel) {
      const textNode = document.createTextNode(`[@${tagLabel}]`);
      tag.parentNode?.replaceChild(textNode, tag);
    }
  });
  
  // Substituir <br> por \n
  const brs = temp.querySelectorAll('br');
  brs.forEach(br => {
    const textNode = document.createTextNode('\n');
    br.parentNode?.replaceChild(textNode, br);
  });
  
  return temp.textContent || '';
}

interface ChatInput_NEOProps {
  displayMode?: 'center' | 'sidebar';
}

export function ChatInput_NEO({ displayMode = 'center' }: ChatInput_NEOProps) {
  const [plainText, setPlainText] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
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
  const { chatTags, clearChatTags, drawings } = useDrawingTools();

  const isSidebar = displayMode === 'sidebar';

  // Salvar posição do cursor
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }, []);

  // Restaurar posição do cursor
  const restoreCaretPosition = useCallback((position: number) => {
    if (!editorRef.current || position === null) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const range = document.createRange();
    let currentPos = 0;
    let found = false;
    
    const walkNodes = (node: Node) => {
      if (found) return;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (currentPos + textLength >= position) {
          range.setStart(node, position - currentPos);
          range.collapse(true);
          found = true;
          return;
        }
        currentPos += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.classList.contains('inline-tag')) {
          const tagLength = (el.getAttribute('data-tag')?.length || 0) + 3; // [@...] = +3
          if (currentPos + tagLength >= position) {
            range.setStartAfter(node);
            range.collapse(true);
            found = true;
            return;
          }
          currentPos += tagLength;
        } else if (el.tagName === 'BR') {
          currentPos += 1;
          if (currentPos >= position) {
            range.setStartAfter(node);
            range.collapse(true);
            found = true;
            return;
          }
        } else {
          for (const child of Array.from(node.childNodes)) {
            walkNodes(child);
          }
        }
      }
    };
    
    walkNodes(editorRef.current);
    
    if (!found) {
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  // Quando uma nova tag é adicionada via chatTags, inserir no editor
  const lastTagCountRef = useRef(chatTags.length);
  
  useEffect(() => {
    if (chatTags.length > lastTagCountRef.current && editorRef.current) {
      const newTag = chatTags[chatTags.length - 1];
      const tagText = `[@${newTag.label}] `;
      
      // Inserir na posição do cursor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Criar elemento de tag
        const tagHTML = generateTagHTML(
          newTag.label.split('-')[0], 
          newTag.label.split('-')[1], 
          theme
        );
        const temp = document.createElement('div');
        temp.innerHTML = tagHTML + ' ';
        const tagElement = temp.firstChild as Node;
        const spaceNode = document.createTextNode(' ');
        
        range.deleteContents();
        range.insertNode(spaceNode);
        range.insertNode(tagElement);
        
        // Mover cursor após a tag
        range.setStartAfter(spaceNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Atualizar plainText
        setPlainText(htmlToText(editorRef.current.innerHTML));
      } else {
        // Fallback: adicionar no final
        setPlainText(prev => prev + tagText);
        if (editorRef.current) {
          editorRef.current.innerHTML = textToHTML(plainText + tagText, theme);
        }
      }
      
      editorRef.current.focus();
    }
    lastTagCountRef.current = chatTags.length;
  }, [chatTags, theme, plainText]);

  // Sincronizar HTML quando plainText muda externamente
  useEffect(() => {
    if (editorRef.current && plainText === '') {
      editorRef.current.innerHTML = '';
    }
  }, [plainText]);

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

  // Handle input no contenteditable
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.innerHTML;
    const text = htmlToText(html);
    setPlainText(text);
    
    // Re-renderizar tags se o usuário digitou uma tag manualmente
    if (text.includes('[@') && text.includes(']')) {
      const caretPos = saveCaretPosition();
      const newHTML = textToHTML(text, theme);
      
      if (newHTML !== html) {
        editorRef.current.innerHTML = newHTML;
        if (caretPos !== null) {
          restoreCaretPosition(caretPos);
        }
      }
    }
  }, [theme, saveCaretPosition, restoreCaretPosition]);

  const handleSubmit = async () => {
    if (!plainText.trim() || isTyping) return;

    const messageContent = plainText.trim();
    
    // Extrair tags do texto para salvar na sessão
    const tagsInMessage: { label: string; drawingId: string; type: string }[] = [];
    let match;
    TAG_REGEX.lastIndex = 0;
    while ((match = TAG_REGEX.exec(messageContent)) !== null) {
      const tagLabel = `${match[1]}-${match[2]}`;
      const matchingTag = chatTags.find(t => t.label === tagLabel);
      if (matchingTag) {
        tagsInMessage.push(matchingTag);
      }
    }
    
    setPlainText('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    clearChatTags();
    setTyping(true);

    try {
      let sessionId = currentSessionId;
      
      if (!sessionId) {
        sessionId = await createNewSession(messageContent);
        if (!sessionId) throw new Error('Failed to create session');
        
        if (drawings.length > 0) {
          for (const drawing of drawings) {
            await addDrawingToSession(drawing);
          }
        }
      }

      if (tagsInMessage.length > 0) {
        for (const tag of tagsInMessage) {
          const drawing = drawings.find(d => d.id === tag.drawingId);
          if (drawing) await addTagToSession(tag as any, drawing);
        }
      }

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      await addMessage(userMessage, sessionId);
      
      let response;
      try {
        response = await callLangflow(userMessage.content, sessionId);
      } catch (langflowError) {
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
      <style>{`
        @keyframes slow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-slow-pulse {
          animation: slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .chat-editor:empty:before {
          content: attr(data-placeholder);
          color: ${theme === 'dark' ? '#71717a' : '#9ca3af'};
          pointer-events: none;
        }
        .chat-editor:focus {
          outline: none;
        }
        .chat-editor .inline-tag {
          user-select: all;
        }
      `}</style>
      <div className={`relative rounded-2xl ${isSidebar ? 'shadow-lg shadow-black/20' : ''}`}>
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/50 via-rose-400/50 to-red-500/50 animate-slow-pulse" />

        <div className={`relative rounded-2xl border transition-colors ${
          theme === 'dark'
            ? isSidebar ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-900 border-zinc-700/50'
            : 'bg-white border-gray-200'
        }`}>
          {/* Contenteditable Editor */}
          <div className="px-3 pt-2">
            <div
              ref={editorRef}
              contentEditable={!isTyping}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              data-placeholder={isSidebar ? "Message..." : "Message FlowChat..."}
              className={`chat-editor w-full bg-transparent py-2 min-h-[24px] max-h-[150px] overflow-y-auto leading-[1.77] ${
                isSidebar ? 'text-xs' : 'text-sm'
              } ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } ${isTyping ? 'opacity-50' : ''}`}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-between px-3 pb-2 pt-1 border-t ${
            theme === 'dark' ? 'border-zinc-700/50' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setAutoMode(!autoMode)}
                  className={`relative w-9 h-5 flex-shrink-0 rounded-full transition-colors ${
                    autoMode ? 'bg-red-500' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    autoMode ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
                <span className={`text-xs font-medium min-w-0 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                }`}>Auto Mode</span>
              </div>

              <div className={`w-px h-5 flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'}`} />

              <div className="relative min-w-0" ref={agentDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setIsAgentDropdownOpen(!isAgentDropdownOpen); setIsProductDropdownOpen(false); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-0 ${
                    theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="min-w-0">Select Agent</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                {isAgentDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-48 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                  }`}>
                    {AGENTS.map((agent) => (
                      <button key={agent} type="button"
                        onClick={() => { setSelectedAgent(agent === selectedAgent ? null : agent); setIsAgentDropdownOpen(false); }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                          selectedAgent === agent
                            ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-900'
                            : theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >{agent}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={productDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setIsProductDropdownOpen(!isProductDropdownOpen); setIsAgentDropdownOpen(false); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <span>Markets</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isProductDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-40 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                  }`}>
                    {PRODUCTS.map((product) => (
                      <button key={product} type="button"
                        onClick={() => { setSelectedProduct(product === selectedProduct ? null : product); setIsProductDropdownOpen(false); }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                          selectedProduct === product
                            ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-900'
                            : theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >{product}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button" className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`} title="Attach file"><Paperclip className="w-4 h-4" /></button>

              <button type="button" className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`} title="Voice input"><Mic className="w-4 h-4" /></button>

              <button
                onClick={handleSubmit}
                disabled={!plainText.trim() || isTyping}
                className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isSidebar ? 'w-8 h-8' : 'w-10 h-10'
                } ${
                  plainText.trim() && !isTyping
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95'
                    : theme === 'dark'
                      ? isSidebar ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-800 text-zinc-500'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isTyping ? <Loader2 className={`animate-spin ${isSidebar ? 'w-4 h-4' : 'w-5 h-5'}`} /> : <Send className={isSidebar ? 'w-4 h-4' : 'w-5 h-5'} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isSidebar && (
        <p className={`text-xs text-center mt-3 transition-colors ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'}`}>
          FlowChat may produce inaccurate information. Cards are dynamically generated.
        </p>
      )}
    </div>
  );
}
