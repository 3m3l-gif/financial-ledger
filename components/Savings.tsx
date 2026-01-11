
import React, { useState } from 'react';
import { SavingsGoal, Transaction, Category } from '../types';

interface SavingsProps {
  goals: SavingsGoal[];
  transactions: Transaction[];
  categories: Category[];
  onAddGoal: (g: Omit<SavingsGoal, 'id' | 'order'>) => void;
  onUpdateGoal: (id: string, newAmount: number, transType: 'INCOME' | 'EXPENSE', amountChange: number) => void;
  onDeleteGoal: (id: string) => void;
  onReorderGoals: (newGoals: SavingsGoal[]) => void;
}

const Savings: React.FC<SavingsProps> = ({ goals, transactions, categories, onAddGoal, onUpdateGoal, onDeleteGoal, onReorderGoals }) => {
  const [purpose, setPurpose] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !targetAmount) return;
    onAddGoal({
      purpose,
      targetAmount: parseInt(targetAmount),
      currentAmount: parseInt(currentAmount) || 0,
    });
    setPurpose('');
    setTargetAmount('');
    setCurrentAmount('0');
    setShowAddForm(false);
  };

  const moveGoal = (index: number, direction: 'up' | 'down') => {
    const newGoals = [...goals];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGoals.length) return;
    
    [newGoals[index], newGoals[targetIndex]] = [newGoals[targetIndex], newGoals[index]];
    onReorderGoals(newGoals);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">저축 목표</h1>
          <p className="text-slate-500 mt-1">당신의 소중한 꿈을 위해 자금을 모아보세요.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-8 py-4 bg-blue-600 text-white rounded-[1.25rem] font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-100 active:scale-95"
        >
          <i className="fas fa-plus"></i>
          새 목표 추가
        </button>
      </header>

      {showAddForm && (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-50 border border-blue-50 max-w-2xl mx-auto animate-in zoom-in-95">
          <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
               <i className="fas fa-flag"></i>
             </div>
             새로운 꿈 설정
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">목표 명칭</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="예: 아이슬란드 여행, 새 노트북"
                className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">목표 금액 (원)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">현재 저축액 (원)</label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all">저장하기</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all">취소</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {goals.map((goal, index) => {
          const progress = Math.min(100, Math.floor((goal.currentAmount / goal.targetAmount) * 100));
          const goalHistory = transactions
            .filter(t => t.savingsId === goal.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const isHistoryExpanded = expandedHistory === goal.id;

          return (
            <div key={goal.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-blue-50/50 transition-all group relative">
              <div className="absolute top-8 right-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                 <button onClick={() => moveGoal(index, 'up')} className="p-2 text-slate-300 hover:text-blue-600"><i className="fas fa-chevron-up text-sm"></i></button>
                 <button onClick={() => moveGoal(index, 'down')} className="p-2 text-slate-300 hover:text-blue-600"><i className="fas fa-chevron-down text-sm"></i></button>
                 <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-slate-300 hover:text-rose-600 ml-1"><i className="fas fa-trash-alt text-sm"></i></button>
              </div>

              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner">
                <i className="fas fa-piggy-bank text-2xl"></i>
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-1 truncate leading-tight">{goal.purpose}</h3>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-8">SAVING TARGET</p>

              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-[11px] font-black mb-2 px-1">
                    <span className="text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-400' : 'bg-blue-500 shadow-lg shadow-blue-200'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current</p>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Deposit / Withdraw Inputs */}
              <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <i className="fas fa-arrow-down absolute left-4 top-1/2 -translate-y-1/2 text-xs text-emerald-500"></i>
                    <input 
                      type="number" 
                      placeholder="입금" 
                      className="w-full text-xs font-bold border border-slate-100 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val) && val > 0) {
                            onUpdateGoal(goal.id, goal.currentAmount + val, 'INCOME', val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="relative flex-1">
                    <i className="fas fa-arrow-up absolute left-4 top-1/2 -translate-y-1/2 text-xs text-rose-500"></i>
                    <input 
                      type="number" 
                      placeholder="출금" 
                      className="w-full text-xs font-bold border border-slate-100 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val) && val > 0) {
                            onUpdateGoal(goal.id, goal.currentAmount - val, 'EXPENSE', val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* History Toggle */}
              <button 
                onClick={() => setExpandedHistory(isHistoryExpanded ? null : goal.id)}
                className="mt-6 text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 py-2.5 bg-blue-50/50 rounded-2xl transition-all uppercase tracking-widest"
              >
                <i className={`fas fa-history transition-all ${isHistoryExpanded ? 'rotate-180' : ''}`}></i>
                {isHistoryExpanded ? 'Close History' : 'View History'}
              </button>

              {/* History List */}
              {isHistoryExpanded && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar animate-in slide-in-from-top-2 duration-300">
                  {goalHistory.length > 0 ? goalHistory.map(h => (
                    <div key={h.id} className="flex justify-between items-center text-[11px] p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold">{new Date(h.date).toLocaleDateString()}</span>
                        <span className={`font-black uppercase text-[9px] px-2 py-0.5 rounded-full w-fit ${h.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {h.type === 'INCOME' ? 'Deposit' : 'Withdraw'}
                        </span>
                      </div>
                      <span className="font-black text-slate-800">{formatCurrency(h.amount)}</span>
                    </div>
                  )) : (
                    <p className="text-center text-[11px] text-slate-400 font-bold py-6">거래 내역이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && !showAddForm && (
          <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
              <i className="fas fa-piggy-bank text-4xl opacity-20"></i>
            </div>
            <p className="text-xl font-black">아직 설정된 저축 목표가 없습니다.</p>
            <p className="text-sm font-bold mt-2">새로운 꿈을 기록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Savings;
