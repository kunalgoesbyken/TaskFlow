/**
 * Chart Constants
 *
 * Shared configuration for chart components (Recharts).
 * Ensures consistent sizing, margins, and styling across all charts.
 */

/**
 * Default chart dimensions
 */
export const CHART_DIMENSIONS = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 300,
} as const;

/**
 * Standard chart margins
 * Provides space for axes labels and titles
 */
export const CHART_MARGIN = {
  /** Default margin for most charts */
  DEFAULT: { top: 20, right: 30, left: 20, bottom: 60 },
} as const;

/**
 * Pie chart specific settings
 */
export const PIE_CHART = {
  /** Default outer radius */
  OUTER_RADIUS: 80,
} as const;

/**
 * Tooltip styling configuration
 */
export const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
} as const;
