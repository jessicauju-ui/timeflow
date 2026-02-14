import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { generateTimeSlots, getCurrentSlotId, CATEGORIES } from '../utils/storage';

function SlotCell({ slot, entry, onSave, isCurrent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activity, setActivity] = useState(entry?.activity || '');
  const [category, setCategory] = useState(entry?.category || 'deep-work');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const cat = CATEGORIES.find(c => c.id === entry?.category);
  const hasEntry = !!entry?.activity;

  const handleSave = () => {
    if (activity.trim()) {
      onSave(slot.id, { activity: activity.trim(), category });
    } else {
      onSave(slot.id, { activity: '', category: '' });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setActivity(entry?.activity || '');
    setCategory(entry?.category || 'deep-work');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const openEdit = () => {
    setActivity(entry?.activity || '');
    setCategory(entry?.category || 'deep-work');
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="col-span-4 bg-surface-800 border border-primary-500/40 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-primary-400">{slot.label}</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What did you work on?"
          className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500 transition-colors"
        />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                category === c.id ? 'scale-105' : 'opacity-50 hover:opacity-90'
              }`}
              style={{
                backgroundColor: c.color + '20',
                color: c.color,
                ...(category === c.id ? { boxShadow: `0 0 0 1.5px ${c.color}` } : {}),
              }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400"><X size={14} /></button>
          <button onClick={handleSave} className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white"><Check size={14} /></button>
        </div>
      </div>
    );
  }

  const minute = slot.id.split(':')[1];

  return (
    <button
      onClick={openEdit}
      className={`relative group rounded-xl p-2.5 text-left transition-all border min-h-[72px] flex flex-col justify-between ${
        isCurrent
          ? 'border-primary-500/50 bg-primary-500/10 ring-1 ring-primary-500/20'
          : hasEntry
            ? 'border-surface-700/50 bg-surface-800/50 hover:bg-surface-800'
            : 'border-surface-800/50 bg-surface-900/30 hover:bg-surface-800/40 hover:border-surface-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium ${isCurrent ? 'text-primary-400' : 'text-surface-500'}`}>
          :{minute}
        </span>
        {isCurrent && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
        )}
      </div>
      {hasEntry ? (
        <div className="mt-1">
          <div className="w-full h-0.5 rounded-full mb-1.5" style={{ backgroundColor: cat?.color || '#64748b' }} />
          <p className="text-xs text-white leading-tight line-clamp-2">{entry.activity}</p>
          <p className="text-[10px] mt-0.5" style={{ color: cat?.color }}>
            {cat?.emoji} {cat?.label}
          </p>
        </div>
      ) : (
        <p className="text-[10px] text-surface-600 group-hover:text-surface-500 mt-1">+ log</p>
      )}
    </button>
  );
}

export default function TimeLog({ entries, onSave }) {
  const slots = generateTimeSlots();
  const currentSlotId = getCurrentSlotId();
  const currentHour = parseInt(currentSlotId.split(':')[0]);
  const currentRef = useRef(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const entryMap = {};
  entries.forEach(e => { entryMap[e.slotId] = e; });

  // Group by hour
  const hourGroups = [];
  for (let h = 6; h <= 23; h++) {
    const hourSlots = slots.filter(s => s.hour === h);
    hourGroups.push({ hour: h, slots: hourSlots });
  }

  const filledCount = entries.filter(e => e.activity).length;
  const progress = Math.round((filledCount / slots.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-surface-900 rounded-2xl p-4 border border-surface-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-surface-300">Today's Progress</span>
          <span className="text-sm font-semibold text-primary-400">{filledCount} / {slots.length} slots</span>
        </div>
        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Hour grid */}
      <div className="space-y-2">
        {hourGroups.map(({ hour, slots: hourSlots }) => {
          const hourLabel = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
          const isCurrHour = hour === currentHour;
          const hourEntries = hourSlots.filter(s => entryMap[s.id]?.activity);

          return (
            <div
              key={hour}
              ref={isCurrHour ? currentRef : null}
              className={`rounded-2xl border transition-all ${
                isCurrHour
                  ? 'border-primary-500/30 bg-surface-900/80'
                  : 'border-surface-800/50 bg-surface-900/40'
              }`}
            >
              {/* Hour header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-800/50">
                <div className="flex items-center gap-2">
                  {isCurrHour && <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />}
                  <span className={`text-sm font-semibold ${isCurrHour ? 'text-primary-300' : 'text-surface-300'}`}>
                    {hourLabel}
                  </span>
                </div>
                <span className="text-xs text-surface-500">
                  {hourEntries.length}/4 logged
                </span>
              </div>

              {/* 4-column grid of 15-min slots */}
              <div className="grid grid-cols-4 gap-2 p-2">
                {hourSlots.map(slot => (
                  <SlotCell
                    key={slot.id}
                    slot={slot}
                    entry={entryMap[slot.id]}
                    onSave={onSave}
                    isCurrent={slot.id === currentSlotId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
