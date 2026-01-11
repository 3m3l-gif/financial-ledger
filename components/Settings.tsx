
import React, { useState } from 'react';
import { Category, Method, Account, TransactionType } from '../types';

interface SettingsProps {
  categories: Category[];
  methods: Method[];
  accounts: Account[];
  onAddCategory: (c: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddMethod: (m: Omit<Method, 'id'>) => void;
  onUpdateMethod: (id: string, name: string) => void;
  onDeleteMethod: (id: string) => void;
  onAddAccount: (a: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, name: string) => void;
  onDeleteAccount: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  categories, methods, accounts,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddMethod, onUpdateMethod, onDeleteMethod,
  onAddAccount, onUpdateAccount, onDeleteAccount
}) => {
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (type: 'CAT' | 'MET' | 'ACC') => {
    if (!newName) return;
    if (type === 'CAT') {
      onAddCategory({ name: newName, type: catType, color: '#' + Math.floor(Math.random()*16777215).toString(16) });
    } else if (type === 'MET') {
      onAddMethod({ name: newName });
    } else {
      onAddAccount({ name: newName });
    }
    setNewName('');
  };

  const saveEdit = (type: 'CAT' | 'MET' | 'ACC') => {
    if (!editingId || !editValue) return;
    if (type === 'CAT') onUpdateCategory(editingId, editValue);
    else if (type === 'MET') onUpdateMethod(editingId, editValue);
    else onUpdateAccount(editingId, editValue);
    setEditingId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">분류 관리</h1>
        <p className="text-slate-500 mt-1">앱 전반에 사용되는 마스터 데이터를 관리합니다.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Account Settings */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-university text-blue-600 text-sm"></i>
            계좌 관리
          </h3>
          <div className="flex gap-2 mb-6">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="새 계좌 이름" className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={() => handleAdd('ACC')} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">추가</button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl group transition-all">
                {editingId === a.id ? (
                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveEdit('ACC')} onKeyDown={e => e.key === 'Enter' && saveEdit('ACC')} className="flex-1 px-3 py-1.5 border border-blue-200 rounded-xl text-sm font-bold outline-none" />
                ) : (
                  <span className="text-sm font-black text-slate-700">{a.name}</span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => {setEditingId(a.id); setEditValue(a.name);}} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                  <button onClick={() => onDeleteAccount(a.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Settings */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-tags text-blue-600 text-sm"></i>
              종류 설정
            </h3>
            <div className="flex bg-slate-100 p-1.5 rounded-xl text-[10px] font-black tracking-widest">
              <button onClick={() => setCatType('INCOME')} className={`px-4 py-2 rounded-lg transition-all ${catType === 'INCOME' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>INCOME</button>
              <button onClick={() => setCatType('EXPENSE')} className={`px-4 py-2 rounded-lg transition-all ${catType === 'EXPENSE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>EXPENSE</button>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="새 종류 이름" className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={() => handleAdd('CAT')} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">추가</button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
            {categories.filter(c => c.type === catType).map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl group transition-all">
                {editingId === c.id ? (
                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveEdit('CAT')} onKeyDown={e => e.key === 'Enter' && saveEdit('CAT')} className="flex-1 px-3 py-1.5 border border-blue-200 rounded-xl text-sm font-bold outline-none" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                    <span className="text-sm font-black text-slate-700">{c.name}</span>
                  </div>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => {setEditingId(c.id); setEditValue(c.name);}} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                  <button onClick={() => onDeleteCategory(c.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Method Settings */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-wallet text-blue-600 text-sm"></i>
            수단 설정
          </h3>
          <div className="flex gap-2 mb-6">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="새 수단 (카드 등)" className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={() => handleAdd('MET')} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">추가</button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
            {methods.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl group transition-all">
                {editingId === m.id ? (
                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveEdit('MET')} onKeyDown={e => e.key === 'Enter' && saveEdit('MET')} className="flex-1 px-3 py-1.5 border border-blue-200 rounded-xl text-sm font-bold outline-none" />
                ) : (
                  <span className="text-sm font-black text-slate-700">{m.name}</span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => {setEditingId(m.id); setEditValue(m.name);}} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                  <button onClick={() => onDeleteMethod(m.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
