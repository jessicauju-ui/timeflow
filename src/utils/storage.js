const STORAGE_KEY = 'timeflow_data';

export function getToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadDayData(date) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return all[date] || { date, entries: [] };
}

export function saveDayData(date, data) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  all[date] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getAllDates() {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return Object.keys(all).sort().reverse();
}

export function generateTimeSlots() {
  const slots = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const minute = m.toString().padStart(2, '0');
      slots.push({
        id: `${h.toString().padStart(2, '0')}:${minute}`,
        label: `${hour}:${minute} ${ampm}`,
        hour: h,
        minute: m,
      });
    }
  }
  return slots;
}

export const CATEGORIES = [
  { id: 'deep-work', label: 'Deep Work', color: '#6366f1', emoji: '🧠' },
  { id: 'meeting', label: 'Meeting', color: '#f59e0b', emoji: '👥' },
  { id: 'email', label: 'Email / Comms', color: '#3b82f6', emoji: '📧' },
  { id: 'admin', label: 'Admin', color: '#f472b6', emoji: '📋' },
  { id: 'learning', label: 'Learning', color: '#8b5cf6', emoji: '📚' },
  { id: 'creative', label: 'Creative', color: '#14b8a6', emoji: '🎨' },
  { id: 'exercise', label: 'Exercise', color: '#ef4444', emoji: '💪' },
  { id: 'break', label: 'Break', color: '#10b981', emoji: '☕' },
  { id: 'leisure', label: 'Leisure', color: '#f97316', emoji: '🎮' },
  { id: 'chores', label: 'Chores', color: '#a3e635', emoji: '🧹' },
  { id: 'morning-ritual', label: 'Morning Ritual', color: '#fbbf24', emoji: '🌅' },
  { id: 'night-ritual', label: 'Night Ritual', color: '#818cf8', emoji: '🌙' },
  { id: 'startup-ritual', label: 'Startup Ritual', color: '#34d399', emoji: '🚀' },
  { id: 'shutdown-ritual', label: 'Shutdown Ritual', color: '#fb923c', emoji: '🔒' },
  { id: 'commute', label: 'Commute', color: '#38bdf8', emoji: '🚗' },
  { id: 'social', label: 'Social', color: '#e879f9', emoji: '🤝' },
  { id: 'other', label: 'Other', color: '#64748b', emoji: '📌' },
];

export function getCurrentSlotId() {
  const now = new Date();
  const h = now.getHours();
  const m = Math.floor(now.getMinutes() / 15) * 15;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function exportAllData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : {};
  const payload = {
    version: 1,
    exportDate: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeflow-backup-${getToday()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDateObj(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: formatDateObj(mon), end: formatDateObj(sun) };
}

export function getMonthRange(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: formatDateObj(start), end: formatDateObj(end) };
}

export function getDatesBetween(startStr, endStr) {
  const dates = [];
  const cur = new Date(startStr + 'T12:00:00');
  const end = new Date(endStr + 'T12:00:00');
  while (cur <= end) {
    dates.push(formatDateObj(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function loadDateRange(startStr, endStr) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const dates = getDatesBetween(startStr, endStr);
  const result = {};
  dates.forEach(d => {
    const dayData = all[d];
    result[d] = dayData?.entries || [];
  });
  return result;
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.data || typeof parsed.data !== 'object' || parsed.version == null) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
        resolve();
      } catch {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
