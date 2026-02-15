import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Flame, Clock, TrendingUp, Zap, Coffee, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { computeAnalytics } from '../utils/analytics';
import { generateTimeSlots, CATEGORIES } from '../utils/storage';

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

const PRODUCTIVE_IDS = ['deep-work', 'meeting', 'email', 'admin', 'learning', 'creative', 'exercise'];
const UNPRODUCTIVE_IDS = ['leisure', 'other'];

function ProductivityHeatmap({ entries }) {
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const slots = generateTimeSlots();
  const entryMap = {};
  entries.forEach(e => { entryMap[e.slotId] = e; });

  // Group by hour for the grid rows
  const hours = [];
  for (let h = 6; h <= 23; h++) {
    hours.push(h);
  }

  const getSlotColor = (slotId) => {
    const entry = entryMap[slotId];
    if (!entry?.activity) return 'bg-surface-800/60'; // empty - dark gray
    if (entry.category === 'break') {
      return 'bg-amber-500/70'; // break - amber
    }
    if (UNPRODUCTIVE_IDS.includes(entry.category)) {
      return 'bg-red-400/70'; // unproductive - red
    }
    return 'bg-emerald-500'; // productive - green
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

      {/* Legend */}
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

      {/* Heatmap grid */}
      <div className="space-y-1">
        {/* Column headers */}
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
                      {/* Tooltip */}
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

export default function Analytics({ entries }) {
  const stats = computeAnalytics(entries);

  if (stats.totalSlots === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
          <BarChart3 size={28} className="text-surface-500" />
        </div>
        <h3 className="text-lg font-semibold text-surface-300 mb-2">No data yet</h3>
        <p className="text-sm text-surface-500 max-w-xs">
          Start logging your activities in the Log tab and your analytics will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard icon={Clock} label="Time Logged" value={`${stats.totalHours}h`} sub={`${stats.totalMinutes} minutes`} color="primary" />
        <StatCard icon={Brain} label="Productivity" value={`${stats.productivityScore}%`} sub={`${stats.productiveMinutes} min focused`} color="green" />
        <StatCard icon={Flame} label="Best Streak" value={`${stats.maxStreak}m`} sub="Uninterrupted focus" color="amber" />
        <StatCard icon={Zap} label="Peak Hour" value={stats.peakHourLabel} sub="Most active" color="pink" />
      </div>

      {/* Productivity Heatmap */}
      <ProductivityHeatmap entries={entries} />

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
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Hourly Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.hourlyData} barGap={0}>
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
