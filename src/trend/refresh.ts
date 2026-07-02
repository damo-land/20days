import { SCALE } from '@/config';
import { getLastVerdictAtMs, getScoreRowsSince } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { useAppStore } from '@/state/store';
import { expressiveness } from '@/theme/expressive';
import { DEFAULT_TREND_CONFIG, detectTrend, shouldTriggerVerdict } from './engine';
import { buildDailySeries } from './series';

/** Glue: read entries → compute trend + expressiveness dial → push into the store. */
export function refreshTrend(): void {
  const cfg = DEFAULT_TREND_CONFIG;
  const rows = getScoreRowsSince(isoDaysAgo(cfg.windowDays - 1));
  const series = buildDailySeries(rows, cfg.windowDays, todayISO());
  const result = detectTrend(series, cfg);
  const ready = shouldTriggerVerdict(result, getLastVerdictAtMs(), Date.now(), cfg);
  const logged = series.filter((p) => p.value != null);
  const todayComposite = logged.length ? logged[logged.length - 1].value : null;
  const dial = expressiveness(result.state, todayComposite, SCALE.min, SCALE.max);
  useAppStore.getState().setTrend(result, ready, dial);
}
