export const motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 200,
    slow: 320,
  },
  easing: {
    enter: 'ease-out',
    exit: 'ease-in',
    change: 'ease-in-out',
  },
  reduceSpatialMotion: false,
} as const;

export const reducedMotion = {
  duration: {
    instant: 0,
    fast: 0,
    standard: 120,
    slow: 120,
  },
  easing: motion.easing,
  reduceSpatialMotion: true,
} as const;

export type MotionTokens = typeof motion | typeof reducedMotion;

export function resolveMotionTokens(reduceMotion: boolean): MotionTokens {
  return reduceMotion ? reducedMotion : motion;
}
