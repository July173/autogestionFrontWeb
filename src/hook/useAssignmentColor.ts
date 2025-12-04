import { useCallback } from 'react';

/**
 * Hook that returns a function to compute color classes for assignment badge
 * based on assigned learners and maximum allowed.
 *
 * The mapping uses a reference scale where:
 *  - Verde: 1..50
 *  - Amarillo: 51..65
 *  - Rojo: 66..80
 *
 * To keep it dynamic when `max` changes we compute percentages from the reference
 * max (80) and apply them to the provided `max` value.
 */
export default function useAssignmentColor() {
  // reference thresholds (absolute values for a reference max of 80)
  const REFERENCE_MAX = 80;
  const GREEN_REF = 50; // <=50 -> green
  const YELLOW_REF = 65; // 51-65 -> yellow

  return useCallback((assigned: number | undefined, max: number | undefined) => {
    const a = Number(assigned ?? 0);
    const m = Number(max ?? 0);

    if (!m || m <= 0) {
      return { bg: 'bg-gray-200', text: 'text-gray-700' };
    }

    const greenPercent = GREEN_REF / REFERENCE_MAX; // ~0.625
    const yellowPercent = YELLOW_REF / REFERENCE_MAX; // ~0.8125

    const ratio = a / m; // fraction from 0..1

    if (ratio <= greenPercent) return { bg: 'bg-green-400', text: 'text-green-900' };
    if (ratio <= yellowPercent) return { bg: 'bg-amber-200', text: 'text-yellow-700' };
    return { bg: 'bg-rose-400', text: 'text-red-600' };
  }, []);
}
