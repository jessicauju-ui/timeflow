import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Flame, Clock, TrendingUp, Zap, Coffee, AlertTriangle, CheckCircle, BarChart3, Calendar } from 'lucide-react';
import { computeAnalytics, computePeriodAnalytics, PRODUCTIVE_IDS } from '../utils/analytics';
import { generateTimeSlots, CATEGORIES, getWeekRange, getMonthRange, loadDateRange } from '../utils/storage';

const UNPRODUCTIVE_IDS = ['leisure', 'other', 'social', 'chores', 'commute'];

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-600/20 to-primary-600/5 border-primary-500/20 text-primary-400',
    green: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    pink: 'from-pink-600/20 to-pink-600/5 border-pink-500/20 text-pink-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-3`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={14} />
        <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-surface-400 mt-1 truncate">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-surface-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value} min
        </p>
      ))}
    </div>
  );
};

// ─── Daily Productivity Heatmap (unchanged) ───

function ProductivityHeatmap({ entries }) {
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const entryMap = {};
  entries.forEach(e => { entryMap[e.slotId] = e; });

  const hours = [];
  for (let h = 6; h <= 23; h++) hours.push(h);

  const getSlotColor = (slotId) => {
    const entry = entryMap[slotId];
    if (!entry?.activity) return 'bg-surface-800/60';
    if (entry.category === 'break') return 'bg-amber-500/70';
    if (UNPRODUCTIVE_IDS.includes(entry.category)) return 'bg-red-400/70';
    return 'bg-emerald-500';
  };

  const getSlotOpacity = (slotId) => {
    const entry = entryMap[slotId];
    if (!entry?.activity) return 'opacity-40';
    return 'opacity-100';
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-3 sm:p-5">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1">Daily Productivity Map</h3>
      <p className="text-xs text-surface-500 mb-4">Each block = 15 minutes of your day</p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-surface-400">Productive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400/70" />
          <span className="text-surface-400">Not productive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500/70" />
          <span className="text-surface-400">Break</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-surface-800/60 opacity-40" />
          <span className="text-surface-400">No entry</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-0.5 sm:gap-1 mb-1">
          <div className="w-10 sm:w-14 shrink-0" />
          <div className="flex-1 grid grid-cols-4 gap-0.5 sm:gap-1 text-center">
            <span className="text-[10px] text-surface-500">:00</span>
            <span className="text-[10px] text-surface-500">:15</span>
            <span className="text-[10px] text-surface-500">:30</span>
            <span className="text-[10px] text-surface-500">:45</span>
          </div>
        </div>

        {hours.map(h => {
          const hourLabel = `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
          const minuteSlots = [0, 15, 30, 45].map(m => {
            const slotId = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            return { slotId, entry: entryMap[slotId] };
          });

          return (
            <div key={h} className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-10 sm:w-14 shrink-0 text-right pr-1 sm:pr-2">
                <span className="text-[10px] sm:text-[11px] font-medium text-surface-500">{hourLabel}</span>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-0.5 sm:gap-1">
                {minuteSlots.map(({ slotId, entry }) => {
                  const cat = CATEGORIES.find(c => c.id === entry?.category);
                  return (
                    <div
                      key={slotId}
                      className="relative"
                      onMouseEnter={() => setHoveredSlot(slotId)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onTouchStart={() => setHoveredSlot(slotId)}
                      onTouchEnd={() => setTimeout(() => setHoveredSlot(null), 1500)}
                    >
                      <div
                        className={`h-6 sm:h-7 rounded-md transition-all cursor-default ${getSlotColor(slotId)} ${getSlotOpacity(slotId)} ${
                          hoveredSlot === slotId ? 'ring-2 ring-white/30 scale-105' : ''
                        }`}
                      />
                      {hoveredSlot === slotId && entry?.activity && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                          <div className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 shadow-2xl whitespace-nowrap">
                            <p className="text-xs font-medium text-white">{entry.activity}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: cat?.color }}>
                              {cat?.emoji} {cat?.label}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Weekly Heatmap (days × hours) ───

function WeeklyHeatmap({ dailySummaries }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [];
  for (let h = 6; h <= 23; h++) hours.push(h);

  // Reorder summaries Mon(1)..Sun(0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0].map(dow =>
    dailySummaries.find(d => d.dayOfWeek === dow)
  );

  const getHourData = (daySummary, hour) => {
    if (!daySummary?.entries) return { productive: 0, other: 0, total: 0 };
    const hourEntries = daySummary.entries.filter(e => {
      if (!e.activity) return false;
      return parseInt(e.slotId.split(':')[0]) === hour;
    });
    const productive = hourEntries.filter(e => PRODUCTIVE_IDS.includes(e.category)).length;
    const other = hourEntries.length - productive;
    return { productive, other, total: hourEntries.length };
  };

  const getCellColor = (data) => {
    if (data.total === 0) return 'bg-surface-800/60 opacity-40';
    if (data.productive >= data.other) {
      const intensity = Math.min(data.total / 4, 1);
      if (intensity > 0.75) return 'bg-emerald-500';
      if (intensity > 0.5) return 'bg-emerald-500/80';
      if (intensity > 0.25) return 'bg-emerald-500/60';
      return 'bg-emerald-500/40';
    }
    return 'bg-red-400/70';
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-3 sm:p-5">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1">Weekly Activity Grid</h3>
      <p className="text-xs text-surface-500 mb-4">Each block = 1 hour of your week</p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-surface-400">Productive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400/70" />
          <span className="text-surface-400">Not productive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-surface-800/60 opacity-40" />
          <span className="text-surface-400">No entry</span>
        </div>
      </div>

      <div className="space-y-1 overflow-x-auto">
        {/* Hour headers */}
        <div className="flex items-center gap-0.5 mb-1" style={{ minWidth: '500px' }}>
          <div className="w-10 shrink-0" />
          <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(18, minmax(0, 1fr))` }}>
            {hours.map(h => (
              <span key={h} className="text-[8px] sm:text-[10px] text-surface-500 text-center">
                {h % 12 || 12}{h < 12 ? 'a' : 'p'}
              </span>
            ))}
          </div>
        </div>

        {orderedDays.map((daySummary, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-0.5" style={{ minWidth: '500px' }}>
            <div className="w-10 shrink-0 text-right pr-1">
              <span className="text-[10px] font-medium text-surface-500">{dayNames[dayIdx]}</span>
            </div>
            <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(18, minmax(0, 1fr))` }}>
              {hours.map(h => {
                const data = getHourData(daySummary, h);
                const cellKey = `${dayIdx}-${h}`;
                return (
                  <div
                    key={h}
                    className="relative"
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className={`h-5 sm:h-6 rounded-sm transition-all cursor-default ${getCellColor(data)} ${
                      hoveredCell === cellKey ? 'ring-2 ring-white/30 scale-110' : ''
                    }`} />
                    {hoveredCell === cellKey && data.total > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                        <div className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 shadow-2xl whitespace-nowrap">
                          <p className="text-xs font-medium text-white">{dayNames[dayIdx]} {h % 12 || 12}:00 {h < 12 ? 'AM' : 'PM'}</p>
                          <p className="text-[10px] text-emerald-400">{data.productive * 15} min productive</p>
                          {data.other > 0 && <p className="text-[10px] text-surface-400">{data.other * 15} min other</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly Calendar Heatmap ───

function MonthlyHeatmap({ dailySummaries, selectedDate }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const d = new Date(selectedDate + 'T12:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const summaryMap = {};
  dailySummaries.forEach(s => { summaryMap[s.dayNumber] = s; });

  const getScoreColor = (score, hasData) => {
    if (!hasData) return 'bg-surface-800/40';
    if (score >= 70) return 'bg-emerald-500/70';
    if (score >= 50) return 'bg-yellow-400/60';
    if (score >= 30) return 'bg-amber-500/60';
    return 'bg-red-500/60';
  };

  const weeks = [];
  let currentWeek = new Array(startDow).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const colHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-3 sm:p-5">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1">Monthly Overview</h3>
      <p className="text-xs text-surface-500 mb-4">Color = daily productivity score</p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
          <span className="text-surface-400">&ge;70%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-yellow-400/60" />
          <span className="text-surface-400">50-69%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500/60" />
          <span className="text-surface-400">30-49%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500/60" />
          <span className="text-surface-400">&lt;30%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-surface-800/40" />
          <span className="text-surface-400">No data</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {colHeaders.map(d => (
            <span key={d} className="text-[10px] text-surface-500 text-center">{d}</span>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={di} className="h-10 sm:h-12" />;
              }
              const summary = summaryMap[day];
              const hasData = summary && summary.totalSlots > 0;
              const score = hasData ? summary.productivityScore : 0;
              const cellKey = `day-${day}`;

              return (
                <div
                  key={di}
                  className="relative"
                  onMouseEnter={() => setHoveredDay(cellKey)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className={`h-10 sm:h-12 rounded-lg flex items-center justify-center transition-all cursor-default ${getScoreColor(score, hasData)} ${
                    hoveredDay === cellKey ? 'ring-2 ring-white/30 scale-105' : ''
                  }`}>
                    <span className="text-xs font-medium text-white/80">{day}</span>
                  </div>
                  {hoveredDay === cellKey && hasData && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                      <div className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 shadow-2xl whitespace-nowrap">
                        <p className="text-xs font-medium text-white">{summary.dayLabel}</p>
                        <p className="text-[10px] text-surface-400">{(summary.totalMinutes / 60).toFixed(1)}h logged</p>
                        <p className="text-[10px] text-emerald-400">{score}% productive</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Period Toggle ───

function PeriodToggle({ periodMode, setPeriodMode }) {
  return (
    <div className="flex items-center gap-3">
      <Calendar size={14} className="text-surface-400" />
      <div className="flex items-center bg-surface-900 border border-surface-800 rounded-xl p-1">
        {['daily', 'weekly', 'monthly'].map(mode => (
          <button
            key={mode}
            onClick={() => setPeriodMode(mode)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              periodMode === mode
                ? 'bg-primary-600/20 text-primary-400 shadow-sm'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Analytics Component ───

export default function Analytics({ entries, selectedDate }) {
  const [periodMode, setPeriodMode] = useState('daily');

  const { stats, periodLabel, isMultiDay } = useMemo(() => {
    if (periodMode === 'daily') {
      const s = computeAnalytics(entries);
      const d = new Date(selectedDate + 'T12:00:00');
      const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return { stats: s, periodLabel: label, isMultiDay: false };
    }

    const range = periodMode === 'weekly'
      ? getWeekRange(selectedDate)
      : getMonthRange(selectedDate);

    const dateEntriesMap = loadDateRange(range.start, range.end);
    const s = computePeriodAnalytics(dateEntriesMap);

    let label;
    if (periodMode === 'weekly') {
      const startD = new Date(range.start + 'T12:00:00');
      const endD = new Date(range.end + 'T12:00:00');
      const opts = { month: 'short', day: 'numeric' };
      label = `${startD.toLocaleDateString('en-US', opts)} – ${endD.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
    } else {
      const d = new Date(selectedDate + 'T12:00:00');
      label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return { stats: s, periodLabel: label, isMultiDay: true };
  }, [periodMode, entries, selectedDate]);

  const hourlyChartData = useMemo(() => {
    if (!isMultiDay || !stats.daysWithData) return stats.hourlyData;
    return stats.hourlyData.map(h => ({
      ...h,
      productive: Math.round(h.productive / stats.daysWithData),
      other: Math.round(h.other / stats.daysWithData),
    }));
  }, [stats, isMultiDay]);

  if (stats.totalSlots === 0) {
    return (
      <div className="space-y-6">
        <PeriodToggle periodMode={periodMode} setPeriodMode={setPeriodMode} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-surface-500" />
          </div>
          <h3 className="text-lg font-semibold text-surface-300 mb-2">No data yet</h3>
          <p className="text-sm text-surface-500 max-w-xs">
            {isMultiDay
              ? `No activities logged for this ${periodMode === 'weekly' ? 'week' : 'month'}.`
              : 'Start logging your activities in the Log tab and your analytics will appear here.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period toggle + label */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <PeriodToggle periodMode={periodMode} setPeriodMode={setPeriodMode} />
        <p className="text-xs text-surface-400">{periodLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Time Logged"
          value={`${stats.totalHours}h`}
          sub={isMultiDay ? `avg ${(stats.avgMinutesPerDay / 60).toFixed(1)}h/day` : `${stats.totalMinutes} minutes`}
          color="primary"
        />
        <StatCard
          icon={Brain}
          label="Productivity"
          value={`${isMultiDay ? stats.avgProductivityScore : stats.productivityScore}%`}
          sub={isMultiDay ? `across ${stats.daysWithData} day${stats.daysWithData !== 1 ? 's' : ''}` : `${stats.productiveMinutes} min focused`}
          color="green"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={`${stats.maxStreak}m`}
          sub={isMultiDay ? 'Best single-day streak' : 'Uninterrupted focus'}
          color="amber"
        />
        <StatCard
          icon={Zap}
          label="Peak Hour"
          value={stats.peakHourLabel}
          sub="Most active"
          color="pink"
        />
      </div>

      {/* Heatmap */}
      {periodMode === 'daily' && <ProductivityHeatmap entries={entries} />}
      {periodMode === 'weekly' && <WeeklyHeatmap dailySummaries={stats.dailySummaries} />}
      {periodMode === 'monthly' && <MonthlyHeatmap dailySummaries={stats.dailySummaries} selectedDate={selectedDate} />}

      {/* Insights */}
      {stats.insights.length > 0 && (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} />
            Insights
          </h3>
          {stats.insights.map((insight, i) => {
            const Icon = insight.type === 'positive' ? CheckCircle : insight.type === 'warning' ? AlertTriangle : Coffee;
            const color = insight.type === 'positive' ? 'text-emerald-400' : insight.type === 'warning' ? 'text-amber-400' : 'text-surface-400';
            return (
              <div key={i} className="flex gap-3 items-start">
                <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
                <p className="text-sm text-surface-300">{insight.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hourly bar chart */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
            {isMultiDay ? 'Avg Hourly Breakdown' : 'Hourly Breakdown'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyChartData} barGap={0}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="productive" name="Productive" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="other" name="Other" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie chart */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Category Split</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    dataKey="minutes"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {stats.categoryBreakdown.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2">
              {stats.categoryBreakdown.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-surface-300 flex-1 truncate">{c.emoji} {c.label}</span>
                  <span className="text-xs font-medium text-surface-400">{c.hours}h</span>
                  <span className="text-xs text-surface-500 w-8 text-right">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
