import { useMemo, useState, useRef } from 'react';
import type { Post } from '@/lib/types';

type Props = { posts: Post[]; allPosts: Post[] };
type Tooltip = { visible: boolean; text: string; x: number; y: number };

export default function HeatmapChart({ posts }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, text: '', x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { weeks, monthLabels, totalThisYear, maxStreak, currentYear } = useMemo(() => {
    const countMap: Record<string, number> = {};
    posts.forEach(p => {
      const key = p.created_at.slice(0, 10);
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End = Saturday of the current week (always fill to end of current week)
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    // Start = exactly 52 full weeks before end (Sunday)
    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7 - 6);

    const weeksArr: { date: Date; count: number; isFuture: boolean }[][] = [];
    const seenMonths = new Set<string>();
    const monthLabelsList: { label: string; weekIdx: number }[] = [];

    let current = new Date(start);
    let weekIdx = 0;

    while (current <= end) {
      const week: { date: Date; count: number; isFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = current.toISOString().slice(0, 10);
        const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
        if (!seenMonths.has(monthKey) && current.getDay() === 0) {
          seenMonths.add(monthKey);
          monthLabelsList.push({
            label: current.toLocaleString('default', { month: 'short' }),
            weekIdx,
          });
        }
        week.push({
          date: new Date(current),
          count: countMap[key] || 0,
          isFuture: current > today,
        });
        current.setDate(current.getDate() + 1);
      }
      weeksArr.push(week);
      weekIdx++;
    }

    // Count posts THIS calendar year (Jan 1 → today)
    const year = today.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    let totalThisYear = 0;
    posts.forEach(p => {
      const d = new Date(p.created_at);
      if (d >= startOfYear && d <= today) totalThisYear++;
    });

    // Streak: consecutive days ending today
    let streak = 0;
    const sd = new Date(today);
    while (countMap[sd.toISOString().slice(0, 10)]) {
      streak++;
      sd.setDate(sd.getDate() - 1);
    }

    return { weeks: weeksArr, monthLabels: monthLabelsList, totalThisYear, maxStreak: streak, currentYear: year };
  }, [posts]);

  function getCellColor(count: number, isFuture: boolean): string {
    if (isFuture) return 'rgba(255,255,255,0.03)';
    if (count === 0) return '#1e2733';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#39d353';
  }

  function handleCellHover(e: React.MouseEvent, cell: { date: Date; count: number; isFuture: boolean }) {
    if (cell.isFuture) return;
    const dateStr = cell.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const text = `${cell.count} post${cell.count !== 1 ? 's' : ''} · ${dateStr}`;
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({ visible: true, text, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
  }

  const CELL = 12; // px
  const GAP = 2;   // px
  const DAY_LABEL_W = 28;

  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '16px 20px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#c9d1d9', marginBottom: 2 }}>📅 Posting Activity</p>
          <p style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#8b949e' }}>
            <span style={{ color: '#c9d1d9', fontWeight: 700 }}>{totalThisYear}</span> post{totalThisYear !== 1 ? 's' : ''} in {currentYear}
            {maxStreak > 0 && <span style={{ color: '#39d353', marginLeft: 10 }}>🔥 {maxStreak}-day streak</span>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#8b949e' }}>
          <span>Less</span>
          {['#1e2733', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c, flexShrink: 0 }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid — scrolls horizontally on small screens */}
      <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch' }}>
      <div ref={containerRef} style={{ position: 'relative', minWidth: 680 }}>
        {/* Month labels row */}
        <div style={{ display: 'flex', marginBottom: 4 }}>
          <div style={{ width: DAY_LABEL_W, flexShrink: 0 }} />
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(m => m.weekIdx === wi);
              return (
                <div key={wi} style={{ width: CELL, fontSize: '0.58rem', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'visible' }}>
                  {ml?.label || ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'flex' }}>
          {/* Day labels */}
          <div style={{ width: DAY_LABEL_W, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: GAP, paddingTop: 1 }}>
            {[null, 'Mon', null, 'Wed', null, 'Fri', null].map((d, i) => (
              <div key={i} style={{ height: CELL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, fontSize: '0.58rem', color: '#8b949e', flexShrink: 0 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Week columns — space-between fills the container */}
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', gap: 0 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      background: getCellColor(cell.count, cell.isFuture),
                      cursor: !cell.isFuture && cell.count > 0 ? 'pointer' : 'default',
                      border: '1px solid rgba(255,255,255,0.04)',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => handleCellHover(e, cell)}
                    onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {tooltip.visible && (
          <div style={{
            position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 36,
            background: '#1c2128', border: '1px solid #30363d', color: '#c9d1d9',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            padding: '5px 10px', borderRadius: 6, pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            {tooltip.text}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
