
import React, { useState } from 'react';
import { Transaction, Category, TransactionType, Method, Account } from '../types';

interface TransactionManagerProps {
  type: TransactionType;
  transactions: Transaction[];
  categories: Category[];
  methods: Method[];
  accounts: Account[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({
  type,
  transactions,
  categories,
  methods,
  accounts,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState<string>('');
  const [isTransfer, setIsTransfer] = useState(false);

  const activeType = isTransfer ? 'TRANSFER' : type;

  const filteredTransactions = transactions
    .filter(t => t.type === type || (isTransfer && t.type === 'TRANSFER'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const filteredCategories = categories.filter(c => c.type === type);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !accountId) return;
    if (!isTransfer && (!categoryId || !methodId)) return;
    if (isTransfer && !targetAccountId) return;

    onAddTransaction({
      type: activeType,
      amount: parseInt(amount),
      categoryId: isTransfer ? undefined : categoryId,
      methodId: isTransfer ? undefined : methodId,
      accountId,
      targetAccountId: isTransfer ? targetAccountId : undefined,
      memo: memo || (isTransfer ? '계좌 이체' : filteredCategories.find(c => c.id === categoryId)?.name || ''),
      date: new Date(date).toISOString()
    });

    setAmount('');
    setCategoryId('');
    setMethodId('');
    setAccountId('');
    setTargetAccountId('');
    setMemo('');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{type === 'INCOME' ? '수입' : '지출'} 관리</h1>
          <p className="text-slate-500 mt-1">자산의 흐름을 꼼꼼하게 기록하세요.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setIsTransfer(false)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${!isTransfer ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            기록
          </button>
          <button 
            onClick={() => setIsTransfer(true)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${isTransfer ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            이체
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-8">
            <h3 className="text-xl font-black text-slate-800 mb-6">{isTransfer ? '계좌 이체' : '새 내역 입력'}</h3>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">날짜</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">금액 (원)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-bold" required />
              </div>

              {isTransfer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">출금</label>
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">선택</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">입금</label>
                    <select value={targetAccountId} onChange={(e) => setTargetAccountId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">선택</option>
                      {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{type === 'INCOME' ? '입금 계좌' : '출금 계좌'}</label>
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">계좌 선택</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">종류</label>
                      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">선택</option>
                        {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">수단</label>
                      <select value={methodId} onChange={(e) => setMethodId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">선택</option>
                        {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">메모</label>
                <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="선택 사항" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" />
              </div>
              <button type="submit" className={`w-full py-4 rounded-2xl text-white font-black transition-all shadow-lg active:scale-95 mt-2 ${isTransfer ? 'bg-blue-600 shadow-blue-200' : type === 'INCOME' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                {isTransfer ? '이체 실행' : '기록하기'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{isTransfer ? '최근 이체 내역' : '최근 거래 내역'}</h3>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DESCENDING ORDER</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">날짜</th>
                    <th className="px-8 py-4">{isTransfer ? '이체 경로' : '종류 / 수단'}</th>
                    <th className="px-8 py-4">메모</th>
                    <th className="px-8 py-4 text-right">금액</th>
                    <th className="px-8 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-8 py-5">
                        {t.type === 'TRANSFER' ? (
                          <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                            <span className="bg-blue-50 px-2 py-1 rounded-lg">{accounts.find(a => a.id === t.accountId)?.name}</span>
                            <i className="fas fa-arrow-right text-[10px] text-blue-300"></i>
                            <span className="bg-blue-50 px-2 py-1 rounded-lg">{accounts.find(a => a.id === t.targetAccountId)?.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] w-fit px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-black">{categories.find(c => c.id === t.categoryId)?.name || '기타'}</span>
                            <span className="text-[10px] font-bold text-slate-400 ml-1">{methods.find(m => m.id === t.methodId)?.name || '-'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-800">{t.memo}</td>
                      <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'INCOME' ? 'text-emerald-600' : t.type === 'EXPENSE' ? 'text-rose-600' : 'text-slate-600'}`}>
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-8 py-5">
                        <button onClick={() => onDeleteTransaction(t.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                          <i className="fas fa-inbox text-4xl mb-2 text-slate-400"></i>
                          <p className="text-sm font-bold text-slate-400">표시할 내역이 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;
