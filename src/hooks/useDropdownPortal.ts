import { useState, useRef, useEffect, useCallback } from 'react';

interface DropdownPosition {
  top: number;
  left: number;
}

interface UseDropdownPortalOptions {
  dropdownWidth?: number;
  gap?: number;
}

/**
 * Custom hook for managing dropdown state with Portal positioning.
 * Handles position calculation, click-outside detection, and keyboard events.
 * 
 * @param options - Configuration options
 * @param options.dropdownWidth - Width of the dropdown menu (default: 160px)
 * @param options.gap - Gap