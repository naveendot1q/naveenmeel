'use client';

import { useMemo, useState, useRef } from 'react';
import type { Post } from '@/lib/types';

type Props = { posts: Post[]; allPosts: Post[] };

type TooltipState = { visible: boolean; text: string; x: number; y: number };

export default function HeatmapChart({ posts }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: '', x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { weeks, monthLabels, totalYear, maxStreak } = useMemo(() => {
    // Build date → count map from ALL posts (not filtered)
    const countMap: Record<string, number> = {};
    posts.forEach(p => {
      const key = p.created_at.slice(0, 10);
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on next Saturday
    const end = new Date(today);
    const dayOfWeek = end.getDay(); // 0=Sun
    end.setDate(end.getDate() + (6 - dayOfWeek));

    // Start 52 weeks back from end (Mon–Sun aligned)
    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7 - 6);

    // Build weeks array (each week = 7 days Sun→Sat)
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

    // Total posts in last year
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    let totalYear = 0;
    posts.forEach(p => {
      const d = new Date(p.created_at);
      if (d >= oneYearAgo && d <= today) totalYear++;
    });

    // Current streak
    let streak = 0;
    const d = new Date(today);
    while (countMap[d.toISOString().slice(0, 10)]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    return { weeks: weeksArr, monthLabels: monthLabelsList, totalYear, maxStreak: streak };
  }, [posts]);

  function getCellColor(count: number, isFuture: boolean): string {
    if (isFuture) return '#161b22';
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

  return (
    <div className="card p-5" style={{ background: '#161b22', position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-bold text-sm" style={{ color: '#c9d1d9' }}>
            📅 Posting Activity
          </h3>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#8b949e' }}>
            {totalYear} post{totalYear !== 1 ? 's' : ''} in the last year
            {maxStreak > 0 && <span style={{ color: '#39d353', marginLeft: 8 }}>🔥 {maxStreak}-day streak</span>}
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8b949e' }}>
          <span>Less</span>
          {['#1e2733', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid - scrollable on mobile */}
      <div className="overflow-x-auto" ref={containerRef} style={{ position: 'relative' }}>
        <div style={{ minWidth: 660 }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 28 }}>
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-xs"
                style={{
                  color: '#8b949e',
                  position: 'absolute',
                  left: 28 + m.weekIdx * 14,
                  fontSize: '0.62rem',
                }}
              >
                {m.label}
              </div>
            ))}
            <div style={{ height: 14 }} />
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-0" style={{ marginTop: 4 }}>
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1.5" style={{ paddingTop: 2 }}>
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <div key={i} style={{ height: 11, lineHeight: '11px', width: 22, fontSize: '0.6rem', color: '#8b949e', textAlign: 'right', paddingRight: 4 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      style={{
                        width: 11, height: 11,
                        borderRadius: 2,
                        background: getCellColor(cell.count, cell.isFuture),
                        opacity: cell.isFuture ? 0.2 : 1,
                        cursor: cell.isFuture || cell.count === 0 ? 'default' : 'pointer',
                        border: '1px solid rgba(255,255,255,.04)',
                        transition: 'border-color .1s',
                      }}
                      onMouseEnter={e => handleCellHover(e, cell)}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + 12, top: tooltip.y - 32,
            background: '#1c2128', border: '1px solid #30363d',
            color: '#c9d1d9', fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem', padding: '4px 10px', borderRadius: 4,
            pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 50,
          }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
