/**
 * Layout Constants
 *
 * Shared z-index layer values for consistent stacking context.
 * Use these instead of hardcoded z-index values to maintain layer hierarchy.
 */

/**
 * Z-index layers for consistent stacking order
 * Higher numbers stack on top of lower numbers
 */
export const Z_INDEX = {
  /** Base layer (default, no z-index needed) */
  BASE: 0,
  /** Sticky headers and navigation */
  STICKY: 10,
  /** Page headers that float above content */
  HEADER: 20,
  /** Sidebars and fixed panels */
  SIDEBAR: 30,
  /** Dropdowns and popovers */
  DROPDOWN: 40,
  /** Modals and dialogs */
  MODAL: 50,
  /** Tooltips and hover cards */
  TOOLTIP: 60,
  /** Toast notifications */
  TOAST: 70,
  /** Loading overlays and full-screen blockers */
  OVERLAY: 80,
  /** Maximum layer (confetti, special effects) */
  MAXIMUM: 100,
} as const;


