import { useRef, useState } from 'react';
import { Clock, BarChart3, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import { exportAllData, importData } from '../utils/storage';

export default function Header({ view, setView, selectedDate, setSelectedDate, onDataImported }) {
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

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

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setImportStatus('success');
      onDataImported?.();
    } catch (err) {
      setImportStatus(err.message);
    }
    e.target.value = '';
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between">
        {/* Top row on mobile: logo + view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">TimeFlow</h1>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={exportAllData}
                title="Export backup"
                className="p-1.5 rounded-lg hover:bg-surface-800 active:bg-surface-700 transition-colors text-surface-400 hover:text-white"
              >
                <Download size={15} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import backup"
                className="p-1.5 rounded-lg hover:bg-surface-800 active:bg-surface-700 transition-colors text-surface-400 hover:text-white"
              >
                <Upload size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex sm:hidden items-center bg-surface-900 rounded-xl p-1">
            <button
              onClick={() => setView('log')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'log'
                  ? 'bg-surface-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <Clock size={13} />
              Log
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'analytics'
                  ? 'bg-surface-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              <BarChart3 size={13} />
              Stats
            </button>
          </div>
        </div>

        {/* Date navigation - full width on mobile */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-surface-800 active:bg-surface-700 transition-colors text-surface-400"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[120px] text-center ${
              isToday ? 'bg-primary-600/20 text-primary-400' : 'hover:bg-surface-800 text-surface-300'
            }`}
          >
            {isToday ? 'Today' : formatDate(selectedDate)}
          </button>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg hover:bg-surface-800 active:bg-surface-700 transition-colors text-surface-400"
            disabled={isToday}
          >
            <ChevronRight size={18} className={isToday ? 'opacity-30' : ''} />
          </button>
        </div>

        {/* Desktop-only view toggle */}
        <div className="hidden sm:flex items-center bg-surface-900 rounded-xl p-1">
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

      {/* Import status toast */}
      {importStatus && (
        <div className={`max-w-5xl mx-auto px-3 sm:px-4 pb-2`}>
          <div className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
            importStatus === 'success'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {importStatus === 'success' ? 'Data imported successfully!' : importStatus}
          </div>
        </div>
      )}
    </header>
  );
}
