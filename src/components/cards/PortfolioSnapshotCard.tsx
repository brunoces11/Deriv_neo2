import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, TrendingUp, TrendingDown, MoreVertical, ChevronDown, ChevronUp, Star, Pencil, Trash2, Calendar } from 'lucide-react';
import { CardWrapper } from './CardWrapper';
import { useTheme } from '../../store/ThemeContext';
import { useChat } from '../../store/ChatContext';
import type { BaseCard, PortfolioSnapshotPayload } from '../../types';

interface PortfolioSnapshotCardProps {
  card: BaseCard;
  defaultExpanded?: boolean;
}

const assetColors = ['bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

/**
 * PortfolioSnapshotCard Component
 * 
 * Compact mode: 2 lines only
 * - Line 1: Icon + "PORTFOLIO" title + 24h change badge (USD + %)
 * - Line 2: Asset allocation summary (BTC 45% | ETH 30% | SOL 15% | OTHER 10%)
 * - Right side: Three-dots menu + Expand/Collapse button
 * 
 * Expanded mode: Full portfolio details with allocation bar and asset breakdown
 */
export function PortfolioSnapshotCard({ card, defaultExpanded = false }: PortfolioSnapshotCardProps) {
  // === ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS ===
  const { theme } = useTheme();
  const { favoriteCard, unfavoriteCard } = useChat();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Safe payload access - card may be undefined during deletion
  const payload = card?.payload as unknown as PortfolioSnapshotPayload | undefined;
  const changePercent = payload?.changePercent || '+0%';
  const isPositive = changePercent.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const cardTitle = payload?.title || 'Portfolio';

  // Calculate dropdown position based on button location
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 160;
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - dropdownWidth,
      });
    }
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
    }
  }, [isDropdownOpen, updateDropdownPosition]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handlePositionUpdate = () => updateDropdownPosition();
    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);
    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isDropdownOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDropdownOpen]);

  // === GUARD CHECK - All hooks must be ABOVE this line ===
  if (!card || !card.id || !payload) {
    return null;
  }

  const handleFavorite = () => {
    if (card.isFavorite) {
      unfavoriteCard(card.id);
    } else {
      favoriteCard(card.id);
    }
    setIsDropdownOpen(false);
  };

  const handleEdit = () => {
    console.log('[PortfolioSnapshotCard] Edit');
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    console.log('[PortfolioSnapshotCard] Delete');
    setIsDropdownOpen(false);
  };

  const handleSchedule = () => {
    console.log('[PortfolioSnapshotCard] Schedule');
    setIsDropdownOpen(false);
  };

  // Format asset allocation for compact display (e.g., "BTC 45% | ETH 30% | SOL 15% | OTHER 10%")
  const formatAssetAllocation = () => {
    return payload.assets.map(asset => `${asset.symbol} ${asset.allocation}%`).join(' | ');
  };

  // Dropdown content rendered via Portal
  const dropdownContent = isDropdownOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed w-40 rounded-lg shadow-xl border z-[99999] ${
        theme === 'dark'
          ? 'bg-zinc-800 border-zinc-700'
          : 'bg-white border-gray-200'
      }`}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <button
        onClick={handleFavorite}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
          theme === 'dark'
            ? 'text-zinc-300 hover:bg-zinc-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Star className={`w-4 h-4 ${card.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
        {card.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
      </button>
      <button
        onClick={handleEdit}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
          theme === 'dark'
            ? 'text-zinc-300 hover:bg-zinc-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Pencil className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={handleDelete}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
          theme === 'dark'
            ? 'text-zinc-300 hover:bg-zinc-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
      <button
        onClick={handleSchedule}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-b-lg ${
          theme === 'dark'
            ? 'text-zinc-300 hover:bg-zinc-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Calendar className="w-4 h-4" />
        Schedule
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <CardWrapper card={card} accentColor="red" hasOpenDropdown={isDropdownOpen}>
      <div className="flex items-center gap-3">
        {/* Icon - neutral gray */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-200/70'}`}>
          <Wallet className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} />
        </div>

        {/* Content - 2 lines */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Title + 24h change badge */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {cardTitle}
            </span>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              isPositive 
                ? 'bg-[#00d0a0]/10 text-[#00d0a0]' 
                : 'bg-[#ff444f]/10 text-[#ff444f]'
            }`}>
              <TrendIcon className="w-3 h-3" />
              <span>{payload.change24h}</span>
              <span className="opacity-70">({payload.changePercent})</span>
            </div>
          </div>

          {/* Line 2: Asset allocation summary */}
          <div className={`text-xs mt-0.5 font-medium truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            {formatAssetAllocation()}
          </div>
        </div>

        {/* Action Buttons - Three-dots menu + Expand/Collapse */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Dropdown Menu (3 dots) */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => {
                if (!isDropdownOpen) updateDropdownPosition();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              title="More options"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Content - Rendered via Portal */}
            {dropdownContent}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
          {/* Total Value */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>Total Value</span>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {payload.totalValue}
              </h3>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isPositive ? 'bg-[#00d0a0]/10' : 'bg-[#ff444f]/10'
            }`}>
              <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-[#00d0a0]' : 'text-[#ff444f]'}`} />
              <span className={`text-sm font-medium ${isPositive ? 'text-[#00d0a0]' : 'text-[#ff444f]'}`}>
                {payload.changePercent}
              </span>
            </div>
          </div>

          {/* 24h Change */}
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            24h change: <span className={isPositive ? 'text-[#00d0a0]' : 'text-[#ff444f]'}>{payload.change24h}</span>
          </div>

          {/* Allocation Bar */}
          <div className={`h-2 rounded-full overflow-hidden flex mb-4 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`}>
            {payload.assets.map((asset, index) => (
              <div
                key={asset.symbol}
                className={`${assetColors[index % assetColors.length]} transition-all duration-500`}
                style={{ width: `${asset.allocation}%` }}
              />
            ))}
          </div>

          {/* Asset Breakdown */}
          <div className="space-y-2">
            {payload.assets.map((asset, index) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${assetColors[index % assetColors.length]}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>{asset.symbol}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {asset.value}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    {asset.allocation}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
