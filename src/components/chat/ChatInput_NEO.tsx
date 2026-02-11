import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Paperclip, Mic, ChevronDown, X } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import { useDrawingTools } from '../../store/DrawingToolsContext';
import { useViewMode } from '../../store/ViewModeContext';
import { callLangflowStreaming } from '../../services/langflowApi';
import { simulateLangFlowResponse } from '../../services/mockSimulation';
import type { ChatMessage } from '../../types';

const AGENTS = [
  'Risk Analysis Agent',
  'Portfolio Manager Agent',
  'Trader Agent',
  'Action Creator Agent',
  'Bot Creator Agent',
  'Market Analyses Agent',
  // 'Support Agent',
  // 'Trainer Agent',
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

// Regex para detectar tags no formato [@TagName-N] ou [@TagName]
const TAG_REGEX = /\[@([A-Za-z0-9\s]+?)(?:-(\d+))?\]/g;

// Mapeia nomes de tags para tipos de drawing
function getDrawingTypeFromTagName(tagName: string): 'trendline' | 'horizontal' | 'rectangle' | 'note' | null {
  const normalized = tagName.toLowerCase();
  if (normalized === 'trendline') return 'trendline';
  if (normalized === 'horizontal') return 'horizontal';
  if (normalized === 'rectangle') return 'rectangle';
  if (normalized === 'note') return 'note';
  return null;
}

// Verifica se é uma tag de agente
function isAgentTag(tagName: string): boolean {
  return AGENTS.some(a => a.toLowerCase().replace(/\s+/g, '') === tagName.toLowerCase().replace(/\s+/g, ''));
}

// Verifica se é uma tag de market
function isMarketTag(tagName: string): boolean {
  return PRODUCTS.some(p => p.toLowerCase().replace(/\s+/g, '') === tagName.toLowerCase().replace(/\s+/g, ''));
}

// Cores inline para tags - com versões light e dark
// Light mode: texto escuro para contraste
// Dark mode: texto claro para contraste
const TAG_COLORS: Record<string, { bg: string; textLight: string; textDark: string; border: string }> = {
  trendline: { bg: 'rgba(59, 130, 246, 0.25)', textLight: '#1e3a5f', textDark: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  horizontal: { bg: 'rgba(59, 130, 246, 0.25)', textLight: '#1e3a5f', textDark: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  rectangle: { bg: 'rgba(59, 130, 246, 0.25)', textLight: '#1e3a5f', textDark: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  note: { bg: 'rgba(59, 130, 246, 0.25)', textLight: '#1e3a5f', textDark: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  // Agent tags - vermelho
  agent: { bg: 'rgba(239, 68, 68, 0.25)', textLight: '#5c1a1a', textDark: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' },
  // Market tags - roxo
  market: { bg: 'rgba(147, 51, 234, 0.25)', textLight: '#3b1a5c', textDark: '#d8b4fe', border: 'rgba(147, 51, 234, 0.4)' },
  // Default - cinza
  default: { bg: 'rgba(113, 113, 122, 0.25)', textLight: '#3d3d3d', textDark: '#d4d4d8', border: 'rgba(113, 113, 122, 0.4)' },
};

// Gera HTML para uma tag estilizada
function generateTagHTML(tagName: string, tagNumber: string | null): string {
  const label = tagNumber ? `${tagName}-${tagNumber}` : tagName;
  
  // Determinar cor baseado no tipo de tag
  let colors: { bg: string; textLight: string; textDark: string; border: string };
  
  if (isAgentTag(tagName)) {
    colors = TAG_COLORS.agent;
  } else if (isMarketTag(tagName)) {
    colors = TAG_COLORS.market;
  } else {
    const drawingType = getDrawingTypeFromTagName(tagName);
    colors = drawingType 
      ? TAG_COLORS[drawingType] 
      : TAG_COLORS.default;
  }
  
  // Usar CSS custom properties para alternar entre light/dark
  return `<span class="inline-tag" data-tag="${label}" data-text-light="${colors.textLight}" data-text-dark="${colors.textDark}" contenteditable="false" style="display: inline-flex; align-items: center; padding: 0px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; line-height: 1.4; background: ${colors.bg}; border: 1px solid ${colors.border}; margin: 0 4px; user-select: all; cursor: default;">@${label}</span>`;
}

// Converte texto com tags para HTML renderizado
function textToHTML(text: string): string {
  if (!text) return '';
  
  let result = text;
  TAG_REGEX.lastIndex = 0;
  
  // Substituir tags por HTML
  result = result.replace(TAG_REGEX, (_match, tagName, tagNumber) => {
    return generateTagHTML(tagName, tagNumber || null);
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
  // Draft state from context (persisted)
  const { draftInput, updateDraftInput, clearDraftInput, notifyPanelActivation, btcPrice } = useViewMode();
  const { plainText, selectedAgents, selectedProducts, autoMode } = draftInput;
  
  // Local UI state (not persisted)
  const [userReactivatedAutoMode, setUserReactivatedAutoMode] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const lastCursorRangeRef = useRef<Range | null>(null);
  const isRestoringDraftRef = useRef(false); // Flag to prevent loops during draft restore
  
  const { 
    addMessage, 
    updateMessageContent,
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

  // Atualizar cores das tags quando o tema muda
  useEffect(() => {
    if (!editorRef.current) return;
    
    const tags = editorRef.current.querySelectorAll('.inline-tag');
    tags.forEach(tag => {
      const textLight = tag.getAttribute('data-text-light');
      const textDark = tag.getAttribute('data-text-dark');
      if (textLight && textDark) {
        (tag as HTMLElement).style.color = theme === 'dark' ? textDark : textLight;
      }
    });
  }, [theme]);

  // Salvar posição do cursor quando o editor perde foco ou quando há mudança de seleção
  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastCursorRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  // Função para inserir tag no editor na última posição conhecida do cursor
  const insertTagInEditor = useCallback((tagLabel: string) => {
    if (!editorRef.current) return;
    
    const tagHTML = generateTagHTML(tagLabel, null);
    const temp = document.createElement('div');
    temp.innerHTML = tagHTML;
    const tagElement = temp.firstChild as HTMLElement;
    const spaceNode = document.createTextNode(' ');
    
    // Aplicar cor correta baseada no tema atual
    const textLight = tagElement.getAttribute('data-text-light');
    const textDark = tagElement.getAttribute('data-text-dark');
    if (textLight && textDark) {
      tagElement.style.color = theme === 'dark' ? textDark : textLight;
    }
    
    // Focar o editor primeiro
    editorRef.current.focus();
    
    // Obter seleção atual
    const selection = window.getSelection();
    if (!selection) return;
    
    let range: Range;
    
    // Tentar usar a última posição salva do cursor se ainda for válida
    if (lastCursorRangeRef.current && 
        editorRef.current.contains(lastCursorRangeRef.current.commonAncestorContainer)) {
      range = lastCursorRangeRef.current.cloneRange();
    } else if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // Criar novo range no final do editor
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    
    // Inserir tag e espaço
    range.deleteContents();
    range.insertNode(spaceNode);
    range.insertNode(tagElement);
    
    // Posicionar cursor APÓS o espaço (não após a tag)
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    range.collapse(true);
    
    // Atualizar seleção visual
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Salvar nova posição do cursor
    lastCursorRangeRef.current = range.cloneRange();
    
    // Atualizar plainText
    updateDraftInput({ plainText: htmlToText(editorRef.current.innerHTML) });
  }, [theme, updateDraftInput]);

  // Função para remover tag do editor
  const removeTagFromEditor = useCallback((tagLabel: string) => {
    if (!editorRef.current) return;
    
    const tags = editorRef.current.querySelectorAll('.inline-tag');
    tags.forEach(tag => {
      if (tag.getAttribute('data-tag') === tagLabel) {
        // Remover a tag e o espaço após ela
        const nextSibling = tag.nextSibling;
        if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent === ' ') {
          nextSibling.remove();
        }
        tag.remove();
      }
    });
    
    updateDraftInput({ plainText: htmlToText(editorRef.current.innerHTML) });
  }, [updateDraftInput]);

  // Toggle agent selection - agentes ficam no header, não no editor
  // Quando seleciona um agente, desativa autoMode automaticamente (apenas se usuário não reativou manualmente)
  const toggleAgent = useCallback((agent: string) => {
    const newSelectedAgents = selectedAgents.includes(agent)
      ? selectedAgents.filter(a => a !== agent)
      : [...selectedAgents, agent];
    
    // Só desativa autoMode se o usuário ainda não reativou manualmente e está adicionando agente
    if (!selectedAgents.includes(agent) && !userReactivatedAutoMode) {
      updateDraftInput({ selectedAgents: newSelectedAgents, autoMode: false });
    } else {
      updateDraftInput({ selectedAgents: newSelectedAgents });
    }
    
    // Fechar dropdown após selecionar/desselecionar
    setIsAgentDropdownOpen(false);
  }, [selectedAgents, userReactivatedAutoMode, updateDraftInput]);

  // Toggle product selection
  const toggleProduct = useCallback((product: string) => {
    const productTag = product.replace(/\s+/g, '');
    if (selectedProducts.includes(product)) {
      removeTagFromEditor(productTag);
      updateDraftInput({ selectedProducts: selectedProducts.filter(p => p !== product) });
    } else {
      insertTagInEditor(productTag);
      updateDraftInput({ selectedProducts: [...selectedProducts, product] });
    }
  }, [selectedProducts, insertTagInEditor, removeTagFromEditor, updateDraftInput]);

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
          const offset = Math.min(position - currentPos, textLength);
          range.setStart(node, offset);
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
            // Posicionar após a tag
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
            if (found) return;
          }
        }
      }
    };
    
    walkNodes(editorRef.current);
    
    if (!found) {
      // Se não encontrou a posição exata, posicionar no final
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Salvar a nova posição do cursor
    lastCursorRangeRef.current = range.cloneRange();
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
          newTag.label.split('-')[1]
        );
        const temp = document.createElement('div');
        temp.innerHTML = tagHTML + ' ';
        const tagElement = temp.firstChild as HTMLElement;
        const spaceNode = document.createTextNode(' ');
        
        // Aplicar cor correta baseada no tema atual
        const textLight = tagElement.getAttribute('data-text-light');
        const textDark = tagElement.getAttribute('data-text-dark');
        if (textLight && textDark) {
          tagElement.style.color = theme === 'dark' ? textDark : textLight;
        }
        
        range.deleteContents();
        range.insertNode(spaceNode);
        range.insertNode(tagElement);
        
        // Mover cursor após a tag
        range.setStartAfter(spaceNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Atualizar plainText
        updateDraftInput({ plainText: htmlToText(editorRef.current.innerHTML) });
      } else {
        // Fallback: adicionar no final
        const newText = plainText + tagText;
        updateDraftInput({ plainText: newText });
        if (editorRef.current) {
          editorRef.current.innerHTML = textToHTML(newText);
          // Aplicar cores às tags
          const tags = editorRef.current.querySelectorAll('.inline-tag');
          tags.forEach(tag => {
            const tl = tag.getAttribute('data-text-light');
            const td = tag.getAttribute('data-text-dark');
            if (tl && td) {
              (tag as HTMLElement).style.color = theme === 'dark' ? td : tl;
            }
          });
        }
      }
      
      editorRef.current.focus();
    }
    lastTagCountRef.current = chatTags.length;
  }, [chatTags, plainText, theme, updateDraftInput]);

  // Sincronizar HTML quando plainText muda externamente
  useEffect(() => {
    if (editorRef.current && plainText === '') {
      editorRef.current.innerHTML = '';
    }
  }, [plainText]);

  // Restore editor content from persisted draft on mount or mode switch
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Only restore if editor is empty but draft has content
    const currentEditorText = htmlToText(editorRef.current.innerHTML);
    if (plainText && !currentEditorText) {
      isRestoringDraftRef.current = true;
      editorRef.current.innerHTML = textToHTML(plainText);
      
      // Apply correct tag colors based on theme
      const tags = editorRef.current.querySelectorAll('.inline-tag');
      tags.forEach(tag => {
        const tl = tag.getAttribute('data-text-light');
        const td = tag.getAttribute('data-text-dark');
        if (tl && td) {
          (tag as HTMLElement).style.color = theme === 'dark' ? td : tl;
        }
      });
      
      isRestoringDraftRef.current = false;
    }
  }, [plainText, theme]);

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
    if (!editorRef.current || isRestoringDraftRef.current) return;
    
    const html = editorRef.current.innerHTML;
    const text = htmlToText(html);
    
    // Salvar a seleção atual antes de qualquer modificação
    const selection = window.getSelection();
    let savedRange: Range | null = null;
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
      lastCursorRangeRef.current = savedRange.cloneRange();
    }
    
    // Sincronizar selectedProducts com as tags de market que realmente existem no texto
    // Isso garante que o contador reflita as tags presentes no editor
    const currentMarketTags: string[] = [];
    TAG_REGEX.lastIndex = 0;
    let tagMatch;
    while ((tagMatch = TAG_REGEX.exec(text)) !== null) {
      const tagName = tagMatch[1];
      // Verificar se é uma tag de market
      const matchedProduct = PRODUCTS.find(p => 
        p.toLowerCase().replace(/\s+/g, '') === tagName.toLowerCase().replace(/\s+/g, '')
      );
      if (matchedProduct && !currentMarketTags.includes(matchedProduct)) {
        currentMarketTags.push(matchedProduct);
      }
    }
    
    // Atualizar selectedProducts se houver diferença
    const productsChanged = selectedProducts.length !== currentMarketTags.length ||
      !selectedProducts.every(p => currentMarketTags.includes(p));
    
    if (productsChanged) {
      updateDraftInput({ plainText: text, selectedProducts: currentMarketTags });
    } else {
      updateDraftInput({ plainText: text });
    }
    
    // Re-renderizar tags se o usuário digitou uma tag manualmente
    // Mas APENAS se detectarmos uma tag completa nova que não está renderizada
    if (text.includes('[@') && text.includes(']')) {
      const newHTML = textToHTML(text);
      
      // Só reconstruir se realmente houver diferença significativa
      // (evita reconstruções desnecessárias que quebram o cursor)
      if (newHTML !== html) {
        // Verificar se a diferença é apenas de formatação ou se há tags novas
        const currentTags = html.match(/data-tag="[^"]+"/g) || [];
        const newTags = newHTML.match(/data-tag="[^"]+"/g) || [];
        
        // Só reconstruir se houver tags novas
        if (newTags.length > currentTags.length) {
          const caretPos = saveCaretPosition();
          editorRef.current.innerHTML = newHTML;
          
          // Aplicar cores às tags baseado no tema
          const tags = editorRef.current.querySelectorAll('.inline-tag');
          tags.forEach(tag => {
            const tl = tag.getAttribute('data-text-light');
            const td = tag.getAttribute('data-text-dark');
            if (tl && td) {
              (tag as HTMLElement).style.color = theme === 'dark' ? td : tl;
            }
          });
          
          if (caretPos !== null) {
            restoreCaretPosition(caretPos);
          }
        }
      }
    }
  }, [saveCaretPosition, restoreCaretPosition, theme, updateDraftInput, selectedProducts]);

  const handleSubmit = async () => {
    if (!plainText.trim() || isTyping) return;

    console.log('[ChatInput] 🎯 handleSubmit called - STREAMING VERSION');
    console.log('[ChatInput] Version check: callLangflowStreaming is', typeof callLangflowStreaming);

    // Construir conteúdo da mensagem com agentes no início (se houver)
    let messageContent = plainText.trim();
    if (selectedAgents.length > 0) {
      const agentTags = selectedAgents.map(a => `[@${a.replace(/\s+/g, '')}]`).join(' ');
      messageContent = `${agentTags} ${messageContent}`;
    }
    
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
    
    // Clear draft and reset local state
    clearDraftInput();
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    clearChatTags();
    setUserReactivatedAutoMode(false);
    setTyping(true);

    try {
      let sessionId = currentSessionId;
      
      if (!sessionId) {
        sessionId = await createNewSession(messageContent);
        if (!sessionId) throw new Error('Failed to create session');
        
        if (drawings.length > 0) {
          for (const drawing of drawings) {
            await addDrawingToSession(drawing, sessionId);
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
      
      // Add BTC price and auto mode tags to message before sending to Langflow
      let messageWithMetadata = userMessage.content;
      
      // Add BTC price tag if available
      // COMMENTED OUT: BTC price is no longer sent in the payload
      // if (btcPrice) {
      //   messageWithMetadata += ` [[PRICE_BTC_NOW:${btcPrice.toFixed(2)}]]`;
      // }
      
      // Add auto mode tag (always present)
      messageWithMetadata += autoMode ? ' [[AUTO_MODE_ON]]' : ' [[AUTO_MODE_OFF]]';
      
      // Create empty assistant message for streaming
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      const assistantDbId = await addMessage(assistantMessage, sessionId);
      // Use the Supabase UUID for subsequent updates so content persists correctly
      const assistantMessageId = assistantDbId || assistantMessage.id;
      
      console.log('[ChatInput] 🚀 Starting streaming request...');
      console.log('[ChatInput] Message to send:', messageWithMetadata);
      console.log('[ChatInput] Session ID:', sessionId);
      console.log('[ChatInput] Assistant message ID:', assistantMessageId);
      
      try {
        // Use streaming API
        console.log('[ChatInput] ⚡ Calling callLangflowStreaming NOW...');
        await callLangflowStreaming(
          messageWithMetadata,
          sessionId,
          (chunk: string, isComplete: boolean) => {
            console.log('[ChatInput] 📦 Received chunk, isComplete:', isComplete, 'length:', chunk.length);
            // Update message content progressively
            updateMessageContent(assistantMessageId, chunk);
            
            // When complete, process UI events (cards/placeholders)
            if (isComplete) {
              console.log('[ChatInput] ✅ Stream complete, final content length:', chunk.length);
              // Note: UI events (cards) are now handled by ChatMessages via placeholders
              // No need to process them here separately
            }
          }
        );
      } catch (streamError) {
        console.error('[ChatInput] ❌ Streaming failed, falling back to mock:', streamError);
        // Fallback to mock simulation
        const response = await simulateLangFlowResponse(userMessage.content);
        updateMessageContent(assistantMessageId, response.chat_message);
        
        // Process UI events from mock
        for (let i = 0; i < response.ui_events.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
          await processUIEvent(response.ui_events[i], sessionId, (sidebar, panel) => {
            notifyPanelActivation(sidebar, panel);
          });
        }
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
    
    // Handle Home key - move cursor to absolute beginning of editor
    if (e.key === 'Home' && !e.shiftKey) {
      e.preventDefault();
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection) return;
      
      const range = document.createRange();
      
      // Find the first text node or position at the very start
      const firstChild = editorRef.current.firstChild;
      if (firstChild) {
        if (firstChild.nodeType === Node.TEXT_NODE) {
          range.setStart(firstChild, 0);
        } else {
          range.setStartBefore(firstChild);
        }
      } else {
        range.setStart(editorRef.current, 0);
      }
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      lastCursorRangeRef.current = range.cloneRange();
    }
    
    // Handle End key - move cursor to absolute end of editor
    if (e.key === 'End' && !e.shiftKey) {
      e.preventDefault();
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection) return;
      
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to end
      
      selection.removeAllRanges();
      selection.addRange(range);
      lastCursorRangeRef.current = range.cloneRange();
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
        /* Scope inline-tag styles to chat-editor only to prevent leaking to other components */
        .chat-editor .inline-tag {
          user-select: all;
          display: inline-flex;
          align-items: center;
          padding: 0px 8px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          margin: 0 4px;
          cursor: default;
        }
      `}</style>
      <div className={`relative rounded-2xl ${isSidebar ? 'shadow-lg shadow-black/20' : ''}`}>
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/50 via-rose-400/50 to-red-500/50 animate-slow-pulse" />

        <div className={`relative rounded-2xl border transition-colors ${
          theme === 'dark'
            ? isSidebar ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-900 border-zinc-700/50'
            : 'bg-white border-gray-200'
        }`}>
          {/* Agent Tags Header - aparece quando há agentes selecionados */}
          {selectedAgents.length > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${
              theme === 'dark' ? 'border-zinc-700/50 bg-zinc-800/50' : 'border-gray-100 bg-gray-50/50'
            }`}>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                Invoking:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgents.map((agent) => {
                  const agentTag = agent.replace(/\s+/g, '');
                  return (
                    <span
                      key={agent}
                      className="inline-flex items-center gap-1 px-2 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(239, 68, 68, 0.25)',
                        color: theme === 'dark' ? '#fca5a5' : '#5c1a1a',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        lineHeight: '1.4',
                        paddingTop: '2px',
                        paddingBottom: '2px',
                      }}
                    >
                      @{agentTag}
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contenteditable Editor */}
          <div className="px-3 pt-2">
            <div
              ref={editorRef}
              contentEditable={!isTyping}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={saveCursorPosition}
              onClick={saveCursorPosition}
              onMouseUp={saveCursorPosition}
              onKeyUp={saveCursorPosition}
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
                  onClick={() => {
                    const newAutoMode = !autoMode;
                    updateDraftInput({ autoMode: newAutoMode });
                    // Se usuário está reativando o autoMode enquanto tem agentes selecionados,
                    // marca que ele quer usar ambos (auto mode + agentes específicos)
                    if (newAutoMode && selectedAgents.length > 0) {
                      setUserReactivatedAutoMode(true);
                    }
                  }}
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
                  <span className="min-w-0">Select Agent{selectedAgents.length > 0 ? ` (${selectedAgents.length})` : ''}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                {isAgentDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-52 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                  }`}>
                    {AGENTS.map((agent) => (
                      <button key={agent} type="button"
                        onClick={() => toggleAgent(agent)}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2 ${
                          theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedAgents.includes(agent)
                            ? 'bg-red-500 border-red-500'
                            : theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
                        }`}>
                          {selectedAgents.includes(agent) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{agent}</span>
                      </button>
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
                  <span>Markets{selectedProducts.length > 0 ? ` (${selectedProducts.length})` : ''}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isProductDropdownOpen && (
                  <div className={`absolute bottom-full left-0 mb-1 w-44 rounded-lg shadow-lg border overflow-hidden z-50 ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                  }`}>
                    {PRODUCTS.map((product) => (
                      <button key={product} type="button"
                        onClick={() => toggleProduct(product)}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2 ${
                          theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700/50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedProducts.includes(product)
                            ? 'bg-purple-500 border-purple-500'
                            : theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
                        }`}>
                          {selectedProducts.includes(product) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{product}</span>
                      </button>
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
          This is a simulated system. Interaction data is illustrative only.
        </p>
      )}
    </div>
  );
}
