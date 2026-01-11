
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';

interface CalendarViewProps {
  transactions: Transaction[];
  categories: Category[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, categories }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatCurrency = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  const dailyStats = useMemo(() => {
    const stats: Record<string, { income: number, expense: number, items: Transaction[] }> = {};
    
    transactions.forEach(t => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      if (!stats[dateStr]) {
        stats[dateStr] = { income: 0, expense: 0, items: [] };
      }
      if (t.type === 'INCOME') stats[dateStr].income += t.amount;
      else if (t.type === 'EXPENSE') stats[dateStr].expense += t.amount;
      stats[dateStr].items.push(t);
    });
    
    return stats;
  }, [transactions]);

  const calendarDays = [];
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-28 md:h-36 bg-slate-50/30"></div>);
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    const stats = dailyStats[dateStr];
    const isToday = new Date().toDateString() === dateObj.toDateString();
    const isSelected = selectedDate === dateStr;

    calendarDays.push(
      <div 
        key={d} 
        onClick={() => setSelectedDate(dateStr)}
        className={`h-28 md:h-36 p-3 border-t border-r border-slate-100 cursor-pointer transition-all hover:bg-blue-50/50 flex flex-col group ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 z-10' : 'bg-white'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
            {d}
          </span>
          {stats?.items.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {stats?.income > 0 && (
            <p className="text-[10px] font-black text-emerald-600 truncate bg-emerald-50 px-1.5 py-0.5 rounded-md">
              +{formatCurrency(stats.income)}
            </p>
          )}
          {stats?.expense > 0 && (
            <p className="text-[10px] font-black text-rose-600 truncate bg-rose-50 px-1.5 py-0.5 rounded-md">
              -{formatCurrency(stats.expense)}
            </p>
          )}
        </div>
      </div>
    );
  }

  const selectedTransactions = selectedDate ? dailyStats[selectedDate]?.items || [] : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">지출 달력</h1>
          <p className="text-slate-500 mt-1">월별 현금 흐름을 시각적으로 파악하세요.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-[1.25rem] p-1.5 shadow-sm items-center">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600"><i className="fas fa-chevron-left text-sm"></i></button>
          <div className="px-6 font-black text-slate-800 min-w-[140px] text-center text-sm uppercase tracking-widest">
            {year}. {month + 1}
          </div>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600"><i className="fas fa-chevron-right text-sm"></i></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
              <div key={d} className={`py-4 text-center text-[10px] font-black tracking-widest ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-slate-100">
            {calendarDays}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-full min-h-[500px]">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <i className="fas fa-list-ul text-blue-600 text-sm"></i>
              {selectedDate ? `${selectedDate.split('-')[2]}일 상세` : '날짜 선택'}
            </h3>
            
            <div className="space-y-4">
              {selectedTransactions.length > 0 ? selectedTransactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="p-5 border border-slate-50 rounded-[1.75rem] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 font-black uppercase tracking-wider">
                        {cat?.name || '기타'}
                      </span>
                      <span className={`text-xs font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-700 truncate mb-1">{t.memo}</p>
                    {t.type === 'TRANSFER' && (
                       <span className="text-[9px] font-bold text-blue-400 italic">계좌 이체</span>
                    )}
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <i className="fas fa-fingerprint text-4xl mb-3 text-slate-400"></i>
                  <p className="text-sm font-bold text-slate-400">내역이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
