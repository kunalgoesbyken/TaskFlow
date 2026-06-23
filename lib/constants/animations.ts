/**
 * Animation Constants
 *
 * Shared animation timing and spring physics presets for consistent motion design.
 * Used across animation components to maintain visual harmony.
 */

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  /** Fast micro-interactions (hover, focus) */
  FAST: 200,
  /** Standard transitions (enter, exit) */
  NORMAL: 300,
  /** Deliberate animations (page transitions) */
  SLOW: 500,
} as const;

/**
 * Spring physics presets for Framer Motion
 * Based on Material Design motion principles
 */
export const SPRING_PRESETS = {
  /** Default spring for most interactions */
  NORMAL: { stiffness: 300, damping: 30 },
  /** Soft spring for subtle feedback */
  SOFT: { stiffness: 100, damping: 15 },
  /** Bouncy spring for playful interactions */
  BOUNCY: { stiffness: 400, damping: 17 },
  /** Crisp spring for responsive UI */
  CRISP: { stiffness: 500, damping: 30 },
} as const;

/**
 * Common easing curves for tween animations
 */
export const EASING = {
  /** Smooth ease-in-out (Material standard) */
  DEFAULT: [0.4, 0, 0.2, 1] as const,
  /** Sharp ease-out for snappy feel */
  SHARP: [0, 0, 0.2, 1] as const,
  /** Linear for continuous animations */
  LINEAR: [0, 0, 1, 1] as const,
} as const;

/**
 * Stagger delays for sequential animations
 */
export const STAGGER = {
  /** Fast stagger for list items */
  FAST: 0.05,
  /** Normal stagger for sections */
  NORMAL: 0.1,
  /** Slow stagger for major blocks */
  SLOW: 0.15,
} as const;


