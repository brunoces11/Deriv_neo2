import { useState, useRef, useEffect } from 'react';
import { MessageSquare, MoreVertical, Edit, Star, Archive, Trash2 } from 'lucide-react';
import { useChat } from '../../store/ChatContext';
import { useTheme } from '../../store/ThemeContext';
import type { ChatSession } from '../../types';

interface ChatSessionCardProps {
  session: ChatSession;
}

export function ChatSessionCard({ session }: ChatSessionCardProps) {
  const { theme } = useTheme();
  const { loadSession, updateSession, deleteSession, currentSessionId } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(session.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = currentSessionId === session.id;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleSessionClick = () => {
    if (!isRenaming) {
      loadSession(session.id);
    }
  };

  const handleRename = async () => {
    if (newTitle.trim() && newTitle !== session.title) {
      await updateSession(session.id, { title: newTitle.trim() });
    }
    setIsRenaming(false);
    setIsMenuOpen(false);
  };

  const handleFavorite = async () => {
    await updateSession(session.id, { is_favorite: !session.is_favorite });
    setIsMenuOpen(false);
  };

  const handleArchive = async () => {
    await updateSession(session.id, { is_archived: !session.is_archived });
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(session.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isActive
          ? theme === 'dark'
            ? 'bg-zinc-800'
            : 'bg-gray-200'
          : theme === 'dark'
            ? 'hover:bg-zinc-800/50'
            : 'hover:bg-gray-100'
      }`}
    >
      <MessageSquare className={`w-4 h-4 flex-shrink-0 transition-colors ${
        theme === 'dark'
          ? 'text-zinc-400 group-hover:text-white'
          : 'text-gray-600 group-hover:text-gray-900'
      }`} />

      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setNewTitle(session.title);
              setIsRenaming(false);
            }
          }}
          className={`flex-1 text-sm bg-transparent border-none outline-none ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          onClick={handleSessionClick}
          className={`flex-1 text-left text-sm truncate transition-colors ${
            theme === 'dark'
              ? 'text-zinc-400 group-hover:text-white'
              : 'text-gray-600 group-hover:text-gray-900'
          }`}
        >
          {session.title}
        </button>
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
            isMenuOpen ? 'opacity-100' : ''
          } ${
            theme === 'dark'
              ? 'hover:bg-zinc-700'
              : 'hover:bg-gray-200'
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div
            className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-50 border ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Edit className="w-4 h-4" />
              Rename chat
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Star className={`w-4 h-4 ${session.is_favorite ? 'fill-brand-green text-brand-green' : ''}`} />
              {session.is_favorite ? 'Unfavorite chat' : 'Favorite chat'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArchive();
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Archive className="w-4 h-4" />
              {session.is_archived ? 'Unarchive chat' : 'Archive chat'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-t ${
                theme === 'dark'
                  ? 'hover:bg-red-950/20 text-red-400 border-zinc-700'
                  : 'hover:bg-red-50 text-red-600 border-gray-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
