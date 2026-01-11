
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, Category, Account } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, accounts }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  // Monthly totals (Reset on 1st)
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === 'INCOME') income += t.amount;
        else if (t.type === 'EXPENSE') expense += t.amount;
      }
    });

    return { income, expense };
  }, [transactions, currentMonth, currentYear]);

  // Overall Balances (Persistent)
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach(a => balances[a.id] = 0);

    transactions.forEach(t => {
      if (t.type === 'INCOME') {
        balances[t.accountId] = (balances[t.accountId] || 0) + t.amount;
      } else if (t.type === 'EXPENSE') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
      } else if (t.type === 'TRANSFER') {
        balances[t.accountId] = (balances[t.accountId] || 0) - t.amount;
        if (t.targetAccountId) {
          balances[t.targetAccountId] = (balances[t.targetAccountId] || 0) + t.amount;
        }
      }
    });

    return balances;
  }, [transactions, accounts]);

  const totalBalance = Object.values(accountBalances).reduce((a: number, b: number) => a + b, 0);

  // Line Chart Data (Expense comparison)
  const chartData = useMemo(() => {
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data = [];

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthDays = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
    const maxDays = Math.max(days, prevMonthDays);

    let currentAccumulated = 0;
    let prevAccumulated = 0;

    for (let d = 1; d <= maxDays; d++) {
      const currentDayExpense = transactions
        .filter(t => t.type === 'EXPENSE' && new Date(t.date).getDate() === d && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

      const prevDayExpense = transactions
        .filter(t => t.type === 'EXPENSE' && new Date(t.date).getDate() === d && new Date(t.date).getMonth() === prevMonthDate.getMonth() && new Date(t.date).getFullYear() === prevMonthDate.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);

      currentAccumulated += currentDayExpense;
      prevAccumulated += prevDayExpense;

      const isPastOrToday = d <= now.getDate();

      data.push({
        day: d,
        '이번 달': isPastOrToday ? currentAccumulated : null,
        '지난 달': prevAccumulated
      });
    }

    return data;
  }, [transactions, currentMonth, currentYear, now]);

  const expenseDiff = useMemo(() => {
    const today = now.getDate();
    const cur = (chartData.find(d => d.day === today) as any)?.['이번 달'] || 0;
    const prev = (chartData.find(d => d.day === today) as any)?.['지난 달'] || 0;
    const diff = cur - prev;
    return { diff, percent: prev === 0 ? 0 : Math.round((diff / prev) * 100) };
  }, [chartData, now]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">대시보드</h1>
        <p className="text-slate-500 mt-1">{currentYear}년 {currentMonth + 1}월 현황</p>
      </header>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">이번 달 수입</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">이번 달 지출</p>
          <p className="text-2xl font-black text-rose-600">{formatCurrency(stats.expense)}</p>
        </div>
        <div className="bg-blue-600 p-7 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">총 자산 잔액</p>
            <p className="text-3xl font-black">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
            {accounts.map(a => (
              <div key={a.id} className="px-4 py-1.5 bg-white/20 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-sm border border-white/10">
                {a.name}: {formatCurrency(accountBalances[a.id] || 0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Chart Comparison */}
      <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">지출 추이 비교</h3>
            <p className="text-sm text-slate-500">지난달 동기 대비 지출 흐름</p>
          </div>
          <div className={`px-5 py-3 rounded-2xl text-xs font-black ${expenseDiff.diff > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            지난달 오늘까지보다 {formatCurrency(Math.abs(expenseDiff.diff))} ({Math.abs(expenseDiff.percent)}%) {expenseDiff.diff > 0 ? '초과 지출' : '절약'}
          </div>
        </div>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                // Fix: explicit cast of Number(val) to number to resolve 'unknown' type error
                formatter={(val: any) => formatCurrency(Number(val) as number)}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
              <Line type="monotone" dataKey="지난 달" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="이번 달" stroke="#2563eb" strokeWidth={5} dot={{r: 5, fill: '#2563eb', strokeWidth: 3, stroke: '#fff'}} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">수입 종류 구성</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories.filter(c => c.type === 'INCOME').map(c => ({
                  name: c.name,
                  value: transactions.filter(t => t.type === 'INCOME' && t.categoryId === c.id && new Date(t.date).getMonth() === currentMonth).reduce((s, t) => s + t.amount, 0),
                  color: c.color
                })).filter(i => i.value > 0)} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                  {categories.filter(c => c.type === 'INCOME').map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">지출 종류 구성</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories.filter(c => c.type === 'EXPENSE').map(c => ({
                  name: c.name,
                  value: transactions.filter(t => t.type === 'EXPENSE' && t.categoryId === c.id && new Date(t.date).getMonth() === currentMonth).reduce((s, t) => s + t.amount, 0),
                  color: c.color
                })).filter(i => i.value > 0)} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                  {categories.filter(c => c.type === 'EXPENSE').map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
