import { useState, useEffect, useCallback, useReducer } from 'react';
import Header from './components/Header';
import TimeLog from './components/TimeLog';
import Analytics from './components/Analytics';
import { getToday, loadDayData, saveDayData, generateTimeSlots } from './utils/storage';
import './App.css';

function App() {
  const [view, setView] = useState('log');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [entries, setEntries] = useState([]);
  const [reloadKey, forceReload] = useReducer(x => x + 1, 0);

  // Load data for selected date
  useEffect(() => {
    const data = loadDayData(selectedDate);
    const slots = generateTimeSlots();

    // Ensure all slots have an entry object
    const entryMap = {};
    (data.entries || []).forEach(e => { entryMap[e.slotId] = e; });

    const fullEntries = slots.map(s => entryMap[s.id] || { slotId: s.id, activity: '', category: '' });
    setEntries(fullEntries);
  }, [selectedDate, reloadKey]);

  const handleSave = useCallback((slotId, { activity, category }) => {
    setEntries(prev => {
      const updated = prev.map(e =>
        e.slotId === slotId ? { ...e, activity, category } : e
      );

      // Persist to localStorage
      const toSave = updated.filter(e => e.activity);
      saveDayData(selectedDate, { date: selectedDate, entries: toSave });

      return updated;
    });
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-surface-950">
      <Header
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onDataImported={forceReload}
      />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-8">
        {view === 'log' ? (
          <TimeLog entries={entries} onSave={handleSave} />
        ) : (
          <Analytics entries={entries} />
        )}
      </main>
    </div>
  );
}

export default App;
