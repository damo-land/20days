import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Tracks the OS "Reduce Motion" setting so animations can fall back to no-overshoot / instant. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => active && setReduce(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
