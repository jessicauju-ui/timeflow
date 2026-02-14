import { Clock, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header({ view, setView, selectedDate, setSelectedDate }) {
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const changeDate = (dir) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">TimeFlow</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors text-surface-400"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isToday ? 'bg-primary-600/20 text-primary-400' : 'hover:bg-surface-800 text-surface-300'
            }`}
          >
            {isToday ? 'Today' : formatDate(selectedDate)}
          </button>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors text-surface-400"
            disabled={isToday}
          >
            <ChevronRight size={18} className={isToday ? 'opacity-30' : ''} />
          </button>
        </div>

        <div className="flex items-center bg-surface-900 rounded-xl p-1">
          <button
            onClick={() => setView('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'log'
                ? 'bg-surface-700 text-white shadow-sm'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            <Clock size={15} />
            Log
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'analytics'
                ? 'bg-surface-700 text-white shadow-sm'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            <BarChart3 size={15} />
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
}
