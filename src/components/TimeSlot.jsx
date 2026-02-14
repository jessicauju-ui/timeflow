import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { CATEGORIES } from '../utils/storage';

export default function TimeSlot({ slot, entry, onSave, isCurrent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activity, setActivity] = useState(entry?.activity || '');
  const [category, setCategory] = useState(entry?.category || 'deep-work');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

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

  const cat = CATEGORIES.find(c => c.id === entry?.category);
  const hasEntry = entry?.activity;

  if (isEditing) {
    return (
      <div className={`group flex gap-3 p-3 rounded-2xl bg-surface-800 border border-primary-500/50 transition-all ${
        isCurrent ? 'ring-2 ring-primary-500/30' : ''
      }`}>
        <div className="w-16 pt-2.5 text-xs font-medium text-surface-400 text-right shrink-0">
          {slot.label}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What did you work on?"
            className="w-full bg-surface-900 border border-surface-600 rounded-xl px-3 py-2 text-sm text-white placeholder-surface-500 outline-none focus:border-primary-500 transition-colors"
          />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === c.id
                    ? 'ring-2 ring-offset-1 ring-offset-surface-800 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: c.color + '20',
                  color: c.color,
                  ringColor: category === c.id ? c.color : undefined,
                  ...(category === c.id ? { boxShadow: `0 0 0 2px ${c.color}` } : {}),
                }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group flex gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-surface-800/60 ${
        isCurrent ? 'bg-surface-800/40 ring-1 ring-primary-500/30' : ''
      } ${hasEntry ? '' : 'opacity-60 hover:opacity-100'}`}
    >
      <div className="w-16 pt-0.5 text-xs font-medium text-surface-400 text-right shrink-0 flex flex-col items-end">
        <span>{slot.label}</span>
        {isCurrent && (
          <span className="mt-1 flex items-center gap-1 text-primary-400">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-[10px]">now</span>
          </span>
        )}
      </div>
      {hasEntry ? (
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div
            className="w-1 h-8 rounded-full shrink-0"
            style={{ backgroundColor: cat?.color || '#64748b' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{entry.activity}</p>
            <p className="text-xs mt-0.5" style={{ color: cat?.color || '#64748b' }}>
              {cat?.emoji} {cat?.label}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center">
          <p className="text-sm text-surface-600 group-hover:text-surface-400 transition-colors">
            Click to log activity...
          </p>
        </div>
      )}
    </div>
  );
}
