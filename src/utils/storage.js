const STORAGE_KEY = 'timeflow_data';

export function getToday() {
  return new Date().toISOString().split('T')[0];
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
  { id: 'other', label: 'Other', color: '#64748b', emoji: '📌' },
];

export function getCurrentSlotId() {
  const now = new Date();
  const h = now.getHours();
  const m = Math.floor(now.getMinutes() / 15) * 15;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
